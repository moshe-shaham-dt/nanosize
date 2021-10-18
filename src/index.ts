import {APIStructure, Body, Controller, FunctionParam, GET, Model, POST, QueryParameter, PathParameter } from './decorators';
import {generateSwaggerUI} from "./generate-schemas";
import {addLambdaFunctions} from "./add-lambdas";

const ApiResources = {
    addLambdaFunctions,
    generateSwaggerUI
}
export {
    GET,
    POST,
    QueryParameter,
    PathParameter,
    Body,
    Controller,
    Model,
    FunctionParam,
    APIStructure,
    ApiResources
}