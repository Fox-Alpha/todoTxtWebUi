export interface TodoTxtTask {
    id: number;
    priority?: string;
    createdDate?: string;
    completedDate?: string;
    projects?: string[];
    contexts?: string[];
    dueDate?: string;
    isActive?: boolean;
    text: string;
}
