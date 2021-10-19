# kull

#### Minimalist typescript framework for CDK + Lambda API development


kull is an opinionated framework to quickly build and configure APIs that run on AWS Lambda.

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
- Connection to **RDS database** to save your Todo entity
- **Request validation** according to your function parameters
- **OpenAPI** json file, together with **Swagger UI** in S3 bucket

### Getting Started

```
npm i kull -g

kull init project-name
```

This will initiate a "Hello World" cdk project ready to be deployed using `cdk deploy`.


### Development cycle

The opinionated decision of this framework is not to even try to run lambdas locally. Instead, test function logic only by using Jest testing framework.

