import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Services from '@/components/Services'
import Testimonials from '@/components/Testimonials'
import React from 'react'

const page = () => {
  return (
    <div>

      <Hero/>
      <Services/>
      <HowItWorks/>
      <Testimonials/>
      <CTABanner/>
    </div>
  )
}

export default page