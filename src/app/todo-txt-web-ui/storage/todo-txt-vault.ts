import { TodoTxtTask } from "../tasks/todo-txt-task";
import { TodoTxtConfig } from "./todo-txt-config";
import { Injectable } from "@angular/core";
import { TodoTxtTaskBackend } from "../tasks/todo-txt-task-backend";

@Injectable()
export class TodoTxtVault {
  private tasks: TodoTxtTask[] = [];
  private config: TodoTxtConfig = { showClosed: false };

  constructor(private api: TodoTxtTaskBackend) { }

  async loadAll() {
    try {
      // FIXME config load
      this.tasks = await this.api.loadTasks();
    } catch (e) {
      alert('WARNING: unable to load tasks')
      console.error(
        `TodoTxt unable to load cache from localStorage due to: ${e}`
      );
    }
  }

  async createTasks(texts: string[]) {
    if (texts) {
      this.tasks = await this.api.createTasks(texts);
      return this.tasks;
    }
    throw new Error('no text given for task saving');
  }

  async appendTask(text: string) {
    const task = await this.api.appendTask(text);
    this.tasks.push(task);
    return task;
  }

  async updateTask(id: number, text: string) {
    const task = await this.api.updateTask(id, text);
    this.tasks[id] = task;
    return task;
  }

  getTask(id: number): TodoTxtTask {
    if (this.tasks[id] != null) {
      return this.tasks[id];
    }
    throw new Error(`no TodoTxtTask with ID of '${id}' could be found`);
  }

  getAllTasks(): TodoTxtTask[] {
    const list: TodoTxtTask[] = [];
    this.tasks.forEach((value: TodoTxtTask) => {
      list.push(value);
    });
    return list;
  }

  async removeTask(id: number) {
    if (this.tasks[id] != null) {
      await this.api.removeTask(id);
      this.tasks.splice(id, 1);
      this.tasks.forEach((task, index) => {
        task.id = index;
      });
      return;
    }
    throw new Error(`no TodoTxtTask with ID of '${id}' could be found`);
  }

  async removeAllTasks() {
    this.tasks = [];
    await this.api.removeTasks();
  }

  getConfig(): TodoTxtConfig {
    return this.config;
  }

  async setConfig(cfg: TodoTxtConfig) {
    this.config = cfg;
    // FIXME save config on backend
  }
}
