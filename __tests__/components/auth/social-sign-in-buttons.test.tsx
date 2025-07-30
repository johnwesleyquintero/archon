import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SocialSignInButtons } from "@/components/auth/social-sign-in-buttons";
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

describe("SocialSignInButtons", () => {
  const mockSignInWithOAuth = jest.fn();
  const mockSetIsLoading = jest.fn();
  let toast: jest.Mock;

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signInWithOAuth: mockSignInWithOAuth,
      isLoading: false,
    });
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    toast = mockToast;

    mockSignInWithOAuth.mockClear();
    mockSetIsLoading.mockClear();
    toast.mockClear();
  });

  it("renders Google and GitHub sign-in buttons", () => {
    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    expect(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in with GitHub/i }),
    ).toBeInTheDocument();
  });

  it("calls signInWithOAuth with 'google' when Google button is clicked", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ data: {}, error: null });

    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    );

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
    });
    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
    expect(toast).not.toHaveBeenCalled(); // OAuth sign-in typically redirects, so no toast here
  });

  it("calls signInWithOAuth with 'github' when GitHub button is clicked", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ data: {}, error: null });

    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in with GitHub/i }),
    );

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith("github");
    });
    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
    expect(toast).not.toHaveBeenCalled();
  });

  it("handles OAuth sign-in error", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: { message: "OAuth failed" },
    });

    render(
      <SocialSignInButtons isLoading={false} setIsLoading={mockSetIsLoading} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sign In Failed",
        description: "OAuth failed",
        variant: "destructive",
      }),
    );
  });

  it("disables buttons when isLoading is true", () => {
    render(
      <SocialSignInButtons isLoading={true} setIsLoading={mockSetIsLoading} />,
    );

    expect(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Sign in with GitHub/i }),
    ).toBeDisabled();
  });
});
