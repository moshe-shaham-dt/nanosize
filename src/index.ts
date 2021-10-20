import {APIStructure, Body, Controller, FunctionParam, GET, Model, POST, QueryParameter, PathParameter, User, IUser, PUT, DELETE } from './decorators';
import {generateSwaggerUI} from "./generate-schemas";
import {addLambdaFunctions} from "./add-lambdas";
import { MainHandler } from './api-main-handler';
import { Config, setConfig } from './config';

const ApiResources = {
    setConfig,
    addLambdaFunctions,
    generateSwaggerUI
}
export {
    GET,
    POST,
    PUT,
    DELETE,
    QueryParameter,
    PathParameter,
    Body,
    IUser,
    User,
    Controller,
    Model,
    FunctionParam,
    APIStructure,
    ApiResources,
    MainHandler,
}