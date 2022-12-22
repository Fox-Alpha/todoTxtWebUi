import { Injectable } from '@nestjs/common';
import { ParsedTodoTxtTask, TodoTxtTask } from './todo-txt-task';
import * as fs from 'fs';
import { AppParser } from './app.parser';

@Injectable()
export class AppStore {
  private tasks: TodoTxtTask[] = [];

  constructor(private fileLocation: string, private parser: AppParser) {}

  private mapToTaskWithIds(...tasks: ParsedTodoTxtTask[]) {
    return tasks.map((value, index) => ({
      id: index,
      ...value,
    }));
  }

  loadTasks(): TodoTxtTask[] {
    const lines = fs
      .readFileSync(this.fileLocation)
      .toString()
      .split('\n')
      .filter((line) => line.length !== 0);
    this.tasks = this.mapToTaskWithIds(...this.parser.parseMany(...lines));
    console.log('loadTasks', this.tasks);
    return this.tasks;
  }

  createTasks(texts: string[]): TodoTxtTask[] {
    this.tasks = this.mapToTaskWithIds(...this.parser.parseMany(...texts));
    console.log('createTasks', texts);
    this.flushToFile();
    return this.tasks;
  }

  appendTask(text: string): TodoTxtTask {
    const id = this.tasks.length;
    this.tasks.push({
      id,
      ...this.parser.parse(text),
    });
    console.log('appendTask', text);
    this.flushToFile();
    return this.tasks[id];
  }

  updateTask(id: number, text: string): TodoTxtTask {
    const task = this.parser.parse(text);
    console.log('updateTask', id, text, task);
    this.tasks[id] = {
      id,
      ...task,
    };
    this.flushToFile();
    return this.tasks[id];
  }

  removeTasks() {
    this.tasks = [];
    this.flushToFile();
  }

  private flushToFile() {
    console.log('flushToFile', this.tasks);
    fs.writeFileSync(
      this.fileLocation,
      this.tasks.map((task) => task.text).join('\n'),
    );
  }
}
