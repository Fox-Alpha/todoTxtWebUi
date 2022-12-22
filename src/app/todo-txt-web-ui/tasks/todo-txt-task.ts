export interface TodoTxtTask {
    id: number;
    priority?: string;
    createdDate?: string;
    completedDate?: string;
    projects?: string[];
    contexts?: string[];
    metadatas?: string[];
    isActive?: boolean;
    text: string;
}
