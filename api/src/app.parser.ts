import { Injectable } from '@nestjs/common';
import { ParsedTodoTxtTask } from './todo-txt-task';

const parser = require('todotxt-parser');

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
    const [result] = parser.relaxed(text);
    return {
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
