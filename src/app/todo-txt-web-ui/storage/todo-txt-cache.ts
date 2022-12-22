import { TodoTxtConfig } from "./todo-txt-config";
import { TodoTxtTask } from "../tasks/todo-txt-task";

export interface TodoTextCache {
    tasks: TodoTxtTask[];
    config: TodoTxtConfig;
}
