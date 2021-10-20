import {Body, Controller, GET, POST, QueryParameter, PathParameter, User, IUser} from "nanosize";
import * as userEntity from "../users/user.entity";
import {TodoRequest, TodoResponse} from "./todo.model";
import {Todo} from "./todo.entity";

@Controller('/todos')
export class TodosController {

    @GET('/', {
        responseModel: TodoResponse
    })
    async getTodos(
        @QueryParameter('cache') cache: string,
    ): Promise<TodoResponse[]> {
        return await Todo.find();
    }

    @GET('/{id}', {
        responseModel: TodoResponse
    })
    async getTodo(
        @PathParameter('id') id: string
    ): Promise<TodoResponse> {
        const todo = await Todo.findOne(id);
        if (!todo) {
            throw new Error("Not found");
        }
        return todo;
    }

    @POST('/', {
        responseModel: TodoResponse
    })
    async addTodo(
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
