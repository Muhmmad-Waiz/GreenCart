import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoutes.js';
import sellerRouter from './routes/sellerRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import productrouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import Address from './routes/addressRoutes.js';
import orderrouter from './routes/orderRoutes.js';
import {stripeWebhook} from './controllers/orderController.js'

const app = express();
const port = process.env.PORT ||4000;
await connectDB()
await connectCloudinary()

//allow multiple origin
const allowedOrigins = ['http://localhost:5173','http://localhost:5174','https://greencart-backend-mauve-theta.vercel.app']

app.post('/stripe', express.raw({type:'application/json'}),stripeWebhook)
//middleware configuration
app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins, credentials:true}))

app.get('/',(req,res)=>{ res.send("api  is working")})
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productrouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', Address)
app.use('/api/order', orderrouter)

app.listen(port,()=>{
    console.log(`seler is running on http://localhost:${port}`)
})