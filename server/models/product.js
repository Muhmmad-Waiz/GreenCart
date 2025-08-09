import mongoose from "mongoose";

const productschema = new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:Array,required:true},
    price:{type:Number,required:true},
    offerPrice:{type:Number,require:true},
    image:{type:Array,required:true},
    category:{type:String,required:true},
    inStock:{type:Boolean,default:true},

     
        
},{timestamps:true} )

const Product =mongoose.model.product|| mongoose.model('product', productschema)

export default Product;