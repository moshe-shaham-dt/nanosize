import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import AWS = require('aws-sdk');


export async function main(
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {

    console.log("triggered post lambda", event);
    const apigateway = new AWS.APIGateway();
    const s3 = new AWS.S3();

    const swaggerExport = await apigateway.getExport({
        restApiId: process.env.API_ID!,
        exportType: 'oas30',
        stageName: 'prod'
    }).promise();

    const openApiJson = JSON.parse(swaggerExport.body!.toString());
    for (const path in openApiJson.paths) {
        delete openApiJson.paths[path].options;
    }
    for (const server of openApiJson.servers) {
        if (server.variables?.basePath?.default) {
            server.variables.basePath.default = server.variables.basePath.default.replace(/^\//, '');
        }
    }

    await s3.putObject({
        Bucket: process.env.BUCKET!,
        Key: "openapi.json",
        Body: JSON.stringify(openApiJson)
    }).promise();

    const cloudfront = new AWS.CloudFront();
    await cloudfront.createInvalidation({
        DistributionId: process.env.DISTRIBUTION_ID!,
        InvalidationBatch: {
            CallerReference: '' + new Date().getTime(),
            Paths: {
                Quantity: 1,
                Items: ['/openapi.json']
            }
        }
    }).promise();

    console.log(swaggerExport.body?.toString());

    return {
        body: JSON.stringify({message: 'Successful lambda invocation!'}),
        statusCode: 200,
    };
}