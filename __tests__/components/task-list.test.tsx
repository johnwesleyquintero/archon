import { render, screen } from "@testing-library/react";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskFiltersAndSort } from "@/hooks/use-task-filters-and-sort";

// Mock the hooks
jest.mock("@/hooks/use-tasks");
jest.mock("@/hooks/use-task-filters-and-sort");

describe("TaskList", () => {
  const mockOnAddTaskClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    (useTasks as jest.Mock).mockReturnValue({
      tasks: [],
      loading: false,
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      updateTask: jest.fn(),
      isMutating: false,
    });

    (useTaskFiltersAndSort as jest.Mock).mockReturnValue({
      filteredAndSortedTasks: [],
      sort: { field: "created_at", direction: "desc" },
      setSort: jest.fn(),
      filters: {
        status: "all",
        priority: "all",
        dueDate: "all",
        category: null,
        tags: [],
      },
      setFilters: jest.fn(),
    });
  });

  test("renders loading state correctly", () => {
    render(
      <TaskList
        tasks={[]}
        loading={true}
        onAddTaskClick={mockOnAddTaskClick}
        onAddTask={jest.fn()}
      />,
    );

    // Check for skeleton loaders
    expect(screen.getAllByTestId("task-skeleton")).toHaveLength(5);
  });

  test("renders empty state when no tasks exist", () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        onAddTaskClick={mockOnAddTaskClick}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByText("No tasks yet!")).toBeInTheDocument();
    expect(screen.getByText("Add New Task")).toBeInTheDocument();
  });

  // Additional tests for filtering, sorting, and task interactions
});
