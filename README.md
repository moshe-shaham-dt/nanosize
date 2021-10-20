# Nanosize

#### Minimalist typescript framework for CDK + Lambda API development


Nanosize is an opinionated framework to quickly build and configure APIs that run on AWS Lambda.

### How quickly?

This is all you need to write in order to create a new endpoint:

```
@Controller('/todo')
export class TodoController {
    @POST('/{id}', {
        responseModel: TodoResponse
    })
    async addTodo(
        @PathParameter('id') id: string,
        @QueryParameter('cache') cache: string,
        @User user: userEntity.User,
        @Body request: TodoRequest
    ): Promise<TodoResponse> {
        const todo = new Todo();
        todo.body = request.body;
        todo.created = new Date();
        await todo.save();
        return todo;
    }
}
```

This will automagically create:

- **Lambda** function that runs your code
- **API Gateway** resource that triggers the lambda
- **Cognito** authentication and forward user object to function
- Connection to **Database** (currently PostgreSQL) via TypeORM to save your Todo entity
- **Request validation** according to your function parameters
- **OpenAPI** json file, together with **Swagger UI** in S3 bucket

### Getting Started

```
npm i nanosize -g

nanosize new project-name
```

This will initiate a "Hello World" cdk project ready to be deployed using `cdk deploy`.

Notes:

- You need to give your database credentials (VPC support is coming)
- By default the stack creates a new cognito pool, but this can be customized.


### Development cycle

The opinionated decision of this framework is not to even try to run lambdas locally. Instead, test function logic only by using Jest testing framework.


### Roadmap

This is alpha release (or even POC), there are many known issues and plans to support different opinions and flavors...

You are more than welcome to contribute.