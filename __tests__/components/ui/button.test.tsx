import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders the button correctly", () => {
    render(<Button>Test Button</Button>);
    expect(
      screen.getByRole("button", { name: /test button/i }),
    ).toBeInTheDocument();
  });

  it("renders as a child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Test Link</a>
      </Button>,
    );
    expect(
      screen.getByRole("link", { name: /test link/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies the correct variant classes", () => {
    render(<Button variant="destructive">Destructive Button</Button>);
    const button = screen.getByRole("button", { name: /destructive button/i });
    expect(button).toHaveClass("bg-destructive");
  });

  it("applies the correct size classes", () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole("button", { name: /large button/i });
    expect(button).toHaveClass("h-10");
  });
});
