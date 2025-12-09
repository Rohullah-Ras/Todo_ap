export class TaskResponse {
  id: number;
  title: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDone: boolean;
  listId: number;
  statusId: number | null;
  listName?: string;
  statusName?: string | null;
}