import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/contexts/auth-context";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

describe("AuthGuard", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: "/",
    });
    mockPush.mockClear();
  });

  it("renders children when user is authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "123" },
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to sign-in page when user is not authenticated and not loading", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/signin");
    });
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("does not redirect immediately when authentication status is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: true });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    // Optionally, you might expect a loading spinner or similar UI here
  });

  it("renders children after loading if user becomes authenticated", async () => {
    let userState: { id: string } | null = null;
    let loadingState = true;

    (useAuth as jest.Mock).mockImplementation(() => ({
      user: userState,
      isLoading: loadingState,
    }));

    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    // Simulate authentication status changing after loading
    userState = { id: "123" };
    loadingState = false;
    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects after loading if user remains unauthenticated", async () => {
    let userState: { id: string } | null = null;
    let loadingState = true;

    (useAuth as jest.Mock).mockImplementation(() => ({
      user: userState,
      isLoading: loadingState,
    }));

    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    // Simulate authentication status changing after loading
    userState = null;
    loadingState = false;
    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/signin");
    });
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
