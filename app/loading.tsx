import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-800 to-purple-950">
      <Card className="w-full max-w-md p-6 bg-yellow-800 border-4 border-yellow-600">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-100 animate-pulse">Loading...</div>
        </div>
      </Card>
    </div>
  )
}
