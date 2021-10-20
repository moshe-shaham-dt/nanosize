import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import {ApiResources} from "nanosize";
import * as path from "path";
import {TodosController} from "../src/todos/todo.controller";
import {createUserPoolAuthenticator} from "./cognito-stack";

export class CdkApiStandardStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new TodosController();

    const auth = createUserPoolAuthenticator(this);

    ApiResources.setConfig({
      database: {
        host: '<your-host>',
        user: '<your-username>',
        password: '<your-password>',
        database: '<your-database>',
      }
    });

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My Service",
      description: "This service serves servings.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    const handlerPath = path.join(__dirname, '/api-main-handler.ts');
    ApiResources.addLambdaFunctions(this, api, handlerPath, auth).then(async () => {
      await ApiResources.generateSwaggerUI(this, api);
    })
  }
}
