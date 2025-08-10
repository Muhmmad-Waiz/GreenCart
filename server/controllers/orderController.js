

//place order on COD : /api/order/COC

import { response } from "express";
import Order from "../models/Order.js"
import Product from "../models/product.js"
import Stripe from "stripe"
import User from "../models/User.js"

export const placeOrderCOD = async (req, res) => {
  try {
    const {  items, address } = req.body;
    const userId = req.userId;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid Data' });
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
      sellerId, // ✅ new field
      items,
      amount,
      address,
      paymentType: "COD"
    });

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//place order stripe  /api/order/stripe
export const placeOrderStripe= async (req, res) => {
  try {
    const {  items, address } = req.body;
    const userId = req.userId;

    const {origin} = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid Data' });
    }

    let productData = [];


    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name:product.name,
        price:product.offerPrice,
        quantity:item.quantity
      })
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // 2% tax

    // Assume all items belong to the same seller
    const firstProduct = await Product.findById(items[0].product);
    const sellerId = firstProduct.sellerId;

    const order =  await Order.create({
      userId,
      sellerId, // ✅ new field
      items,
      amount,
      address,
      paymentType: "ONLINE"
    });

  //stripe gateaway initializayion
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  //create linestripe for stripe
  const line_items= productData.map((item)=>{
return{
  price_data:{
    currency:"usd",
    product_data:{
      name:item.name,
    },
    unit_amount:Math.floor(item.price + item.price * 0.02) * 100 
  },
  quantity:item.quantity,
}
  })
  //create session
  const session = await stripeInstance.checkout.sessions.create({
    line_items,
    mode:"payment",
    success_url:`${origin}/loader?next=my-orders`,
    cancel_url:`${origin}/cart`,
    metadata:{
      orderId: order._id.toString(),
      userId,
    }
  })

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//STRIPE WEBHOOK TO VERIFY PAYET ACTION :/STRIPE
export const stripeWebhook = async(req,response)=>{
//stripe gateway initilization
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;
   try {
    event= stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET

    )
   } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`)
   }
   //handle the event
   switch (event.type) {
    case "checkout.session.completed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id
      //getting session meta data
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId,
      })

      const{orderId,userId} = session.data[0].metadata;
      //mark payment as paid
      await Order.findByIdAndUpdate(orderId,{isPaid:true})
      //clear user cart
      await User.findByIdAndUpdate(userId,{cartItems:{}})
     break;
    }
     case "payment_intent.payment_failed" :{
       const paymentIntent = e.data.object;
      const paymentIntentId = paymentIntent.id
      //getting session meta data
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId,
      })

      const{orderId} = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId)
      break;
     }
      
      
   
    default:
console.error(`unhandled event type ${event.type}`)
      break;
   }
   response.json({received:true});
}


// export const placeOrderCOD = async(req ,res)=>{
// try {
//     const {userId,items,address}= req.body
//     if(!address || items.length ===0){
//         return res.json({success:false,message:'Invalid Data'})
//     }
//     //calculate amount using items
//     let amount = await items.reduce(async(acc,item)=>{
//         const product = await Product.findById(item.product)
//         return (await acc) + product.offerPrice * item.quantity;
//     },0)
//     //add tax charge 2%
//     amount+=Math.floor(amount * 0.2);
//     await Order.create({userId,items,amount,address,paymentType:"COD"});
//     return res.json({success:true,message:'Order place succesfully'})
// } catch (error) {
//     console.log(error.message)
//     return res.json({success:false, message:error.message})
// }
// }

//get order by user id :/api/order/user

export const getUserOrders = async (req,res)=>{
try {
    const userId = req.userId
    const orders = await Order.find({userId,$or:[{paymentType:"COD"},
        {isPaid: true}]}).populate("items.product address").sort({createdAt:-1});
        res.json({success:true,orders})
} catch (error) {
        console.log(error.message)
    return res.json({success:false, message:error.message})
}
}

//get all orders (for/seller/admin):/api/order/seller
export const getAllOrders = async (req,res)=>{
try {
    const orders = await Order.find({$or:[{paymentType:"COD"},
        {isPaid: true}]}).populate("items.product address").sort({createdAt:-1});
        res.json({success:true,orders})
} catch (error) {
        console.log(error.message)
    return res.json({success:false, message:error.message})
}
}