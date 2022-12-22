import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AppStore } from './app.store';
import { TodoTxtTask } from './todo-txt-task';

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

@Controller('v1')
export class AppController {
  constructor(private readonly appStore: AppStore) {}

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
