import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderStripe,
} from "../controllers/orderController.js";
import authSeller from "../middlewares/authSeller.js";
const orderrouter = express.Router();

orderrouter.post("/COD", authUser, placeOrderCOD);

orderrouter.get("/user", authUser, getUserOrders);
orderrouter.get("/seller", authSeller, getAllOrders);
orderrouter.post("/stripe", authUser, placeOrderStripe);

export default orderrouter;
