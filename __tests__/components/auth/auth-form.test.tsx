import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/contexts/auth-context";

// Mock the components used by AuthForm
jest.mock("@/components/auth/email-sign-in-form", () => ({
  EmailSignInForm: jest.fn(
    ({ mode, onForgotPasswordClick, onSignUpSuccess }) => (
      <div data-testid="email-sign-in-form">
        <h2>{mode === "signIn" ? "Sign In" : "Sign Up"}</h2>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
        {mode === "signUp" && (
          <>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" />
          </>
        )}
        <button
          onClick={() => {
            // Mock the call to handleAuthAction
            if (onSignUpSuccess) onSignUpSuccess();
          }}
        >
          {mode === "signIn" ? "Sign In" : "Sign Up"}
        </button>
        {mode === "signIn" && (
          <button onClick={onForgotPasswordClick}>Forgot your password?</button>
        )}
        <button onClick={() => {}}>
          {mode === "signIn"
            ? "Don't have an account?"
            : "Already have an account?"}
        </button>
      </div>
    ),
  ),
}));

jest.mock("@/components/auth/forgot-password-form", () => ({
  ForgotPasswordForm: jest.fn(({ onCancel }) => (
    <div data-testid="forgot-password-form">
      <h2>Reset Password</h2>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <button
        onClick={() => {
          const mockAuth = useAuth();
          void mockAuth.sendPasswordResetEmail("test@example.com");
        }}
      >
        Send Reset Link
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )),
}));

jest.mock("@/components/auth/social-sign-in-buttons", () => ({
  SocialSignInButtons: jest.fn(() => (
    <div data-testid="social-sign-in-buttons">
      <button>Continue with GitHub</button>
      <button>Continue with Google</button>
    </div>
  )),
}));

// Mock the useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock the sonner toast function
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn() as jest.Mock,
    error: jest.fn() as jest.Mock,
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("AuthForm", () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockResetPassword = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signInWithPassword: mockSignIn,
      signUpWithPassword: mockSignUp,
      sendPasswordResetEmail: mockResetPassword,
      user: null,
      isLoading: false,
    });
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
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

  it("renders sign-up form when mode is signUp", () => {
    render(<AuthForm mode="signUp" />);

    // In our mocked component, we should look for the heading directly
    expect(
      screen.getByRole("heading", { name: /Sign Up/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("email-sign-in-form")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign Up/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
  });

  it("shows forgot password form when forgot password is clicked", () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    expect(screen.getByTestId("forgot-password-form")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Reset Password/i }),
    ).toBeInTheDocument();
  });

  it("returns to sign-in form when cancel is clicked on forgot password form", () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(
      screen.getByRole("heading", { name: /Sign In/i }),
    ).toBeInTheDocument();
  });

  it("calls signIn with correct credentials on sign-in form submission", async () => {
    render(<AuthForm />);
    // Simulate form submission with dummy values for email and password
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
  });

  it("calls signUp with correct credentials on sign-up form submission", async () => {
    render(<AuthForm mode="signUp" />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });
  });

  it("calls resetPassword with correct email on forgot password form submission", async () => {
    mockResetPassword.mockResolvedValueOnce({ error: null });
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("shows success toast when sign-in is successful", async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Signed in successfully!");
    });
  });

  it("shows error toast when sign-in fails", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: "Invalid credentials" },
    });
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("redirects to verify-email page on successful sign-up", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    render(<AuthForm mode="signUp" />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/verify-email");
    });
  });
});
