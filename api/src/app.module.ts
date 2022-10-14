import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppParser } from './app.parser';
import { AppStore } from './app.store';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppParser,
    {
      provide: AppStore,
      useFactory: (parser: AppParser) => {
        return new AppStore('/home/stivius/todotxt-web/todo.txt', parser);
      },
      inject: [AppParser],
    },
  ],
})
export class AppModule {}
