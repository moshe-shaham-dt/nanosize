import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import { FunctionParam } from './decorators';
// import * as handlers from '../src/questions/question.controller';

export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log(event);

  const controllerClass = process.env.CONTROLLER_CLASS!;
  const controllerMethod = process.env.CONTROLLER_METHOD!;

  const parameters: FunctionParam[] = JSON.parse(process.env.PARAMETERS!);
  const funcArguments: any[] = [];
  if (parameters) {
    parameters.sort((a, b) => a.argumentIndex - b.argumentIndex);
    console.log(parameters);
    for (const parameter of parameters) {
      if (parameter.parameterType === 'QUERY_STRING') {
        funcArguments.push(event.queryStringParameters![parameter.parameterName!]);
      } else if (parameter.parameterType === 'PAYLOAD') {
        funcArguments.push(JSON.parse(event.body!));
      }
    }
  }
  
  // const controller = new (<any>handlers)[controllerClass]();
  // const response = await controller[controllerMethod](...funcArguments);

  const response = {
    aaa: "how do i get to " + controllerClass
  }

  // const response = await new QuestionController().getQuestionByID();

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