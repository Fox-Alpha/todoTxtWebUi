import { TodoTxtTask } from "./todo-txt-task";
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";

@Injectable()
export class TodoTxtTaskParser {
    constructor(private http: HttpClient) { }

    async get(text: string): Promise<TodoTxtTask> {
      return (await this.getMany(text))[0];
    }

    async getMany(...tasks: string[]): Promise<TodoTxtTask[]> {
      const result = await this.http.post('http://localhost:3000/v1/saveTasks', {
        tasks
      }).toPromise();
      return result as TodoTxtTask[];
    }
}
