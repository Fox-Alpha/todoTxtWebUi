import { TodoTxtAttributes } from './tasks/todo-txt-attributes';
import { TodoTxtTask } from './tasks/todo-txt-task';
import { TodoTxtTaskParser } from './tasks/todo-txt-task-parser';
import { TodoTxtUtils } from './helpers/todo-txt-utils';
import { Injectable } from '@angular/core';
import { TodoTxtVault } from './storage/todo-txt-vault';
import { TodoTxtConfig } from './storage/todo-txt-config';

@Injectable()
export class TodoTxt {
  constructor(private parser: TodoTxtTaskParser, private vault: TodoTxtVault) {}

  getSortedTaskArray(): TodoTxtTask[] {
    // sort the list and then add it
    let taskArray: TodoTxtTask[] = this.vault.getAllTasks();
    TodoTxtAttributes.reset();
    for (var i = 0; i < taskArray.length; i++) {
      this.updateAttributes(taskArray[i]);
    }
    taskArray.sort(this.compareTasks);

    return taskArray;
  }

  // FIXME priority filter not working
  getFilteredTaskArray(filterStr: string) {
    var filteredTasks = this.getSortedTaskArray();
    if (filterStr && filterStr !== '') {
      // create the regex matcher
      let filters: string[] = filterStr.split(' ');
      let rStr: string = '';
      for (var i = 0; i < filters.length; i++) {
        var filter = filters[i]
          .replace(/([-\(\)\[\]\{\}+\?*\.$\^\|,:#<\!\\])/g, '\\$1')
          .replace(/\x08/g, '\\x08');
        rStr += '.*(' + filter + ').*';
      }
      var regex = new RegExp(rStr, 'i');
      let tasks: TodoTxtTask[] = filteredTasks.filter(function (t) {
        return t.text.match(regex);
      });
      filteredTasks = tasks;
    }

    return filteredTasks;
  }

  getTask(taskId: string): TodoTxtTask {
    return this.vault.getTask(taskId);
  }

  async updateTask(taskId: string, newText: string): Promise<boolean> {
    const task = await this.parser.get(newText);
    task.id = taskId;
    this.vault.addTasks(task);
    return true;
  }

  async addTasks(texts: string[]) {
    const tasks = await this.parser.getMany(...texts);
    this.vault.addTasks(...tasks);
    return tasks;
  }

  async addTask(text: string) {
    const task = await this.parser.get(text);
    this.vault.addTasks(task);
    this.updateAttributes(task);
    return task;
  }

  removeTask(taskId: string) {
    this.vault.removeTask(taskId);
  }

  removeAllTasks() {
    this.vault.removeAllTasks();
  }

  getConfig() {
    return this.vault.getConfig();
  }

  setConfig(cfg: TodoTxtConfig) {
    this.vault.setConfig(cfg);
  }

  closeTask(taskId: string): boolean {
    var task = this.getTask(taskId);

    if (task && task.isActive) {
      var text = task.text;
      if (task.priority) {
        text = text.replace(task.priority, '');
      }
      text = 'x ' + TodoTxtUtils.formatDate(new Date()) + ' ' + text;
      this.updateTask(task.id, text);
      return true;
    }

    return false;
  }

  activateTask(taskId: string): boolean {
    var task = this.getTask(taskId);
    if (task && !task.isActive) {
      let text: string = task.text;
      text = text.replace(/^(x )/, '').replace(task.completedDate + ' ', '');
      this.updateTask(task.id, text);
      return true;
    }

    return false;
  }

  private updateAttributes(task: TodoTxtTask): void {
    if (task.isActive || this.vault.getConfig().showClosed) {
      // get the priority and add to global filter hashset
      if (task.priority) {
        TodoTxtAttributes.priorities.add(task.priority);
      }

      // get each project and add to the global filter hashset
      task.projects.forEach((project) => {
        if (project) {
          TodoTxtAttributes.projects.add(project);
        }
      });

      // get each context and add to the global filter hashset
      task.contexts.forEach((context) => {
        if (context) {
          TodoTxtAttributes.contexts.add(context);
        }
      });
    }
  }

  private compareTasks(taskA: TodoTxtTask, taskB: TodoTxtTask) {
    // function will allow sorting of tasks by the following
    // criteria: (1) active vs. closed (2) priority (3) created date
    // (4) completed date
    var aActive = taskA.isActive;
    var bActive = taskB.isActive;
    var aPri = taskA.priority;
    var bPri = taskB.priority;
    var aCreated = taskA.createdDate;
    var bCreated = taskB.createdDate;
    var aCompleted = taskA.completedDate;
    var bCompleted = taskB.completedDate;

    // (1) compare active vs. closed
    if (aActive !== bActive) {
      // prioritize active over closed
      if (aActive) {
        return -1;
      } else {
        return 1;
      }
    } else {
      // (2) compare priority
      if (aPri !== bPri) {
        // order by priority, but favor having priority over not
        if (!bPri || aPri < bPri) {
          return -1;
        } else if (!aPri || aPri > bPri) {
          return 1;
        }
      } else {
        // (3) compare created date
        if (aCreated !== bCreated) {
          // order by created date ascending (oldest ones first)
          if (aCreated < bCreated) {
            return -1;
          } else {
            return 1;
          }
        } else {
          // (4) compare completed date
          if (aCompleted !== bCompleted) {
            // order by completed date descending (latest ones first)
            if (aCompleted > bCompleted) {
              return -1;
            } else {
              return 1;
            }
          }
        }
      }
    }
    // objects are equivalent
    return 0;
  }
}
