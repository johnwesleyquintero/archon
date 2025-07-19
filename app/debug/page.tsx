import { debugEnvironment } from "@/lib/supabase/config"

export default function DebugPage() {
  const validation = debugEnvironment()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Configuration Debug</h1>

      <div className="space-y-4">
        <div className="bg-slate-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Configuration Status</h2>
          <p className={`text-sm ${validation.isValid ? "text-green-600" : "text-red-600"}`}>
            {validation.isValid ? "✅ Configuration is valid" : "❌ Configuration has errors"}
          </p>
        </div>

        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Errors:</h3>
            <ul className="list-disc list-inside text-sm text-red-700">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Configuration Values:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>URL: {validation.config.url ? `${validation.config.url.substring(0, 30)}...` : "Not set"}</p>
            <p>
              Anon Key: {validation.config.anonKey ? `${validation.config.anonKey.substring(0, 20)}...` : "Not set"}
            </p>
            <p>Service Role Key: {validation.config.serviceRoleKey ? "Set" : "Not set"}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Check if .env.local exists in your project root</li>
            <li>Verify your Supabase project URL and keys in the Supabase dashboard</li>
            <li>Restart your development server after changing environment variables</li>
            <li>If using Vercel, check your project environment variables</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
