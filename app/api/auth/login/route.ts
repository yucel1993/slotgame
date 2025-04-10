import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    await createSession(user._id.toString(), user.email)

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        credits: user.credits,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to login" }, { status: 500 })
  }
}
