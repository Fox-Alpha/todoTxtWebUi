import { Injectable } from "@angular/core";
import { TodoTxtUtils } from "../helpers/todo-txt-utils";
import { TodoTxtConfig } from "../storage/todo-txt-config";
import { TodoTxtVault } from "../storage/todo-txt-vault";
import { TodoTxtAttributes } from "./todo-txt-attributes";
import { TodoTxtTask } from "./todo-txt-task";

@Injectable()
export class TodoTxtTaskService {
  constructor(private vault: TodoTxtVault) {}

  async init() {
    await this.vault.loadAll();
  }

  getSortedTaskArray(): TodoTxtTask[] {
    const tastList = this.vault.getAllTasks();
    TodoTxtAttributes.reset();
    tastList.forEach((task) => {
      this.updateAttributes(task);
    });
    tastList.sort(this.compareTasks);
    return tastList;
  }

  // FIXME priority filter not working
  getFilteredTaskArray(filterStr: string) {
    var filteredTasks = this.getSortedTaskArray();
    if (filterStr && filterStr !== '') {
      // create the regex matcher
      const filters: string[] = filterStr.split(' ');
      let rStr: string = '';
      for (var i = 0; i < filters.length; i++) {
        const filter = filters[i]
          .replace(/([-\(\)\[\]\{\}+\?*\.$\^\|,:#<\!\\])/g, '\\$1')
          .replace(/\x08/g, '\\x08');
        rStr += '.*(' + filter + ').*';
      }
      let tasks: TodoTxtTask[] = filteredTasks.filter(function (t) {
        return t.text.match(new RegExp(rStr, 'i')) || t.text.length === 0;
      });
      filteredTasks = tasks;
    }
    return filteredTasks;
  }

  getTask(taskId: number): TodoTxtTask {
    return this.vault.getTask(taskId);
  }

  async updateTask(taskId: number, newText: string) {
    await this.vault.updateTask(taskId, newText);
  }

  async createTasks(texts: string[]) {
    return this.vault.createTasks(texts);
  }

  async appendTask(text: string) {
    const task = await this.vault.appendTask(text);
    this.updateAttributes(task);
    return task;
  }

  async removeTask(taskId: number) {
    await this.vault.removeTask(taskId);
  }

  async removeAllTasks() {
    await this.vault.removeAllTasks();
  }

  getConfig() {
    return this.vault.getConfig();
  }

  async setConfig(cfg: TodoTxtConfig) {
    await this.vault.setConfig(cfg);
  }

  async closeTask(taskId: number) {
    const task = this.getTask(taskId);

    if (task && task.isActive) {
      var text = task.text;
      if (task.priority) {
        text = text.replace(task.priority, '');
      }
      text = 'x ' + TodoTxtUtils.formatDate(new Date()) + ' ' + text;
      await this.updateTask(task.id, text);
    }
  }

  async activateTask(taskId: number) {
    const task = this.getTask(taskId);
    if (task && !task.isActive) {
      let text: string = task.text;
      text = text.replace(/^(x )/, '').replace(task.completedDate + ' ', '');
      await this.updateTask(task.id, text);
    }
  }

  private updateAttributes(task: TodoTxtTask): void {
    if (task.isActive || this.vault.getConfig().showClosed) {
      // get the priority and add to global filter hashset
      if (task.priority) {
        TodoTxtAttributes.priorities.add(`(${task.priority})`);
      }

      // get each project and add to the global filter hashset
      task.projects.forEach((project) => {
        if (project) {
          TodoTxtAttributes.projects.add(`+${project}`);
        }
      });

      // get each context and add to the global filter hashset
      task.contexts.forEach((context) => {
        if (context) {
          TodoTxtAttributes.contexts.add(`@${context}`);
        }
      });
    }
  }

  private static arraysEqual(array1: any[], array2: any[]) {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index])
  }

  private static compareArrays(array1: any[], array2: any[]) {
    if (!array1[0]) return 1;
    else if (!array2[0]) return -1;
    return array1[0] < array2[0] ? -1 : 1;
  }

  private compareTasks(taskA: TodoTxtTask, taskB: TodoTxtTask) {
    const { isActive: aActive, priority: aPri, projects: aProjects, contexts: aContexts } = taskA;
    const { isActive: bActive, priority: bPri, projects: bProjects, contexts: bContexts } = taskB;

    if (aActive !== bActive) {
      return aActive ? -1 : 1;
    } 
    if (!TodoTxtTaskService.arraysEqual(aProjects, bProjects)) {
      return TodoTxtTaskService.compareArrays(aProjects, bProjects);
    }
    if (!TodoTxtTaskService.arraysEqual(aContexts, bContexts)) {
      return TodoTxtTaskService.compareArrays(aContexts, bContexts);
    }
    if (aPri !== bPri) {
      return !bPri || aPri < bPri ? -1 : 1;
    }
    return 0;
  }
}
