import { Module } from '@nestjs/common';
import { TODOTXT_FILE } from './app.config';
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
        return new AppStore(TODOTXT_FILE, parser);
      },
      inject: [AppParser],
    },
  ],
})
export class AppModule {}