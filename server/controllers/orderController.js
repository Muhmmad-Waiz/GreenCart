//place order on COD : /api/order/COC

import Order from "../models/Order.js";
import Product from "../models/product.js";
import Stripe from "stripe";
import User from "../models/User.js";

// PLACE ORDER COD
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // 2% tax

    // Assume all items belong to the same seller
    const firstProduct = await Product.findById(items[0].product);
    const sellerId = firstProduct.sellerId;

    await Order.create({
      userId,
      sellerId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
    });

    // Clear cart for COD orders too
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// PLACE ORDER STRIPE
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }

    let productData = [];

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // 2% tax

    // Assume all items belong to the same seller
    const firstProduct = await Product.findById(items[0].product);
    const sellerId = firstProduct.sellerId;

    const order = await Order.create({
      userId,
      sellerId,
      items,
      amount,
      address,
      paymentType: "ONLINE",
      isPaid: false,
    });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

  const session = await stripeInstance.checkout.sessions.create({
  line_items,
  mode: "payment",
  success_url: `${origin}/loader?next=my-orders`,
  cancel_url: `${origin}/cart`,
  payment_intent_data: {
    metadata: {
      orderId: order._id.toString(),
      userId,
    },
  },
});


    // Clear cart immediately after checkout initiation
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error });
  }
};

// STRIPE WEBHOOK
export const stripeWebhook = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  console.log("✅ Stripe webhook received at", new Date().toISOString());

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log("📌 Event Type:", event.type);
  console.log("📦 Event Data:", JSON.stringify(event.data.object, null, 2));

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("💰 Payment Intent Metadata:", paymentIntent.metadata);

        const { orderId, userId } = paymentIntent.metadata;

        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        console.log(`✅ Order ${orderId} marked as paid`);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("⚠️ Payment failed for metadata:", paymentIntent.metadata);

        const { orderId } = paymentIntent.metadata;
        await Order.findByIdAndDelete(orderId);

        console.log(`🗑️ Order ${orderId} deleted due to payment failure`);
        break;
      }
      default:
        console.warn(`🚫 Unhandled event type: ${event.type}`);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("🔥 Error handling webhook:", error.message);
    res.status(500).send("Webhook handler failed");
  }
};


// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({
      userId,
      $or: [
        { paymentType: "COD" },
        { paymentType: "ONLINE" }, // show all online orders
      ],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET ALL ORDERS (seller/admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { paymentType: "ONLINE" }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
