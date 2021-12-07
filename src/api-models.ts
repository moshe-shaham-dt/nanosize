import {JsonSchema, RestApi} from "@aws-cdk/aws-apigateway";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {Fn} from "@aws-cdk/core";
import {getSchemas, getSingleSchema} from "./generate-schemas";


const addSingleModel = (api: RestApi, model: string, schema: any) => {
    // console.log("adding model", model, schema);
    // console.log("schema", schema.properties?.comments?.items);
    return api.addModel(model, {
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
        apiModels[refName] = addSingleModel(api, refName, singleSchema);
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
    const apiModels: {[key: string]: any} = {};
    for (const model in schemas) {
        const schema = schemas[model];
        const props: {[key: string]: any} = schema?.properties!;
        for (const prop in props) {
            if (props[prop]['$ref']) {
                console.log("geting ref", props[prop]['$ref']);
                props[prop]['$ref'] = await dealWithRef(api, schemas, apiModels, props[prop]['$ref']);
                console.log("got ref", props[prop]['$ref']);
            } else if (props[prop].items && props[prop].items['$ref']) {
                console.log("geting ref", props[prop].items['$ref']);
                props[prop].items['$ref'] = await dealWithRef(api, schemas, apiModels, props[prop].items['$ref']);
                console.log("got ref", props[prop].items['$ref']);
            }
        }
        apiModels[model] = addSingleModel(api, model, schema);
    }
    return apiModels;
}