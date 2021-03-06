import * as cdk from "@aws-cdk/core";
import {CognitoUserPoolsAuthorizer, IResource, Resource, RestApi} from "@aws-cdk/aws-apigateway";
import {getApiModels} from "./api-models";
import {APIStructure, FunctionParam} from "./decorators";
import {NodejsFunction, NodejsFunctionProps} from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {Config} from "./config";

export const addLambdaFunctions = async (scope: cdk.Construct, api: RestApi, handlerPath: string, auth: CognitoUserPoolsAuthorizer,
                                         lambdaOptions: Partial<NodejsFunctionProps>) => {
    const resources: {[key: string]: Resource} = {};
    const apiModels = await getApiModels(api);
    const validator = api.addRequestValidator("validate-request", {
        requestValidatorName: "request-validator",
        validateRequestBody: true,
        validateRequestParameters: true,
    });

    for (const func of APIStructure.functions) {
        const params = APIStructure.params[`${func.controller}_${func.controllerMethod}`];
        const lambdaFunc = new NodejsFunction(scope, func.controllerMethod + '-func', {
            memorySize: 256,
            timeout: cdk.Duration.seconds(90),
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'main',
            entry: handlerPath,
            environment: {
                CONTROLLER_CLASS: func.controller,
                CONTROLLER_METHOD: func.controllerMethod,
                RESPONSE_MODEL: func.responseModel || '',
                PARAMETERS: JSON.stringify(params),
                DB_HOST: Config.database?.host!,
                DB_USER: Config.database?.user!,
                DB_PASSWORD: Config.database?.password!,
                DB_DATABASE: Config.database?.database!,
            },
            bundling: {
                // pg-native is not available and won't be used. This is letting the
                // bundler (esbuild) know pg-native won't be included in the bundled JS
                // file.
                externalModules: ['pg-native']
            },
            ...lambdaOptions,
        });

        const getQuestionsIntegration = new apigateway.LambdaIntegration(lambdaFunc, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });

        const requestParameters = params?.reduce((queryStringDict: any, param: FunctionParam) => {
            if (param.parameterType === 'QUERY_STRING') {
                queryStringDict['method.request.querystring.' + param.parameterName] = true;
            }
            return queryStringDict;
        }, {});

        const requestModelName = params ? func.paramsTypes![params.find(item => item.parameterType === 'PAYLOAD')?.argumentIndex!] : undefined;

        const controllerPathParts = APIStructure.controllers[func.controller].split('/').filter(i => i);
        const funcPathParts = func.path.split('/').filter(i => i);
        const resourceParts = controllerPathParts.concat(funcPathParts);

        let currentResource: IResource = api.root;
        let currentPath = '';
        for (const resourceName of resourceParts) {
            currentPath += '/' + resourceName;
            if (!resources[currentPath]) {
                resources[currentPath] = currentResource.addResource(resourceName);
            }
            currentResource = resources[currentPath];
        }

        currentResource.addMethod(func.method, getQuestionsIntegration, {
            requestModels: requestModelName ? {
                'application/json': apiModels[requestModelName]
            } : undefined,
            requestValidator: validator,
            requestParameters,
            methodResponses: [{
                statusCode: '200',
                responseModels: func.responseModel ? {
                    'application/json': apiModels[func.responseModel!]
                } : undefined
            }],
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
    }
}
