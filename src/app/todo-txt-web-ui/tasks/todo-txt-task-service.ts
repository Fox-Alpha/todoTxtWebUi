import { Injectable } from "@angular/core";
import { TodoTxtConfig } from "../storage/todo-txt-config";
import { TodoTxtVault } from "../storage/todo-txt-vault";
import { TodoTxtAttributes } from "./todo-txt-attributes";
import { TodoTxtTask } from "./todo-txt-task";
import { TodoTxtFilter } from "./todo-txt-task-filter";

@Injectable()
export class TodoTxtTaskService {
  private filter: TodoTxtFilter = null;

  constructor(private vault: TodoTxtVault) {}

  async init() {
    this.filter = this.vault.loadFilter();
    await this.vault.loadAll();
  }

  sortTasks(taskList: TodoTxtTask[]): TodoTxtTask[] {
    TodoTxtAttributes.reset();
    taskList.forEach((task) => {
      this.updateAttributes(task);
    });
    taskList.sort(this.compareTasks);
    return taskList;
  }

  getFilteredTaskArray() {
    const taskList = this.sortTasks(this.vault.getAllTasks());
    if (this.filter != null) {
      // console.log('filter', this.filter, taskList.length)
      return taskList.filter((value) => {
        if (!value.text.length) return true;
        const projectsEqual = TodoTxtTaskService.hasSubArray(value.projects,  this.filter.projects);
        const contextsEqual = TodoTxtTaskService.hasSubArray(value.contexts, this.filter.contexts);
        const priorities = TodoTxtTaskService.hasSubArray(value.priority ? [value.priority] : [], this.filter.priorities);
        const dueDateMatches = (dateStr: string) => {
          if (this.filter.due) {
            if (dateStr == null) return false;
            const today = new Date();
            const date = new Date(dateStr);
            today.setHours(0,0,0,0);
            date.setHours(0,0,0,0);
            switch (this.filter.due) {
              case 'past':
                return date < today;
              case 'today':
                return !(date < today) && !(date > today);
              case 'future':
                return date > today;
              default:
                return true;
            }
          }
          return true;
        };
        // console.log(projectsEqual, contextsEqual, priorities, value.text.includes(this.filter.text), dueDateMatches(value.dueDate), value)
        return projectsEqual && 
          contextsEqual && 
          priorities &&
          value.text.includes(this.filter.text) &&
          dueDateMatches(value.dueDate);
      });
    }
    return taskList;
  }

  getTask(taskId: number): TodoTxtTask {
    return this.vault.getTask(taskId);
  }

  getFilter() {
    return this.filter;
  }

  async updateFilter(filterStr: string) {
    const filterChanged = this.filter?.rawString !== filterStr;

    if (filterStr.length > 0 && filterChanged) {
      this.filter = await this.vault.updateFilter(filterStr);
    } else if (this.filter != null && filterChanged) {
      this.clearFilter();
    }
    return this.filter;
  }

  async clearFilter() {
    this.filter = null;
    this.vault.clearFilter();
  }

  replaceDate(text: string, date: string) {
    const dateRegexp = /t:([0-9]{4}-[0-9]{2}-[0-9]{2})/;
    const match = text.match(dateRegexp);
    if (match) {
      return text.replace(dateRegexp, date.length > 0 ? `t:${date}` : '').trim();
    } else {
      return `${text} t:${date}`
    }
  }

  replacePriority(text: string, priority: string) {
    const priorityRegexp = /\([A-Z]\)/;
    const match = text.match(priorityRegexp);
    if (match) {
      return text.replace(priorityRegexp, priority).trim();
    } else {
      return `${priority} ${text}`
    }
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

  private updateAttributes(task: TodoTxtTask): void {
    if (task.isActive || this.vault.getConfig().showClosed) {
      if (task.priority) {
        TodoTxtAttributes.priorities.add(`(${task.priority})`);
      }

      task.projects.forEach((project) => {
        if (project) {
          TodoTxtAttributes.projects.add(`+${project}`);
        }
      });

      task.contexts.forEach((context) => {
        if (context) {
          TodoTxtAttributes.contexts.add(`@${context}`);
        }
      });
    }
  }

  private static hasSubArray(master: any[], sub: any[]) {
    return sub.every(elem => master.indexOf(elem) > -1);
  }

  private static arraysEqual(array1: any[], array2: any[]) {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index])
  }

  private static compareArrays(array1: any[], array2: any[]) {
    if (!array1[0]) return 1;
    else if (!array2[0]) return -1;
    return array1[0] < array2[0] ? -1 : 1;
  }

  private static comparePriorities(priority1: string, priority2: string) {
    return !priority2 || priority1 < priority2 ? -1 : 1;
  }

  private compareTasks(taskA: TodoTxtTask, taskB: TodoTxtTask) {
    const { priority: aPri, projects: aProjects, contexts: aContexts, dueDate: aDueDate } = taskA;
    const { priority: bPri, projects: bProjects, contexts: bContexts, dueDate: bDueDate } = taskB;

    if (aDueDate !== bDueDate) {
      if (aDueDate && bDueDate && aPri !== bPri) {
        return TodoTxtTaskService.comparePriorities(aPri, bPri);
      }
      return !bDueDate || new Date(aDueDate) < new Date(bDueDate) ? -1 : 1;
    }
    if (aPri !== bPri) {
      return TodoTxtTaskService.comparePriorities(aPri, bPri);
    }
    if (!TodoTxtTaskService.arraysEqual(aProjects, bProjects)) {
      return TodoTxtTaskService.compareArrays(aProjects, bProjects);
    }
    if (!TodoTxtTaskService.arraysEqual(aContexts, bContexts)) {
      return TodoTxtTaskService.compareArrays(aContexts, bContexts);
    }
    return 0;
  }
}
