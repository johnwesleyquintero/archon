import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";
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

describe("EmailSignInForm", () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockOnForgotPasswordClick = jest.fn();
  const mockOnSignUpSuccess = jest.fn();
  const mockSetIsLoading = jest.fn();
  let toast: jest.Mock; // Explicitly type toast as a Jest mock function

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      user: null,
      isLoading: false,
    });
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    toast = mockToast; // Assign the mock toast function to the variable

    mockSignIn.mockClear();
    mockSignUp.mockClear();
    mockOnForgotPasswordClick.mockClear();
    mockOnSignUpSuccess.mockClear();
    mockSetIsLoading.mockClear();
    toast.mockClear(); // Now toast is correctly typed as a mock, so mockClear exists
  });

  it("renders sign-in form correctly", () => {
    render(
      <EmailSignInForm
        mode="signIn"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

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

  it("renders sign-up form correctly", () => {
    render(
      <EmailSignInForm
        mode="signUp"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Sign Up/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign Up/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
  });

  it("calls onForgotPasswordClick when 'Forgot your password?' is clicked", () => {
    render(
      <EmailSignInForm
        mode="signIn"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

    fireEvent.click(screen.getByText(/Forgot your password?/i));
    expect(mockOnForgotPasswordClick).toHaveBeenCalledTimes(1);
  });

  it("handles sign-in submission successfully", async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { user: { id: "123" } },
      error: null,
    });

    render(
      <EmailSignInForm
        mode="signIn"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });
    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Signed in successfully!",
      }),
    );
  });

  it("handles sign-in submission with error", async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Invalid credentials" },
    });

    render(
      <EmailSignInForm
        mode="signIn"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

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
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "123" } },
      error: null,
    });

    render(
      <EmailSignInForm
        mode="signUp"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

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
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "newuser@example.com",
        "newpassword123",
      );
    });
    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Signed up successfully!",
      }),
    );
    expect(mockOnSignUpSuccess).toHaveBeenCalledTimes(1);
  });

  it("handles sign-up submission with password mismatch error", async () => {
    render(
      <EmailSignInForm
        mode="signUp"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

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
    expect(mockSetIsLoading).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it("handles sign-up submission with backend error", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "User already exists" },
    });

    render(
      <EmailSignInForm
        mode="signUp"
        isLoading={false}
        setIsLoading={mockSetIsLoading}
        onForgotPasswordClick={mockOnForgotPasswordClick}
        onSignUpSuccess={mockOnSignUpSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "existing@example.com" },
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
        "existing@example.com",
        "password123",
      );
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sign Up Failed",
        description: "User already exists",
        variant: "destructive",
      }),
    );
    expect(mockOnSignUpSuccess).not.toHaveBeenCalled();
  });
});
