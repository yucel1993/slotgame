import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { addCreditsToUser } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
})

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Add credits to user
    if (session.metadata?.userId && session.metadata?.creditsAmount) {
      const userId = session.metadata.userId
      const creditsAmount = Number.parseInt(session.metadata.creditsAmount, 10)

      await addCreditsToUser(userId, creditsAmount)
    }
  }

  return NextResponse.json({ received: true })
}
