import { Injectable } from '@nestjs/common';
import { ParsedTodoTxtTask } from './todo-txt-task';

const Parser = require('todo-parser').Parser;
const parser = new Parser();

const dueDateParser = function (data: any) {
  const match = data.original.match(/t:([0-9]{4}-[0-9]{2}-[0-9]{2})/);
  if (match !== null) {
    data.dueDate = match[1];
  }
};

const dueFilterParser = function (data: any) {
  const match = data.original.match(/due:(past|today|future)/);
  if (match !== null) {
    data.dueFilter = match[1];
  }
};

const contextParser = function (data: any) {
  data.context = [...data.original.matchAll(/\+([A-Za-z0-9\-\_]+)/g)].map(
    (match) => match[1],
  );
};

const projectParser = function (data: any) {
  data.project = [...data.original.matchAll(/\@([A-Za-z0-9\-\_]+)/g)].map(
    (match) => match[1],
  );
};

parser.override('context', contextParser);
parser.override('project', projectParser);
parser.register(dueDateParser);
parser.register(dueFilterParser);

@Injectable()
export class AppParser {
  parseMany(...texts: string[]): ParsedTodoTxtTask[] {
    const tasks: ParsedTodoTxtTask[] = [];
    if (texts) {
      for (let i = 0; i < texts.length; i++) {
        tasks.push(this.parse(texts[i]));
      }
    }
    return tasks;
  }

  parse(text: string): ParsedTodoTxtTask {
    const result = parser.parse(text);
    return {
      text,
      completedDate: result.complationDate,
      createdDate: result.creationDate,
      contexts: result.project,
      projects: result.context,
      priority: result.priority,
      isActive: result.done != null ? !result.done : null,
      dueDate: result.dueDate,
      dueFilter: result.dueFilter,
    };
  }
}
