import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the createClient function
const mockSignInWithPassword = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  }),
}));

describe("LoginForm", () => {
  it("renders without crashing", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("allows user to type in email and password fields", () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows password when eye icon is clicked", () => {
    render(<LoginForm />);
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const showPasswordButton = screen.getByRole("button", { name: "" }); // The button has no name

    // Initially, the password should be masked
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click the button to show the password
    fireEvent.click(showPasswordButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click the button again to hide the password
    fireEvent.click(showPasswordButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("displays an error message on failed login", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
  });
});
