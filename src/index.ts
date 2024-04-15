import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"

import Stripe from "stripe"
import { HTTPException } from "hono/http-exception"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

stripe.checkout.sessions

console.log(process.env.STRIPE_PUBLISHABLE_KEY)
const app = new Hono()

app.get("/checkout", async (c) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1P5jkUSEKxgA58oAcCXbe5Ta",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    })
    return c.json(session)
  } catch (error: any) {
    console.error(error)
    throw new HTTPException(500, { message: error?.message })
  }
})

app.post("/", (c) => {
  return c.text("My POST request")
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
