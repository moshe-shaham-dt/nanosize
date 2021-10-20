import * as cognito from "@aws-cdk/aws-cognito";
import * as cdk from "@aws-cdk/core";
import {Construct} from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";

export const createUserPoolAuthenticator = (scope: Construct) => {
    const userPool = new cognito.UserPool(scope, 'userpool2', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        selfSignUpEnabled: true,
        signInAliases: {email: true},
        autoVerify: {email: true},
        passwordPolicy: {
            minLength: 6,
            requireLowercase: false,
            requireDigits: false,
            requireUppercase: false,
            requireSymbols: false,
        },
        accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    const userPoolClient = new cognito.UserPoolClient(scope, 'userpool-client', {
        userPool,
        authFlows: {
            adminUserPassword: true,
            userPassword: true,
            custom: true,
            userSrp: true,
        },
        supportedIdentityProviders: [
            cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
    });

    return new apigateway.CognitoUserPoolsAuthorizer(scope, 'booksAuthorizer', {
        cognitoUserPools: [userPool]
    });
}

