import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodoTxtVault } from './todo-txt-web-ui/storage/todo-txt-vault';
import { TodoTxtTaskParser } from './todo-txt-web-ui/tasks/todo-txt-task-parser';
import { TodoTxt } from './todo-txt-web-ui/todo-txt';

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
    TodoTxt,
    TodoTxtTaskParser,
    TodoTxtVault,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
