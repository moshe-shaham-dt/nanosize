import * as TJS from "typescript-json-schema";
import glob from "glob-promise";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { IResource, JsonSchema, Resource, RestApi } from "@aws-cdk/aws-apigateway";
import { Fn, RemovalPolicy } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import { Bucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { Distribution } from "@aws-cdk/aws-cloudfront";
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as triggers from 'cdk-triggers';
import * as iam from '@aws-cdk/aws-iam';
import {APIStructure, FunctionParam} from "./index";
import {getApiModels} from "./api-models";

export const modelSchemas: {[key: string]: Promise<any>} = {};

const generatePromise = new Promise<TJS.Program>(async (resolve, reject) => {
    const files = await glob('src/**/*.ts');
    const program = TJS.getProgramFromFiles(
        files,
        {
            strictNullChecks: true,
            required: true,
        },
      );
    resolve(program);
});

export const getSchemas = async () => {
    const program = await generatePromise;
    const resolvedSchemas: {[key: string]: any} = {};
    for (const model of APIStructure.models) {
        resolvedSchemas[model] = TJS.generateSchema(program, model, {
            required: true
        });
    }
    return resolvedSchemas;
}


export const generateSwaggerUI = async (scope: cdk.Construct, api: RestApi) => {
    const bucket = new Bucket(scope, 'api-swagger-ui', {
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
    });
    new BucketDeployment(scope, 'api-swagger-ui-deployment', {
        sources: [Source.asset(path.join(__dirname, `/../swagger-dist`))],
        destinationBucket: bucket,
    });
    const distribution = new Distribution(scope, 'api-swagger-ui-dist', {
        defaultBehavior: {origin: new origins.S3Origin(bucket)},
        defaultRootObject: 'index.html',
    });

    const postTrigger = new NodejsFunction(scope, 'api-swagger-ui-post-trigger', {
        functionName: 'swagger-ui-post-trigger-' + new Date().getTime(),
        memorySize: 128,
        timeout: cdk.Duration.seconds(30),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'main',
        entry: path.join(__dirname, `/../src/post-trigger.ts`),
        environment: {
            API_ID: api.restApiId,
            BUCKET: bucket.bucketName,
            DISTRIBUTION_ID: distribution.distributionId,
        }
    });

    postTrigger.role?.attachInlinePolicy(
        new iam.Policy(scope, 'api-swagger-ui-trigger-lambda-policy', {
            statements: [new iam.PolicyStatement({
                actions: ['apigateway:*'],
                resources: ['*'],
            })],
        }),
    );
    postTrigger.role?.attachInlinePolicy(
        new iam.Policy(scope, 'api-swagger-ui-trigger-lambda-policy-cf', {
            statements: [new iam.PolicyStatement({
                actions: ['cloudfront:CreateInvalidation'],
                resources: ['*'],
            })],
        }),
    );
    postTrigger.role?.attachInlinePolicy(
        new iam.Policy(scope, 'api-swagger-ui-trigger-lambda-policy-s3', {
            statements: [new iam.PolicyStatement({
                actions: ['s3:*'],
                resources: [bucket.arnForObjects('*')],
            })],
        }),
    );
    new triggers.AfterCreate(scope, 'api-swagger-ui-post-trigger-triggers', {
        resources: [api],
        handler: postTrigger
    });
}


