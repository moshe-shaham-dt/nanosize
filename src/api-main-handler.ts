import {Connection, createConnection, getConnection} from "typeorm";
import {APIGatewayProxyEvent} from "aws-lambda";
import { FunctionParam } from "./decorators";

export const MainHandler = {
  getDatabaseConnection: async (entities: Function[]): Promise<Connection> => {
    let conn: Connection;
    try {
      console.log("getting connection");
      conn = getConnection();
      console.log("typeorm - reusing connection")
    } catch (e: any) {
      console.log("typeorm - error getting connection", e?.message);
      conn = await createConnection({
        type: "postgres",
        host: process.env.PGHOST,
        port: 5432,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities,
        synchronize: true,
        logging: false
      });
    }
    console.log("got connection", conn.isConnected);
    return conn;
  },

  getFunctionParameters: async (event: APIGatewayProxyEvent, getOrCreateUser: Function) => {
    const funcArguments: any[] = [];
    if (process.env.PARAMETERS) {
      const parameters: FunctionParam[] = JSON.parse(process.env.PARAMETERS);
      if (parameters) {
        parameters.sort((a, b) => a.argumentIndex - b.argumentIndex);
        for (const parameter of parameters) {
          switch (parameter.parameterType) {
            case 'QUERY_STRING':
              funcArguments.push(event.queryStringParameters![parameter.parameterName!]);
              break;
            case 'PAYLOAD':
              funcArguments.push(JSON.parse(event.body!));
              break;
            case 'PATH':
              funcArguments.push(event.pathParameters![parameter.parameterName!]);
              break;
            case 'USER':
              funcArguments.push(await getOrCreateUser({
                id: event.requestContext.authorizer?.claims.sub,
                email: event.requestContext.authorizer?.claims.email,
              }));
              break;
          }
        }
      }
    }
    return funcArguments;
  }
}