import {APIStructure, Body, Controller, FunctionParam, GET, Model, POST, QueryParameter } from './decorators';
import {addLambdaFunctions, generateSwaggerUI} from "./generate-schemas";

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