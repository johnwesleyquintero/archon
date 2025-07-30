import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

// Mock the useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("ForgotPasswordForm", () => {
  const mockResetPassword = jest.fn();
  const mockOnCancel = jest.fn();
  const mockSetIsLoading = jest.fn();
  let toast: jest.Mock;

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
      isLoading: false,
    });
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    toast = mockToast;

    mockResetPassword.mockClear();
    mockOnCancel.mockClear();
    mockSetIsLoading.mockClear();
    toast.mockClear();
  });

  it("renders the forgot password form correctly", () => {
    render(
      <ForgotPasswordForm
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Reset Password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Reset Email/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("calls onCancel when the 'Cancel' button is clicked", () => {
    render(
      <ForgotPasswordForm
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("handles successful password reset email submission", async () => {
    mockResetPassword.mockResolvedValueOnce({ data: {}, error: null });

    render(
      <ForgotPasswordForm
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "reset@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Email/i }));

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("reset@example.com");
    });
    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Password Reset Email Sent",
        description:
          "Please check your email for instructions to reset your password.",
      }),
    );
    expect(mockOnCancel).toHaveBeenCalledTimes(1); // Should navigate back after success
  });

  it("handles password reset email submission with error", async () => {
    mockResetPassword.mockResolvedValueOnce({
      data: null,
      error: { message: "User not found" },
    });

    render(
      <ForgotPasswordForm
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "nonexistent@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Email/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("nonexistent@example.com");
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Password Reset Failed",
        description: "User not found",
        variant: "destructive",
      }),
    );
    expect(mockOnCancel).not.toHaveBeenCalled(); // Should not navigate back on error
  });

  it("disables form when isLoading is true", () => {
    render(
      <ForgotPasswordForm
        isLoading={true}
        setIsLoading={mockSetIsLoading}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Send Reset Email/i }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDisabled();
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
  });
});
