"use client";

import dynamic from "next/dynamic";

const DynamicCommandMenu = dynamic(
  () =>
    import("@/components/custom/command-menu").then((mod) => ({
      default: mod.CommandMenu,
    })),
  { ssr: false },
);

export default DynamicCommandMenu;
