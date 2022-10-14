import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { TodoTxtUtils } from './helpers/todo-txt-utils';
import { TodoTxtConfig } from './storage/todo-txt-config';
import { TodoTxtTask } from './tasks/todo-txt-task';
import { TodoTxtTaskParser } from './tasks/todo-txt-task-parser';
import { TodoTxt } from './todo-txt';
import { saveAs } from 'file-saver';
import { TodoTxtAttributes } from './tasks/todo-txt-attributes';
import { FileData } from './helpers/file-data';

@Component({
  selector: 'app-todo-txt-web-ui',
  templateUrl: './todo-txt-web-ui.component.html',
  styleUrls: ['./todo-txt-web-ui.component.css'],
})
export class TodoTxtWebUiComponent {
  requiredFileType: string = '.txt';
  fileName: string;
  downloadFileName: string;
  isDirty: boolean;
  showClosed: boolean;
  downloadUrl: SafeUrl;
  filterStr: string;
  editingTaskId: string;
  isAddingNew: boolean;

  constructor(
    private sanitiser: DomSanitizer,
    private changeDetector: ChangeDetectorRef,
    private todo: TodoTxt,
  ) {
    this.isDirty = false;
    this.showClosed = this.todo.getConfig().showClosed;
    this.downloadFileName = 'todo.txt';
  }

  async toggleShowClosed(): Promise<void> {
    let cfg: TodoTxtConfig = this.todo.getConfig();
    cfg.showClosed = !cfg.showClosed;
    this.showClosed = cfg.showClosed;
    this.todo.setConfig(cfg);
  }

  async click_OpenToDoFile(): Promise<void> {
    const data: FileData = await TodoTxtUtils.readFile().catch((err) => {
      if (err.name != 'AbortError') {
        // AbortError is manual user cancel of file save operation
        console.warn(
          `unable to use File System API so falling back to legacy mode: ${err}`
        );
        document.getElementById('file-input').click();
        return null;
      }
    });
    if (data) {
      this.fileName = data.name;
      await this.todo.addTasks(data.text?.split('\n') || []);
    }
  }

  async processToDoFile(event: any): Promise<void> {
    if (event) {
      let files: File[] = event.target?.files;
      if (files && files.length > 0) {
        let file: File = files[0];
        if (file) {
          this.todo.removeAllTasks();
          this.fileName = file.name;
          let text: string = await file.text();
          await this.todo.addTasks(text.split('\n'));
        }
      }
    }
  }

  async click_AddTask(): Promise<string> {
    this.isAddingNew = true;
    const t = await this.todo.addTask('');
    this.isDirty = true;
    return await this.click_StartEditTask(t.id);
  }

  async click_SaveTasks(): Promise<void> {
    let text: string = this.getTasks()
      .map((t) => t.text?.trim())
      ?.join('\n');
    if (text) {
      await TodoTxtUtils.saveToFile({ text: text, name: this.fileName }).catch(
        (err) => {
          if (err.name != 'AbortError') {
            // AbortError is manual user cancel of file save operation
            console.warn(
              `unable to use File System API so falling back to legacy mode: ${err}`
            );
            let blob = new Blob([text], {
              type: 'data:attachment/text; charset=utf-8',
            });
            saveAs(blob, this.downloadFileName);
          }
        }
      );
    }
    this.isDirty = false;
  }

  async keyup_UpdateFilter(filter: string): Promise<void> {
    this.filterStr = filter;
  }

  async click_ClearFilter(event: any): Promise<void> {
    this.filterStr = null;
    event.target.value = undefined;
  }

  async click_MarkComplete(id: string): Promise<void> {
    this.todo.closeTask(id);
  }

  async click_MarkActive(id: string): Promise<void> {
    this.todo.activateTask(id);
  }

  async click_StartEditTask(id: string): Promise<string> {
    this.editingTaskId = id;
    this.changeDetector.detectChanges();
    return await this.setFocus(id);
  }

  async setFocus(id: string): Promise<string> {
    let el: HTMLElement = document.getElementById(`textarea_${id}`);
    if (el) {
      console.info(`setting focus on element 'textarea_${id}'`);
      el.focus();
      return id;
    } else {
      return Promise.reject(`unable to find element 'textarea_${id}'`);
    }
  }

  async click_SaveTaskEdit(id: string): Promise<string> {
    let text: string = document.querySelector<HTMLDivElement>(
      `#textarea_${id}`
    ).innerText;
    await this.todo.updateTask(id, text);
    this.isDirty = true;
    this.doneEditing();
    return text;
  }

  @HostListener('keydown.esc')
  async click_CancelTaskEdit(): Promise<void> {
    if (this.isAddingNew) {
      this.click_DeleteTask(this.editingTaskId);
    }
    this.doneEditing();
  }

  async click_DeleteTask(id: string): Promise<void> {
    this.todo.removeTask(id);
    this.isDirty = true;
    this.doneEditing();
  }

  doneEditing(): void {
    this.editingTaskId = null;
    this.isAddingNew = false;
    this.changeDetector.detectChanges();
  }

  getTasks(): TodoTxtTask[] {
    let tasks: TodoTxtTask[] = this.todo.getFilteredTaskArray(this.filterStr);
    if (!this.todo.getConfig().showClosed) {
      let active: TodoTxtTask[] = [];
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].isActive) {
          active.push(tasks[i]);
        }
      }
      tasks = active;
    }
    return tasks;
  }

  // FIXME bootstrap classes text-* that block cursor movement
  getMarkupForTask(text: string, id: string): SafeHtml {
    // console.log('getMarkupForTask', text, id)
    const task = this.todo.getTask(id);
    // make html compatible
    text = TodoTxtUtils.htmlEncode(text);

    // markup priority
    let priCls: string = this.getDisplayClassForTask(task);
    text = text.replace(
      task.priority,
      '<span class="' + priCls + '"><b>' + task.priority + '</b></span>'
    );

    // markup projects
    let projects: string[] = task.projects;
    projects.forEach((project) => {
      const prj = `+${project}`;
      text = text.replace(
        prj, 
        '<span class="text-muted"><b><i>' + prj + '</i></b></span>'
      );
    });

    // markup contexts
    let contexts: string[] = task.contexts;
    contexts.forEach((context) => {
      const ctx = `@${context}`;
      text = text.replace(
        ctx,
        '<span class="text-muted"><b><i>' + ctx + '</i></b></span>'
      );
    });

    // markup created date
    let date: string = task.createdDate;
    if (date) {
      text = text.replace(
        date,
        '<span class="text-muted hidden-xs"><b><i>' + date + '</i></b></span>'
      );
    }

    return this.sanitiser.bypassSecurityTrustHtml(text);
  }

  getDisplayClassForTask(task: TodoTxtTask): string {
    let cls: string = '';
    if (task.priority !== null && task.isActive) {
      if (task.priority === '(A)') {
        cls += ' text-danger';
      }
      if (task.priority === '(B)') {
        cls += ' text-warning';
      }
      if (task.priority === '(C)') {
        cls += ' text-primary';
      }
    }

    return cls;
  }

  getPriorities(): string[] {
    return Array.from(TodoTxtAttributes.priorities);
  }

  getProjects(): string[] {
    return Array.from(TodoTxtAttributes.projects);
  }

  getContexts(): string[] {
    return Array.from(TodoTxtAttributes.contexts);
  }
}
