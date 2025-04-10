import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import clientPromise from "./mongodb"

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}

export async function createUser(email: string, password: string) {
  const client = await clientPromise
  const db = client.db()

  const existingUser = await db.collection("users").findOne({ email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await hashPassword(password)

  const result = await db.collection("users").insertOne({
    email,
    password: hashedPassword,
    credits: 100, // Initial credits for new users
    createdAt: new Date(),
  })

  return { id: result.insertedId, email }
}

export async function getUserByEmail(email: string) {
  const client = await clientPromise
  const db = client.db()

  return db.collection("users").findOne({ email })
}

export async function createSession(userId: string, email: string) {
  const token = sign({ userId, email }, process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production", {
    expiresIn: "7d",
  })

  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return token
}

export async function getSession() {
  const token = cookies().get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    return verify(token, process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production")
  } catch (error) {
    return null
  }
}

export async function getUserFromSession() {
  const session = await getSession()

  if (!session || !session.userId) {
    return null
  }

  const client = await clientPromise
  const db = client.db()

  const user = await db.collection("users").findOne({
    _id: session.userId,
  })

  if (!user) {
    return null
  }

  return {
    id: user._id.toString(),
    email: user.email,
    credits: user.credits,
  }
}

export async function updateUserCredits(userId: string, credits: number) {
  const client = await clientPromise
  const db = client.db()

  await db.collection("users").updateOne({ _id: userId }, { $set: { credits } })
}

export async function addCreditsToUser(userId: string, creditsToAdd: number) {
  const client = await clientPromise
  const db = client.db()

  const result = await db
    .collection("users")
    .findOneAndUpdate({ _id: userId }, { $inc: { credits: creditsToAdd } }, { returnDocument: "after" })

  return result.value
}

export function signOut() {
  cookies().delete("auth-token")
}
