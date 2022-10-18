import { TodoTxtTask } from "./todo-txt-task";
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { TodoTxtFilter } from "./todo-txt-task-filter";

@Injectable()
export class TodoTxtTaskBackend {
    constructor(private http: HttpClient) { }

    async parseFilter(filter: string) {
      const result = await this.http.post(`${environment.apiHost}/v1/parseFilter`, {
        filter
      }).toPromise();
      return result as TodoTxtFilter;
    }

    async appendTask(text: string) {
      const result = await this.http.post(`${environment.apiHost}/v1/appendTask`, {
        text
      }).toPromise();
      return result as TodoTxtTask;
    }

    async updateTask(id: number, text: string) {
      const result = await this.http.post(`${environment.apiHost}/v1/updateTask`, {
        id,
        text
      }).toPromise();
      return result as TodoTxtTask;
    }

    async createTasks(texts: string[]) {
      const result = await this.http.post(`${environment.apiHost}/v1/createTasks`, {
        texts
      }).toPromise();
      return result as TodoTxtTask[];
    }

    async loadTasks() {
      const result = await this.http.get(`${environment.apiHost}/v1/loadTasks`).toPromise();
      return result as TodoTxtTask[];
    }

    async removeTasks() {
      await this.http.delete(`${environment.apiHost}/v1/removeTasks`).toPromise();
    }

    async removeTask(id: number) {
      await this.http.delete(`${environment.apiHost}/v1/removeTask?id=${id}`).toPromise();
    }
}
