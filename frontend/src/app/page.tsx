import Hero from '@/components/Home/Hero';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Features from '@/components/Home/ScrollStack/Features';
import Integrations from '@/components/Home/Integrations';
import SocialProof from '@/components/Home/SocialProof';
import CTASection from '@/components/Home/CTASection';
import FAQSection from '@/components/Home/FAQSection';

export default function App() {
  return (
    <main className="w-full min-h-screen bg-black">
      <Header />
        <Hero />
        <Features />
        <Integrations />
        <SocialProof />
        <FAQSection />
        <CTASection />
      <Footer />
    </main>
  );
}

