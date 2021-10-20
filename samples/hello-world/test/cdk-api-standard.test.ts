import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CdkApiStandard from '../lib/cdk-api-standard-stack';
import { QuestionController } from '../src/questions/question.controller';
import {createConnection, getConnection} from "typeorm";
import {Question} from "../src/questions/question.entiy";

test('getQuestionById', async () => {
    process.env.PGUSER='postgres';
    process.env.PGHOST = 'test-db-api.cojczvelvcse.eu-west-1.rds.amazonaws.com';
    process.env.PGPASSWORD = 'halumi52';
    process.env.PGDATABASE = 'test1';

    let conn;
    try {
        console.log("getting connection");
        conn = getConnection();
        console.log("typeorm - reusing connection")
    } catch (e) {
        console.log("typeorm - error getting connection", e.message);
        conn = await createConnection({
            type: "postgres",
            host: process.env.PGHOST,
            port: 5432,
            username: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            entities: [
                Question
            ],
            synchronize: true,
            logging: false
        });
    }
    console.log("got connection");

    const questionController = new QuestionController();
    const response = await questionController.getQuestionById();
    console.log(response);
});
test('addQuestion', async () => {
    // const questionController = new QuestionController();
    // const response = await questionController.addQuestion("cachstring", {
    //     questionId: "sssw"
    // });
    // console.log(response);
    // expect(response).toHaveProperty('exField');
});
