import {APIStructure, Body, Controller, FunctionParam, GET, Model, POST, QueryParameter } from './decorators';
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
    Body,
    Controller,
    Model,
    FunctionParam,
    APIStructure,
    ApiResources
}