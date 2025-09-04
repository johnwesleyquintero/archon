import { cn, AppError, handleError } from "@/lib/utils";

describe("cn", () => {
  it("should combine class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", null, "class2", undefined, "class3")).toBe(
      "class1 class2 class3",
    );
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
    expect(cn("class1", "class2", { class3: true }, "class4")).toBe(
      "class1 class2 class3 class4",
    );
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn(null, undefined, false, "")).toBe("");
  });
});

describe("AppError", () => {
  it("should create an AppError instance with default code", () => {
    const error = new AppError("Test message");
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Test message");
    expect(error.code).toBe("GENERIC_ERROR");
    expect(error.name).toBe("AppError");
    expect(error.details).toBeUndefined();
    expect(error.httpStatus).toBeUndefined();
  });

  it("should create an AppError instance with custom code and details", () => {
    const details = { userId: "123", reason: "invalid input" };
    const error = new AppError("Custom message", "CUSTOM_CODE", details, 400);
    expect(error.message).toBe("Custom message");
    expect(error.code).toBe("CUSTOM_CODE");
    expect(error.details).toEqual(details);
    expect(error.httpStatus).toBe(400);
  });
});

describe("handleError", () => {
  // Mock Sentry for testing purposes
  let sentryCaptureExceptionMock: jest.Mock;

  beforeAll(async () => {
    // Mock the entire @sentry/nextjs module
    jest.mock("@sentry/nextjs", () => ({
      captureException: jest.fn(() => {}),
    }));
    // Dynamically import Sentry after mocking
    const Sentry = await import("@sentry/nextjs");
    sentryCaptureExceptionMock = Sentry.captureException as jest.Mock;
  });

  beforeEach(() => {
    sentryCaptureExceptionMock.mockClear();
    // Temporarily store original console.error
    jest
      .spyOn(console, "error")
      .mockImplementation(console.error.bind(console)); // Re-adding bind to see if it helps
  });

  afterEach(() => {
    // Restore original console.error
    jest.restoreAllMocks();
  });

  it("should return an AppError instance for an AppError input", () => {
    const originalError = new AppError("Specific error", "SPECIFIC_CODE");
    const result = handleError(originalError);
    expect(result).toBeInstanceOf(AppError);
    expect(result).toBe(originalError);
    expect(console.error).toHaveBeenCalledWith(
      "[Application Error] Code: SPECIFIC_CODE, Message: Specific error",
      "",
    );
  });

  it("should convert a standard Error to AppError", () => {
    const originalError = new Error("Standard error message");
    const result = handleError(originalError, "Data Fetching");
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("Standard error message");
    expect(result.code).toBe("UNEXPECTED_ERROR");
    expect(result.details).toHaveProperty("originalStack");
    expect(console.error).toHaveBeenCalledWith(
      "[Data Fetching Error] Code: UNEXPECTED_ERROR, Message: Standard error message",
      expect.any(Object),
    );
  });

  it("should handle unknown errors and convert to AppError", () => {
    const unknownError = "Something went wrong string";
    const result = handleError(unknownError);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("An unknown error occurred.");
    expect(result.code).toBe("UNKNOWN_ERROR");
    expect(result.details).toEqual({ originalError: unknownError });
    expect(console.error).toHaveBeenCalledWith(
      "[Application Error] Code: UNKNOWN_ERROR, Message: An unknown error occurred.",
      expect.any(Object),
    );
  });

  it("should capture exception with Sentry in production environment", async () => {
    jest.replaceProperty(process, "env", {
      ...process.env,
      NODE_ENV: "production",
    });
    const error = new AppError("Test Sentry error", "SENTRY_TEST");
    handleError(error);

    // Wait for the dynamic import to resolve and Sentry.captureException to be called
    await new Promise(process.nextTick);

    expect(sentryCaptureExceptionMock).toHaveBeenCalledTimes(1);
    expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(error, {
      extra: {
        context: "Application",
        details: undefined,
        httpStatus: undefined,
      },
    });
  });

  it("should not capture exception with Sentry in development environment", async () => {
    jest.replaceProperty(process, "env", {
      ...process.env,
      NODE_ENV: "development",
    });
    const error = new AppError("Test Sentry error", "SENTRY_TEST");
    handleError(error);

    // Wait for the dynamic import to resolve (even if it doesn't call Sentry)
    await new Promise(process.nextTick);

    expect(sentryCaptureExceptionMock).not.toHaveBeenCalled();
  });
});
