import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

// Mock the useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

describe("AuthForm", () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockResetPassword = jest.fn();
  let toast: ReturnType<typeof useToast>["toast"];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      resetPassword: mockResetPassword,
      user: null,
      isLoading: false,
    });
    // Mock the useToast hook to return a mock toast function
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    toast = mockToast; // Assign the mock toast function to the variable

    mockToast.mockClear();
    mockSignIn.mockClear();
    mockSignUp.mockClear();
    mockResetPassword.mockClear();
  });

  it("renders sign-in form by default", () => {
    render(<AuthForm />);
    expect(
      screen.getByRole("heading", { name: /Sign In/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Forgot your password?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it("switches to sign-up form when 'Sign Up' link is clicked", () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(
      screen.getByRole("heading", { name: /Sign Up/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign Up/i }),
    ).toBeInTheDocument();
  });

  it("switches to forgot password form when 'Forgot your password?' link is clicked", () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    expect(
      screen.getByRole("heading", { name: /Reset Password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Reset Email/i }),
    ).toBeInTheDocument();
  });

  it("handles sign-in submission successfully", async () => {
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Signed in successfully!",
        description: "Welcome back to Archon.",
      }),
    );
  });

  it("handles sign-in submission with error", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "wrongpassword",
      );
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sign In Failed",
        description: "Invalid credentials",
        variant: "destructive",
      }),
    );
  });

  it("handles sign-up submission successfully", async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Sign Up/i));

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "newuser@example.com",
        "newpassword123",
      );
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Signed up successfully!",
        description: "Please check your email to verify your account.",
      }),
    );
  });

  it("handles sign-up submission with password mismatch", async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Sign Up/i));

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "mismatched" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match./i)).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("handles reset password submission successfully", async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "reset@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Email/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("reset@example.com");
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Password Reset Email Sent",
        description:
          "Please check your email for instructions to reset your password.",
      }),
    );
  });

  it("handles reset password submission with error", async () => {
    mockResetPassword.mockRejectedValueOnce(new Error("User not found"));
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));

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
  });
});
