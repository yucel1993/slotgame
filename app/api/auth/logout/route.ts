import { NextResponse } from "next/server"
import { signOut } from "@/lib/auth"

export async function POST() {
  try {
    signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
