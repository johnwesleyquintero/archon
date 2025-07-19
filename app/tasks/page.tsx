import { TodoList } from "@/components/todo-list"

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
      <TodoList />
    </div>
  )
}
