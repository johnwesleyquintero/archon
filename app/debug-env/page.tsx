import { clientEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

export default function DebugEnvPage() {
  return (
    <div>
      <h1>Environment Variables Debug Page</h1>
      <h2>Client Environment Variables:</h2>
      <pre>{JSON.stringify(clientEnv, null, 2)}</pre>
      <h2>Server Environment Variables:</h2>
      <pre>{JSON.stringify(serverEnv, null, 2)}</pre>
    </div>
  );
}
