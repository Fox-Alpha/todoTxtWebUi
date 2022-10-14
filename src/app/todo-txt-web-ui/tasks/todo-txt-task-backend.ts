import { TodoTxtTask } from "./todo-txt-task";
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";

@Injectable()
export class TodoTxtTaskBackend {
    constructor(private http: HttpClient) { }

    async appendTask(text: string) {
      const result = await this.http.post('http://localhost:3000/v1/appendTask', {
        text
      }).toPromise();
      return result as TodoTxtTask;
    }

    async updateTask(id: number, text: string) {
      const result = await this.http.post('http://localhost:3000/v1/updateTask', {
        id,
        text
      }).toPromise();
      return result as TodoTxtTask;
    }

    async createTasks(texts: string[]) {
      const result = await this.http.post('http://localhost:3000/v1/createTasks', {
        texts
      }).toPromise();
      return result as TodoTxtTask[];
    }

    async loadTasks() {
      const result = await this.http.get('http://localhost:3000/v1/loadTasks').toPromise();
      return result as TodoTxtTask[];
    }

    async removeTasks() {
      await this.http.delete('http://localhost:3000/v1/removeTasks').toPromise();
    }
}
