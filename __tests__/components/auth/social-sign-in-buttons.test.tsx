import {
  AuthResponse,
  AuthError,
  SignInWithOAuthCredentials,
} from "@supabase/supabase-js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SocialSignInButtons } from "@/components/auth/social-sign-in-buttons";
// No need to import useToast here just for its type, as the mock factory handles it.

// --- Define global mock functions ---
const mockSignInWithOAuth = jest.fn<
  Promise<AuthResponse>,
  [SignInWithOAuthCredentials]
>();
// Simplified mockToastFn - no need for _props or complex type inference here
const mockToastFn = jest.fn(() => ({ id: "mock-toast-id" }));

// --- Mock modules using the global mock functions ---
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth, // Use the global mock
    },
  })),
}));

jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: mockToastFn, // Use the global mock
    toasts: [],
  })),
}));

// No mock for SocialSignInButtons component itself

describe("SocialSignInButtons", () => {
  const mockSetIsLoading = jest.fn();

  beforeEach(() => {
    // Clear mocks directly
    mockSignInWithOAuth.mockClear();
    mockToastFn.mockClear();
    mockSetIsLoading.mockClear();
  });

  it("renders Google and GitHub sign-in buttons", () => {
    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    expect(
      screen.getByRole("button", { name: /Continue with Google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue with GitHub/i }),
    ).toBeInTheDocument();
  });

  it("calls signInWithOAuth with 'google' when Google button is clicked", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    });

    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });
    });

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    expect(mockToastFn).not.toHaveBeenCalled();
  });

  it("calls signInWithOAuth with 'github' when GitHub button is clicked", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    });

    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with GitHub/i }),
    );

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "github",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });
    });

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    expect(mockToastFn).not.toHaveBeenCalled();
  });

  it("handles OAuth sign-in error", async () => {
    const mockError = {
      name: "AuthApiError",
      message: "OAuth failed",
    };

    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: mockError as AuthError,
    });

    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with GitHub/i }),
    );

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "github",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });
    });

    await waitFor(() => {
      expect(mockToastFn).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Sign In Error",
        description: "OAuth failed",
      });
    });

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
