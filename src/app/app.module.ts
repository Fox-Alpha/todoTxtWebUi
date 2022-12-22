import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodoTxtVault } from './todo-txt-web-ui/storage/todo-txt-vault';
import { TodoTxtTaskBackend } from './todo-txt-web-ui/tasks/todo-txt-task-backend';
import { TodoTxtTaskService } from './todo-txt-web-ui/tasks/todo-txt-task-service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    TodoTxtTaskService,
    TodoTxtTaskBackend,
    TodoTxtVault,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
