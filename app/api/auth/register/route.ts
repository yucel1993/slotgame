import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const user = await createUser(email, password)
    await createSession(user.id.toString(), user.email)

    return NextResponse.json({ success: true, user: { email: user.email } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 })
  }
}
