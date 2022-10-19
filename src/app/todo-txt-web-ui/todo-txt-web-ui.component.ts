import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TodoTxtUtils } from './helpers/todo-txt-utils';
import { TodoTxtTask } from './tasks/todo-txt-task';
import { TodoTxtAttributes } from './tasks/todo-txt-attributes';
import { FileData } from './helpers/file-data';
import { TodoTxtTaskService } from './tasks/todo-txt-task-service';

@Component({
  selector: 'app-todo-txt-web-ui',
  templateUrl: './todo-txt-web-ui.component.html',
  styleUrls: ['./todo-txt-web-ui.component.css'],
})
export class TodoTxtWebUiComponent implements OnInit {
  requiredFileType: string = '.txt';
  editingTaskId: number;
  isAddingNew: boolean;
  filterUpdateHandler: number;
  filterInitialStr: string = '';
  newTaskInitialInput: string = '';

  constructor(
    private sanitiser: DomSanitizer,
    private changeDetector: ChangeDetectorRef,
    private todo: TodoTxtTaskService,
  ) { }

  async ngOnInit() {
    await this.todo.init();
    this.filterInitialStr = this.todo.getFilterString();
  }

  async click_OpenToDoFile(): Promise<void> {
    const data: FileData = await TodoTxtUtils.readFile().catch((err) => {
      if (err.name != 'AbortError') {
        document.getElementById('file-input').click();
        return null;
      }
    });
    if (data) {
      await this.todo.createTasks(data.text?.split('\n') || []);
    }
  }

  async processToDoFile(event: any): Promise<void> {
    if (event) {
      let files: File[] = event.target?.files;
      if (files && files.length > 0) {
        let file: File = files[0];
        if (file) {
          const text = await file.text();
          await this.todo.createTasks(text.split('\n'));
        }
      }
    }
  }

  async click_DateChanged(id: number) {
    const date = document.querySelector<HTMLInputElement>(`#date_${id}`)?.value;
    if (date) {
      const editingTaskEl = document.querySelector<HTMLDivElement>(`#textarea_${id}`);
      editingTaskEl.innerHTML = this.todo.replaceDate(editingTaskEl.innerHTML, date);
    }
  }

  async click_AddTask()  {
    this.isAddingNew = true;
    this.changeDetector.detectChanges();
    await this.setFocus('new');
  }

  async click_SaveNewTask(text: string): Promise<void> {
    if (text.trim().length === 0) {
      alert('cannot save empty task');
      return;
    }
    await this.todo.appendTask(text);
    this.doneEditing();
  }

  async keyup_UpdateFilter(filterStr: string): Promise<void> {
    clearTimeout(this.filterUpdateHandler);
    // @ts-ignore
    this.filterUpdateHandler = setTimeout(async () => {
      const filter = await this.todo.updateFilter(filterStr);
      this.newTaskInitialInput = [
        ...filter.projects.map(value => `+${value}`),
        ...filter.contexts.map(value => `@${value}`)
      ].join(' ');
    }, 500);
  }

  async click_ClearFilter(event: any): Promise<void> {
    event.target.value = undefined;
    this.todo.clearFilter();
  }

  async click_StartEditTask(id: number): Promise<void> {
    this.editingTaskId = id;
    this.changeDetector.detectChanges();
    await this.setFocus(id.toString());
  }

  async setFocus(id: string): Promise<void> {
    let el: HTMLElement = document.getElementById(`textarea_${id}`);
    if (el) {
      el.focus();
    } else {
      return Promise.reject(`unable to find element 'textarea_${id}'`);
    }
  }

  async click_SaveTaskEdit(id: number): Promise<string> {
    let text: string = document.querySelector<HTMLDivElement>(
      `#textarea_${id}`
    ).innerText;
    if (text.trim().length === 0) {
      alert('cannot save empty task');
      return;
    }
    await this.todo.updateTask(id, text);
    this.doneEditing();
    return text;
  }

  @HostListener('keydown.esc')
  async click_CancelTaskEdit(): Promise<void> {
    this.doneEditing();
  }

  async click_DeleteTask(id: number): Promise<void> {
    await this.todo.removeTask(id);
    this.doneEditing();
  }

  doneEditing(): void {
    this.editingTaskId = null;
    this.isAddingNew = false;
    this.changeDetector.detectChanges();
  }

  getTasks(): TodoTxtTask[] {
    let tasks: TodoTxtTask[] = this.todo.getFilteredTaskArray();
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

  getMarkupForTask(text: string, id: number): SafeHtml {
    const task = this.todo.getTask(id);
    // make html compatible
    text = TodoTxtUtils.htmlEncode(text);

    // markup priority
    const priCls: string = this.getDisplayClassForTask(task);
    text = text.replace(
      task.priority,
      '<span class="' + priCls + '"><b>' + task.priority + '</b></span>'
    );

    task.projects.forEach((project) => {
      const prj = `+${project}`;
      text = text.replace(
        prj, 
        '<span class="text-muted"><b><i>' + prj + '</i></b></span>'
      );
    });

    task.contexts.forEach((context) => {
      const ctx = `@${context}`;
      text = text.replace(
        ctx,
        '<span class="text-muted"><b><i>' + ctx + '</i></b></span>'
      );
    });

    if (task.dueDate) {
      text = text.replace(new RegExp(/t:([0-9]{4}-[0-9]{2}-[0-9]{2})/), `<span class="text-success">${"$&"}</span>`)
    }

    return this.sanitiser.bypassSecurityTrustHtml(text);
  }

  getDisplayClassForTask(task: TodoTxtTask): string {
    let cls: string = '';
    if (task.priority !== null && task.isActive) {
      if (task.priority === 'A') {
        cls += ' text-danger';
      }
      if (task.priority === 'B') {
        cls += ' text-warning';
      }
      if (task.priority === 'C') {
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
