import "reflect-metadata";

export interface FunctionParam {
  parameterType: 'QUERY_STRING' | 'PATH' | 'PAYLOAD',
  valueType: 'string',
  argumentIndex: number;
  parameterName?: string;
}

export interface FunctionMetadata {
  controller: string;
  controllerMethod: string;
  method: string;
  path: string;
  responseModel?: string;
  requestModel?: string;
  queryParams?: {[key: string]: boolean};
  paramsTypes?: string[];
}
export interface FunctionOptions {
  responseModel?: Function;
}

const models: string[] = [];
const controllers: {[key: string]: string} = {}
const functions: FunctionMetadata[] = [];
const params: {[key: string]: FunctionParam[]} = {}

export const Model = (constructor: Function) => {
    console.log("model running", constructor.name);
    models.push(constructor.name);
}

export const Controller = (urlPath: string) => {
  return (constructor: Function) => {
    console.log("controller running", urlPath, constructor.name);
    controllers[constructor.name] = urlPath;
  }
}

const addParam = (func: string, paramDefinition: FunctionParam) => {
  if (!params[func]) {
    params[func] = [];
  }
  params[func].push(paramDefinition);
}
export const Body = (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
  addParam(`${target.constructor.name}_${String(propertyKey)}`, {
    argumentIndex: parameterIndex,
    parameterType: 'PAYLOAD',
    valueType: 'string'
  })
}
export const QueryParameter = (name: string) => {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    addParam(`${target.constructor.name}_${String(propertyKey)}`, {
      argumentIndex: parameterIndex,
      parameterType: 'QUERY_STRING',
      valueType: 'string',
      parameterName: name
    })
  }
}

const httpMethodDecorator = (method: string, urlPath: string, options?: FunctionOptions) => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const typeData = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        functions.push({
          controller: target.constructor.name,
          controllerMethod: propertyKey,
          method,
          path: urlPath,
          paramsTypes: typeData?.map((type: any) => type.name),
          responseModel: options?.responseModel?.name
        });
    };
}

export const GET = (urlPath: string, options?: FunctionOptions) => {
  return httpMethodDecorator('GET', urlPath, options)
}
export const POST = (urlPath: string, options?: FunctionOptions) => {
  return httpMethodDecorator('POST', urlPath, options)
}

export const APIStructure = {
  models,
  functions,
  params,
  controllers
}