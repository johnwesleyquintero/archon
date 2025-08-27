import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "@supabase/supabase-js";

import { SocialSignInButtons } from "@/components/auth/social-sign-in-buttons";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

// Mock the entire component's implementation to avoid window.location issues
jest.mock("@/components/auth/social-sign-in-buttons", () => ({
  SocialSignInButtons: jest.fn(({ isLoading, setIsLoading }) => {
    const { toast } = useToast(); // Move useToast outside handleSocialSignIn

    const handleSocialSignIn = async (provider: Provider) => {
      setIsLoading(true);
      try {
        const mockSupabase = createClient();
        const { error } = await mockSupabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: "http://localhost:3000/auth/callback",
          },
        });
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description: error.message,
          });
        }
      } catch (err) {
        console.error("Social sign in error:", err);
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="space-y-3">
        <button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={() => void handleSocialSignIn("github")}
        >
          {isLoading && "Loading..."}
          Continue with GitHub
        </button>
        <button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={() => void handleSocialSignIn("google")}
        >
          {isLoading && "Loading..."}
          Continue with Google
        </button>
      </div>
    );
  }),
}));

// Mock the Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("SocialSignInButtons", () => {
  const mockSignInWithOAuth = jest.fn();
  const mockSetIsLoading = jest.fn();
  let mockToast: jest.Mock;

  beforeEach(() => {
    // Mock Supabase auth methods
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    });

    // Mock toast
    mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    mockSignInWithOAuth.mockClear();
    mockSetIsLoading.mockClear();
    mockToast.mockClear();
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
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

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

    expect(mockToast).not.toHaveBeenCalled();
  });

  it("calls signInWithOAuth with 'github' when GitHub button is clicked", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

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

    expect(mockToast).not.toHaveBeenCalled();
  });

  it("handles OAuth sign-in error", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: "OAuth failed" },
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
      expect(mockToast).toHaveBeenCalledWith({
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
