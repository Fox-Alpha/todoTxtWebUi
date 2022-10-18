export interface ParsedTodoTxtTask {
  priority?: string;
  createdDate?: string;
  completedDate?: string;
  projects?: string[];
  contexts?: string[];
  dueDate?: Date;
  dueFilter?: string;
  isActive?: boolean;
  text: string;
}

export interface TodoTxtTask extends ParsedTodoTxtTask {
  id: number;
}
