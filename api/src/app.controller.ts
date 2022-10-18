import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AppParser } from './app.parser';
import { AppStore } from './app.store';
import { TodoTxtTask } from './todo-txt-task';
import { TodoTxtFilter } from './todo-txt-task-filter';

interface CreateTasksDto {
  texts: string[];
}

interface AppendTaskDro {
  text: string;
}

interface UpdateTaskDro {
  id: number;
  text: string;
}

interface ParseFilterDto {
  filter: string;
}

@Controller('v1')
export class AppController {
  constructor(
    private readonly appStore: AppStore,
    private readonly parser: AppParser,
  ) {}

  @Post('parseFilter')
  parseFilter(@Body() data: ParseFilterDto): TodoTxtFilter {
    const result = this.parser.parse(data.filter);
    let text = result.text;
    const filter = {
      projects: result.projects || [],
      contexts: result.contexts || [],
      priorities: result.priority ? [result.priority] : [],
      rawString: data.filter,
    };
    filter.projects.forEach(
      (value) => (text = text.replaceAll(`+${value}`, '')),
    );
    filter.contexts.forEach(
      (value) => (text = text.replaceAll(`@${value}`, '')),
    );
    filter.priorities.forEach(
      (value) => (text = text.replaceAll(`(${value})`, '')),
    );
    if (result.dueFilter) {
      text = text.replaceAll(`due:${result.dueFilter}`, '');
    }
    return {
      ...filter,
      due: result.dueFilter,
      text: text.trim(),
    };
  }

  @Post('createTasks')
  addTasks(@Body() data: CreateTasksDto): TodoTxtTask[] {
    // console.log(data, 'createTasks');
    return this.appStore.createTasks(data.texts);
  }

  @Post('appendTask')
  appendTask(@Body() data: AppendTaskDro): TodoTxtTask {
    // console.log(data, 'appendTask');
    return this.appStore.appendTask(data.text);
  }

  @Post('updateTask')
  updateTask(@Body() data: UpdateTaskDro): TodoTxtTask {
    // console.log(data, 'updateTask');
    return this.appStore.updateTask(data.id, data.text);
  }

  @Get('loadTasks')
  loadTasks(): TodoTxtTask[] {
    return this.appStore.loadTasks();
  }

  @Delete('removeTasks')
  removeTasks() {
    // console.log('removeTasks');
    this.appStore.removeTasks();
  }

  @Delete('removeTask')
  removeTask(@Query('id') id: number) {
    // console.log('removeTask', id);
    this.appStore.removeTask(id);
  }
}
