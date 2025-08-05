import { Task } from "./task";

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};
