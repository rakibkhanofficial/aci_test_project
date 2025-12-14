import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTASection } from '@/components/landing/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <CTASection />
    </>
  );
}