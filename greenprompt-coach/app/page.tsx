import Link from "next/link"

export default function Home() {
  return (
    <main className="h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-green-400">
          GreenPrompt Coach
        </h1>

        <p className="text-gray-400">
          AI Prompt Optimization & Cross-Platform Sync
        </p>

        <Link
          href="/dashboard"
          className="bg-green-500 px-6 py-3 rounded-lg text-black font-semibold hover:bg-green-400 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}