import React from 'react'
import { MainBaneer } from '../componenets/MainBaneer'
import Categories from '../componenets/Categories'
import BestSeller from '../componenets/BestSeller'
import BottomBanner from '../componenets/bottomBanner'
import NewsLetter from '../componenets/NewsLetter'

const home = () => {
  return (
    <div className='mt-10'>
         <MainBaneer/>
         <Categories/>
         <BestSeller/>
         <BottomBanner/>
         <NewsLetter/>
         
    </div>
  )
}

export default home