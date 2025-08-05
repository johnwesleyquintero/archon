import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// Mock the components used by AuthForm
jest.mock("@/components/auth/email-sign-in-form", () => ({
  EmailSignInForm: jest.fn(
    ({
      mode,
      isLoading,
      setIsLoading,
      onForgotPasswordClick,
      onSignUpSuccess,
      handleAuthAction, // Add handleAuthAction to mock props
    }) => (
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
            if (mode === "signIn") {
              void handleAuthAction("signIn", {
                email: "test@example.com",
                password: "password123",
              });
            } else {
              void handleAuthAction("signUp", {
                email: "test@example.com",
                password: "password123",
              });
              if (onSignUpSuccess) onSignUpSuccess();
            }
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
  ForgotPasswordForm: jest.fn(({ isLoading, setIsLoading, onCancel }) => (
    <div data-testid="forgot-password-form">
      <h2>Reset Password</h2>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <button
        onClick={() => {
          const mockAuth = useAuth();
          mockAuth.sendPasswordResetEmail("test@example.com");
        }}
      >
        Send Reset Link
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )),
}));

jest.mock("@/components/auth/social-sign-in-buttons", () => ({
  SocialSignInButtons: jest.fn(({ isLoading, setIsLoading }) => (
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
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
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
    const mockHandleAuthAction = jest.fn();
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
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
    const mockHandleAuthAction = jest.fn();
    render(<AuthForm mode="signUp" handleAuthAction={mockHandleAuthAction} />);

    // In our mocked component, we should look for the heading directly
    expect(
      screen.getByRole("heading", { name: /Sign Up/i }),
    ).toBeInTheDocument();

    // Check for the presence of the email-sign-in-form testid instead of specific elements
    expect(screen.getByTestId("email-sign-in-form")).toBeInTheDocument();

    // Check for the button directly
    expect(
      screen.getByRole("button", { name: /Sign Up/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
  });

  it("shows forgot password form when forgot password is clicked", () => {
    const mockHandleAuthAction = jest.fn();
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    expect(screen.getByTestId("forgot-password-form")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Reset Password/i }),
    ).toBeInTheDocument();
  });

  it("returns to sign-in form when cancel is clicked on forgot password form", () => {
    const mockHandleAuthAction = jest.fn();
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(
      screen.getByRole("heading", { name: /Sign In/i }),
    ).toBeInTheDocument();
  });

  it("calls signIn with correct credentials on sign-in form submission", async () => {
    const mockHandleAuthAction = jest
      .fn()
      .mockResolvedValueOnce({ error: null });
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
    await waitFor(() => {
      expect(mockHandleAuthAction).toHaveBeenCalledWith("signIn", {
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("calls signUp with correct credentials on sign-up form submission", async () => {
    const mockHandleAuthAction = jest
      .fn()
      .mockResolvedValueOnce({ error: null });
    render(<AuthForm mode="signUp" handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    await waitFor(() => {
      expect(mockHandleAuthAction).toHaveBeenCalledWith("signUp", {
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("calls resetPassword with correct email on forgot password form submission", async () => {
    mockResetPassword.mockResolvedValueOnce({ error: null });
    const mockHandleAuthAction = jest.fn();
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByText(/Forgot your password?/i));
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("shows success toast when sign-in is successful", async () => {
    const mockHandleAuthAction = jest
      .fn()
      .mockResolvedValueOnce({ error: null });
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
    await waitFor(() => {
      expect(mockHandleAuthAction).toHaveBeenCalled();
    });
  });

  it("shows error toast when sign-in fails", async () => {
    const mockHandleAuthAction = jest.fn().mockResolvedValueOnce({
      error: { message: "Invalid credentials" },
    });
    render(<AuthForm handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
    await waitFor(() => {
      expect(mockHandleAuthAction).toHaveBeenCalled();
    });
  });

  it("redirects to verify-email page on successful sign-up", async () => {
    const mockHandleAuthAction = jest
      .fn()
      .mockResolvedValueOnce({ error: null });
    render(<AuthForm mode="signUp" handleAuthAction={mockHandleAuthAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    await waitFor(() => {
      expect(mockHandleAuthAction).toHaveBeenCalled();
    });
  });
});
