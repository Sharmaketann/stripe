import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import Stripe from "stripe"
import { HTTPException } from "hono/http-exception"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const app = new Hono()
app.use("/*", cors()) // optional, only required if frontend is on different domain/port
app.use(logger())

app.get("/", (c) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Checkout</title>
      <script src="https://js.stripe.com/v3/"></script>
    </head>
    <body>
      <h1>Checkout</h1>
      <button id="checkoutButton">Checkout</button>

      <script>
        const checkoutButton = document.getElementById('checkoutButton');
        checkoutButton.addEventListener('click', async () => {
          const response = await fetch('/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const { id } = await response.json();
          const stripe = Stripe('${process.env.STRIPE_PUBLISHABLE_KEY}');
          await stripe.redirectToCheckout({ sessionId: id });
        });
      </script>
    </body>
  </html>
`
  return c.html(html)
})

app.get("/success", (c) => {
  return c.text("Success!")
})

app.get("/cancel", (c) => {
  return c.text("Hello Hono!")
})

app.post("/checkout", async (c) => {
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

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
