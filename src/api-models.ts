import {JsonSchema, RestApi} from "@aws-cdk/aws-apigateway";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {Fn} from "@aws-cdk/core";
import {getSchemas, getSingleSchema} from "./generate-schemas";


const addSingleModel = (apiModels: {[key: string]: apigateway.Model}, api: RestApi, model: string, schema: any) => {
    if (apiModels[model]) return;
    if (model === 'ProfileResponse' || model === 'AnswerResponse')
        console.log(model, JSON.stringify(schema));
    apiModels[model] =  api.addModel(model, {
        contentType: 'application/json',
        modelName: model,
        schema: {
            schema: apigateway.JsonSchemaVersion.DRAFT4,
            title: model,
            enum: schema.enum,
            type: schema.type,
            properties: {...schema?.properties as ({ [key: string]: JsonSchema })},
            required: schema.required
        }
    });
}

const dealWithRef = async (api: RestApi, schemas: any, apiModels: any, ref: string) => {
    const refName = ref.split('/').pop()!;
    if (!schemas[refName]) {
        const singleSchema = await getSingleSchema(refName);
        addSingleModel(apiModels, api, refName, singleSchema);
    }
    return Fn.join(
        '',
        ['https://apigateway.amazonaws.com/restapis/',
            api.restApiId,
            '/models/',
            refName]);
}

export const getApiModels = async (api: RestApi): Promise<{[key: string]: apigateway.Model}> => {
    const schemas = await getSchemas();
    const apiModels: {[key: string]: apigateway.Model} = {};
    const dependencies: {[key: string]: string[]} = {};
    for (const model in schemas) {
        dependencies[model] = [];
        const schema = schemas[model];
        const props: {[key: string]: any} = schema?.properties!;
        for (const prop in props) {
            if (props[prop]['$ref']) {
                dependencies[model].push(props[prop]['$ref'].split('/').pop());
                props[prop]['$ref'] = await dealWithRef(api, schemas, apiModels, props[prop]['$ref']);
            } else if (props[prop].items && props[prop].items['$ref']) {
                dependencies[model].push(props[prop].items['$ref'].split('/').pop());
                props[prop].items['$ref'] = await dealWithRef(api, schemas, apiModels, props[prop].items['$ref']);
            }
        }
        addSingleModel(apiModels, api, model, schema);
    }
    for (const model in dependencies) {
        for (const modelDependency of dependencies[model]) {
            console.log("Adding dependency", model, modelDependency);
            apiModels[model].node.addDependency(apiModels[modelDependency]);
        }
    }
    return apiModels;
}