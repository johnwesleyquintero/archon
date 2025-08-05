import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useToast } from "@/components/ui/use-toast";
import { forgotPassword } from "@/app/auth/actions";

// Mock the server action and other hooks
jest.mock("@/app/auth/actions");
jest.mock("@/components/ui/use-toast");

describe("ForgotPasswordForm", () => {
  const mockForgotPassword = forgotPassword as jest.Mock;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it("renders the form correctly", () => {
    render(<ForgotPasswordForm />);
    expect(
      screen.getByRole("heading", { name: /Reset Password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Reset Link/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("handles successful submission", async () => {
    mockForgotPassword.mockResolvedValueOnce({
      success: true,
      message: "Password reset email sent successfully.",
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Password Reset Email Sent",
        description: "Password reset email sent successfully.",
      });
    });
  });

  it("handles submission with error", async () => {
    mockForgotPassword.mockResolvedValueOnce({
      success: false,
      message: "User not found",
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Password Reset Error",
        description: "User not found",
      });
    });
  });
});
