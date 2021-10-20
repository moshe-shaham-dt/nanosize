import {Model} from "nanosize";

@Model
export class TodoResponse {
    id: string;
    body: string;
    created: Date;
}

@Model
export class TodoRequest {
    body: string;
}