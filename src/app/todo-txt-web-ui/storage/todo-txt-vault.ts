import { TodoTxtTask } from "../tasks/todo-txt-task";
import { TodoTxtConfig } from "./todo-txt-config";
import { Injectable } from "@angular/core";
import { TodoTxtTaskBackend } from "../tasks/todo-txt-task-backend";

@Injectable()
export class TodoTxtVault {
  private tasks = new Map<number, TodoTxtTask>();
  private config: TodoTxtConfig = { showClosed: false };

  constructor(private api: TodoTxtTaskBackend) { }

  async loadAll() {
    try {
      // FIXME config load
      const tasks = await this.api.loadTasks();
      this.tasks.clear();
      tasks.forEach((task) => {
        this.tasks.set(task.id, task);
      });
    } catch (e) {
      alert('WARNING: unable to load tasks')
      console.error(
        `TodoTxt unable to load cache from localStorage due to: ${e}`
      );
    }
  }

  async createTasks(texts: string[]) {
    if (texts) {
      const tasks = await this.api.createTasks(texts);
      tasks.forEach((task) => {
        this.tasks.set(task.id, task);
      });
      return tasks;
    }
    throw new Error('no text given for task saving');
  }

  async appendTask(text: string) {
    const task = await this.api.appendTask(text);
    this.tasks.set(task.id, task);
    return task;
  }

  async updateTask(id: number, text: string) {
    const task = await this.api.updateTask(id, text);
    this.tasks.set(id, task);
    return task;
  }

  getTask(taskId: number): TodoTxtTask {
    if (this.tasks.has(taskId)) {
      return this.tasks.get(taskId);
    }
    throw new Error(`no TodoTxtTask with ID of '${taskId}' could be found`);
  }

  getAllTasks(): TodoTxtTask[] {
    const list: TodoTxtTask[] = [];
    this.tasks.forEach((value: TodoTxtTask) => {
      list.push(value);
    });
    return list;
  }

  async removeTask(taskId: number) {
    if (this.tasks.has(taskId)) {
      this.tasks.delete(taskId);
    }
  }

  async removeAllTasks() {
    this.tasks = new Map<number, TodoTxtTask>();
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
