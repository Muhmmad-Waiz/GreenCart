import express from 'express'
import authUser from '../middlewares/authUser.js'
import { addAddress, getAddress } from '../controllers/addressController.js'

const addressrouter = express.Router()
addressrouter.post('/add', authUser,addAddress)
addressrouter.get('/get', authUser,getAddress)

export default addressrouter;