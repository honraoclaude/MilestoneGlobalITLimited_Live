import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import AutomationDemo from '@/components/AutomationDemo'
import StatsBar from '@/components/StatsBar'
import HowItWorks from '@/components/HowItWorks'
import ProcessVisualiser from '@/components/ProcessVisualiser'
import ROICalculator from '@/components/ROICalculator'
import WhyUs from '@/components/WhyUs'
import FAQ from '@/components/FAQ'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <main className="min-h-screen bg-mgil-bg">
      <Navbar />
      <Hero />
      <Services />
      <StatsBar />
      <AutomationDemo />
      <HowItWorks />
      <ProcessVisualiser />
      <ROICalculator />
      <WhyUs />
      <FAQ />
      <ContactForm />
      <Footer />
      <ChatWidget />
    </main>
  )
}
