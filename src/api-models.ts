import {JsonSchema, RestApi} from "@aws-cdk/aws-apigateway";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {Fn} from "@aws-cdk/core";
import {getSchemas} from "./generate-schemas";

export const getApiModels = async (api: RestApi): Promise<{[key: string]: apigateway.Model}> => {
    const schemas = await getSchemas();
    const apiModels: {[key: string]: any} = {};
    for (const model in schemas) {
        const schema = schemas[model];
        const props: {[key: string]: any} = schema?.properties!;
        for (const prop in props) {
            if (props[prop]['$ref']) {
                props[prop]['$ref'] = Fn.join(
                    '',
                    ['https://apigateway.amazonaws.com/restapis/',
                        api.restApiId,
                        '/models/',
                        props[prop]['$ref'].split('/').pop()]);
            }
        }
        const apiModel = api.addModel(model, {
            contentType: 'application/json',
            modelName: model,
            schema: {
                schema: apigateway.JsonSchemaVersion.DRAFT4,
                title: model,
                type: apigateway.JsonSchemaType.OBJECT,
                properties: {...schema?.properties as ({ [key: string]: JsonSchema })},
                required: schema.required
            }
        });
        apiModels[model] = apiModel;
    }
    return apiModels;
}