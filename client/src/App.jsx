import React from 'react'
import Navbar from './componenets/Navbar'
import { Route , Routes, useLocation } from 'react-router-dom';
import Home from './pages/home';
import {Toaster} from 'react-hot-toast'
import Fotter from "./componenets/Fotter";
import {useAppContext} from "./context/AppContext";
import Login from './componenets/Login'; 
import AllProducts from './pages/AllProducts';
import ProductCategories from "./pages/ProductCategories";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AddAdress from './pages/AddAdress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './componenets/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProducts from './pages/seller/AddProducts';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Loading from './componenets/loading';


export const App = () => {
const isSellerPath =useLocation().pathname.includes("seller")
const {showUserLogin, isSeller} = useAppContext()

  return ( 
    <div className='text-default min-h-screen text-gray-700 bg-white'>

      {isSellerPath ? null : <Navbar/>}
      {showUserLogin ?<Login/>:null}

      <Toaster/>

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"} `}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/products' element={<AllProducts/>}/>
          <Route path='/products/:category' element={<ProductCategories/>}/>
          <Route path='/products/:category/:id' element={<ProductDetail/>}/>
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/add-address' element={<AddAdress/>}/> 
          <Route path='/my-orders' element={<MyOrders/>}/> 
          <Route path='/loader' element={<Loading/>}/> 


          <Route path='/seller' element={isSeller?<SellerLayout/>:<SellerLogin/>} >
          <Route index element={isSeller ? <AddProducts/> : null }/>
          <Route path='product-list' element={isSeller ? <ProductList/> : null }/>
          <Route path='orders' element={isSeller ? <Orders/> : null }/>
          </Route>
        </Routes> 
        
      </div>
      {!isSellerPath && <Fotter/>}
    
    </div>
  )
}

export default App;
