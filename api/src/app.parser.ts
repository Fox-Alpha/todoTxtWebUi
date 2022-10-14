import { Injectable } from '@nestjs/common';
import { TodoTxtTask } from './todo-txt-task';
import { guid } from './todo-txt-utils';

const parser = require('todotxt-parser');

@Injectable()
export class AppParser {
  parseMany(...texts: string[]): TodoTxtTask[] {
    const tasks: TodoTxtTask[] = [];
    if (texts) {
      for (let i = 0; i < texts.length; i++) {
        tasks.push(this.parse(texts[i]));
      }
    }
    return tasks;
  }

  parse(text: string): TodoTxtTask {
    const [result] = parser.relaxed(text);
    return {
      id: guid(),
      text,
      completedDate: result.dateCompleted,
      createdDate: result.dateCreated,
      contexts: result.contexts,
      projects: result.projects,
      priority: result.priority,
      isActive: result.complete != null ? !result.complete : null,
      metadatas: [],
    };
  }
}
