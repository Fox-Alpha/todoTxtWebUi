import { Injectable } from "@angular/core";
import { TodoTxtUtils } from "../helpers/todo-txt-utils";
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

  getSortedTaskArray(): TodoTxtTask[] {
    const tastList = this.vault.getAllTasks();
    TodoTxtAttributes.reset();
    tastList.forEach((task) => {
      this.updateAttributes(task);
    });
    tastList.sort(this.compareTasks);
    return tastList;
  }

  getFilteredTaskArray() {
    var sortedTasks = this.getSortedTaskArray();
    if (this.filter != null) {
      // console.log('filter', this.filter)
      return sortedTasks.filter((value) => {
        if (!value.text.length) return true;
        const projectsEqual = TodoTxtTaskService.hasSubArray(this.filter.projects, value.projects);
        const contextsEqual = TodoTxtTaskService.hasSubArray(this.filter.contexts, value.contexts);
        const priorities = TodoTxtTaskService.hasSubArray(this.filter.priorities, value.priority ? [value.priority] : []);
        const dueDateMatches = (dateStr: string) => {
          if (this.filter.due) {
            if (dateStr == null) return false;
            const today = new Date();
            const date = new Date(dateStr);
            today.setHours(0,0,0,0);
            date.setHours(0,0,0,0);
            switch (this.filter.due) {
              case 'past':
                return date <= today;
              case 'today':
                return !(date < today) && !(date > today);
              case 'future':
                return date >= today;
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
    return sortedTasks;
  }

  getTask(taskId: number): TodoTxtTask {
    return this.vault.getTask(taskId);
  }

  getFilterString() {
    return this.filter?.rawString || '';
  }

  async updateFilter(filterStr: string) {
    const filterChanged = this.filter?.rawString !== filterStr;

    if (filterStr.length > 0 && filterChanged) {
      this.filter = await this.vault.updateFilter(filterStr);
    } else if (this.filter != null && filterChanged) {
      this.clearFilter();
    }
  }

  async clearFilter() {
    this.filter = null;
    this.vault.clearFilter();
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

  private static hasSubArray(master: any[], sub: any[]) {
    if (master.length === 0) return true;
    if (master.length > 0 && sub.length === 0) return false;
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
