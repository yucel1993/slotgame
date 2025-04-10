import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { packageId } = await request.json()

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    const session = await createCheckoutSession(packageId, user.id, user.email)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}
