import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppStore } from './app.store';
import { TodoTxtTask } from './todo-txt-task';

interface BodyDto {
  tasks: string[];
}

@Controller('v1')
export class AppController {
  constructor(private readonly appStore: AppStore) {}

  @Post('saveTasks')
  createTasks(@Body() data: BodyDto): TodoTxtTask[] {
    return this.appStore.saveTasks(data.tasks);
  }

  @Get('loadAll')
  loadAll(): TodoTxtTask[] {
    return this.appStore.loadAll();
  }
}
