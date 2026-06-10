import HeroSection from '@/components/home/HeroSection'
import LogosBand from '@/components/home/LogosBand'
import ProblemSection from '@/components/home/ProblemSection'
import ProcessSection from '@/components/home/ProcessSection'
import ServicesPreview from '@/components/home/ServicesPreview'
import BeforeAfterSection from '@/components/home/BeforeAfterSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FormationsPreview from '@/components/home/FormationsPreview'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LogosBand />
      <ProblemSection />
      <ProcessSection />
      <ServicesPreview />
      <BeforeAfterSection />
      <TestimonialsSection />
      <FormationsPreview />
      <CTASection />
    </>
  )
}
