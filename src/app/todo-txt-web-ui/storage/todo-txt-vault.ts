import { TodoTxtTask } from "../tasks/todo-txt-task";
import { TodoTxtConfig } from "./todo-txt-config";
import { TodoTextCache } from "./todo-txt-cache";
import { Injectable } from "@angular/core";

@Injectable()
export class TodoTxtVault {
  private tasks: Map<string, TodoTxtTask> = new Map<string, TodoTxtTask>();
  private config: TodoTxtConfig = { showClosed: false };
  private cacheError: number = 0;

  addTasks(...tasks: TodoTxtTask[]): void {
    if (tasks) {
      for (var i = 0; i < tasks.length; i++) {
        let task: TodoTxtTask = tasks[i];
        this.tasks.set(task.id, task);

        this.persist();
      }
    }
  }

  removeTask(taskId: string): boolean {
    let found: boolean = false;
    if (this.tasks.has(taskId)) {
      this.tasks.delete(taskId);
      found = true;
    }

    this.persist();

    return found;
  }

  removeAllTasks(): void {
    this.tasks = new Map<string, TodoTxtTask>();

    this.persist();
  }

  getTask(taskId: string): TodoTxtTask {
    this.load();

    if (this.tasks.has(taskId)) {
      return this.tasks.get(taskId);
    }
    throw new Error(`no TodoTxtTask with ID of '${taskId}' could be found`);
  }

  getAllTasks(): TodoTxtTask[] {
    this.load();

    let ts: TodoTxtTask[] = [];
    this.tasks.forEach((value: TodoTxtTask) => {
      ts.push(value);
    });
    return ts;
  }

  getConfig(): TodoTxtConfig {
    this.load();

    return this.config;
  }

  setConfig(cfg: TodoTxtConfig): void {
    this.config = cfg;

    this.persist();
  }

  private persist(): void {
    try {
      let cache: TodoTextCache = {
        tasks: Array.from(this.tasks.values()),
        config: this.config,
      };
      localStorage.setItem('todo-txt', JSON.stringify(cache));
    } catch (e) {
      if (this.cacheError == 0) {
        // TODO: move this to TodoTxtView and present as Modal on startup
        alert(
          'WARNING: unable to store Tasks in localStorage; ensure you export your tasks before you close the browser or they will be lost!'
        );
        console.error(
          `TodoTxt unable to cache data in localStorage due to: ${e}`
        );
        this.cacheError++;
      }
    }
  }

  private load(): void {
    try {
      let persistance: string = localStorage.getItem('todo-txt');
      if (persistance) {
        let cache: TodoTextCache = JSON.parse(persistance) as TodoTextCache;
        if (cache.tasks) {
          this.tasks.clear();
          for (var i = 0; i < cache.tasks.length; i++) {
            this.tasks.set(cache.tasks[i].id, cache.tasks[i]);
          }
          this.config = cache.config;
        }
      }
    } catch (e) {
      if (this.cacheError == 0) {
        console.info(
          `TodoTxt unable to load cache from localStorage due to: ${e}`
        );
      }
    }
  }
}
