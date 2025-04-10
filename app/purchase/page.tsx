"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { CREDIT_PACKAGES } from "@/lib/stripe"
import { Loader2, CreditCard, ArrowLeft } from "lucide-react"

export default function PurchasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handlePurchase() {
    if (!selectedPackage) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-800 dark:to-blue-950 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/game")}
          className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Game
        </Button>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Purchase Credits</CardTitle>
          <CardDescription className="text-center">Select a credit package to continue playing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedPackage === pkg.id ? "border-blue-500 dark:border-blue-400 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">${pkg.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handlePurchase} disabled={!selectedPackage || isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
