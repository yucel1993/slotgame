"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session ID")
      setIsLoading(false)
      return
    }

    // Credits are added via webhook, so we just need to wait a moment
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [sessionId])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-800 dark:to-blue-950 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-green-500" />
            ) : (
              <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
            )}
            Payment Successful
          </CardTitle>
          <CardDescription className="text-center">
            {isLoading ? "Processing your payment..." : "Your credits have been added to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <p className="text-center">
              {isLoading
                ? "Please wait while we process your payment..."
                : "Thank you for your purchase! Your credits are now available in your account."}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/game")} disabled={isLoading}>
            Return to Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
