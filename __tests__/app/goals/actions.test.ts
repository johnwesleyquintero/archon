import { createGoal } from "@/app/goals/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

describe("createGoal", () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(),
    })),
  };

  let mockInsert: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const fromResult = mockSupabase.from();
    mockInsert = fromResult.insert as jest.Mock;
    mockSelect = fromResult.select as jest.Mock;
    (createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  test("should create a goal successfully", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    // Default mock for from, can be overridden in tests
    mockInsert.mockImplementation(() => ({
      select: jest.fn(() => ({
        data: [{ id: 1, title: "Test Goal" }],
        error: null,
      })),
    }));

    const formData = {
      title: "Test Goal",
      description: "This is a test goal.",
    };

    const result = await createGoal(formData);

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("goals");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      title: "Test Goal",
      description: "This is a test goal.",
      target_date: null,
      status: "pending",
    });
    expect(result).toEqual([{ id: 1, title: "Test Goal" }]);
  });

  test("should throw an error if user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const formData = {
      title: "Test Goal",
      description: "This is a test goal.",
    };

    await expect(createGoal(formData)).rejects.toThrow(
      "User not authenticated."
    );
  });

  test("should throw an error if goal creation fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    mockInsert.mockImplementation(() => ({
      select: jest.fn(() => ({
        data: null,
        error: { message: "Database error" },
      })),
    }));

    const formData = {
      title: "Test Goal",
      description: "This is a test goal.",
    };

    await expect(createGoal(formData)).rejects.toThrow(
      "Failed to create goal: Database error"
    );
  });
});