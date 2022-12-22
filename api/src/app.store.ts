import { Injectable } from '@nestjs/common';
import { TodoTxtTask } from './todo-txt-task';
import * as fs from 'fs';
import { AppParser } from './app.parser';

@Injectable()
export class AppStore {
  private tasks: TodoTxtTask[] = [];

  constructor(private fileLocation: string, private parser: AppParser) {}

  loadAll(): TodoTxtTask[] {
    const lines = fs.readFileSync(this.fileLocation).toString().split('\n');
    this.tasks = this.parser.parseMany(...lines);
    return this.tasks;
  }

  saveTasks(tasks: string[]): TodoTxtTask[] {
    this.tasks = this.parser.parseMany(...tasks);
    this.flushToFile();
    return this.tasks;
  }

  updateTask(id: number, task: string) {
    this.tasks[id] = this.parser.parse(task);
    this.flushToFile();
  }

  private flushToFile() {
    fs.writeFileSync(
      this.fileLocation,
      this.tasks.map((task) => task.text).join('\n'),
    );
  }
}
