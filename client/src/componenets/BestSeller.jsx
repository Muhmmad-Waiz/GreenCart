import React from 'react'
import ProductsCards from './ProductsCards'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
    const {products}= useAppContext()
  return (
    <div className='mt-16'>
        <p className='text-2xl md:text-3xl font-medium'>Best Sellers</p>
        {/* {products.length > 0 && ( */}
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6'


>
    {products.filter((product)=>product.inStock).slice(0,5).map((product,index)=>(
    <ProductsCards key={index} product={product} />
    ))}
  </div>
{/* //  )}  */}

    </div>
  )
}

export default BestSeller