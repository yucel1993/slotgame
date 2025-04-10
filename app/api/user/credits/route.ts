import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession, updateUserCredits } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ credits: user.credits })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get credits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { credits } = await request.json()

    if (typeof credits !== "number") {
      return NextResponse.json({ error: "Invalid credits value" }, { status: 400 })
    }

    await updateUserCredits(user.id, credits)

    return NextResponse.json({ success: true, credits })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
  }
}
