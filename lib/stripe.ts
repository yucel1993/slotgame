import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export const CREDIT_PACKAGES = [
  { id: "credits-1000", name: "1,000 Credits", amount: 1000, price: 10 },
  { id: "credits-5000", name: "5,000 Credits", amount: 5000, price: 25 },
  { id: "credits-10000", name: "10,000 Credits", amount: 10000, price: 50 },
]

export async function createCheckoutSession(packageId: string, userId: string, userEmail: string) {
  const creditPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)

  if (!creditPackage) {
    throw new Error("Invalid package selected")
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: creditPackage.name,
            description: `${creditPackage.amount} credits for the Fruit Slot Machine game`,
          },
          unit_amount: creditPackage.price * 100, // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/purchase`,
    metadata: {
      userId,
      packageId,
      creditsAmount: creditPackage.amount.toString(),
    },
    customer_email: userEmail,
  })

  return session
}

export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId)
}
