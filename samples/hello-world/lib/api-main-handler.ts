import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import "reflect-metadata";
import * as handlers from '../src/controller';
import { User } from '../src/users/user.entity';
import {UserService} from "../src/users/user.service";
import {MainHandler} from "nanosize";
import {Connection, createConnection, getConnection} from "typeorm";
import {Todo} from "../src/todos/todo.entity";

export async function main(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  console.log(event);

  const controllerClass = process.env.CONTROLLER_CLASS!;
  const controllerMethod = process.env.CONTROLLER_METHOD!;

  let conn: Connection;
  try {
    console.log("getting connection");
    conn = getConnection();
    console.log("typeorm - reusing connection")
  } catch (e) {
    console.log("typeorm - error getting connection", e?.message);
    conn = await createConnection({
      type: "postgres",
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Todo, User],
      synchronize: true,
      logging: false
    });
  }
  console.log("got connection", conn.isConnected);

  const funcArguments = MainHandler.getFunctionParameters(event, UserService.getOrCreate);

  const controller = new (<any>handlers)[controllerClass]();
  const response = await controller[controllerMethod](...funcArguments);

  return {
    body: JSON.stringify(response),
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Methods" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
    },
  };
}