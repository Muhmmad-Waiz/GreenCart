import express from 'express'
import { upload } from '../configs/multer.js'
import authSeller from '../middlewares/authSeller.js'
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js'
const productrouter = express.Router()

productrouter.post('/add',upload.array(["images"]),authSeller,addProduct);
productrouter.get('/list',productList)
productrouter.get('/id',productById)
productrouter.post('/stock',authSeller,changeStock)

export default productrouter;
