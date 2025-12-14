'use client';

import { useState } from 'react';
import { Rocket, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

const benefits = [
  'Real-time spacecraft diagnostics',
  'AI-powered troubleshooting',
  'Secure encrypted communication',
  '24/7 mission support',
  'Automatic backup systems',
  'Cross-agency compatibility',
];

export function CTASection() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      // Simulate API call or check for existing session
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/auth/register');
    } catch (error) {
      toast.error('Failed to redirect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    toast.info('Demo mode available after registration');
    router.push('/auth/register');
  };

  return (
    <div className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <Container className="relative">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Card */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-3xl border border-gray-700 p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
                <Rocket className="h-12 w-12 text-blue-400" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Launch Your Mission?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join space agencies worldwide in revolutionizing deep space communication and diagnostics
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700"
                >
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Launching...
                  </div>
                ) : (
                  <>
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 hover:bg-gray-800 px-8 py-6 text-lg"
                onClick={handleDemo}
              >
                Request Demo
              </Button>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 pt-8 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Military-Grade Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-400">99.99% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Space-Certified Hardware</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Already have access?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Sign in here
              </button>
            </p>
            <p className="text-gray-600 text-xs mt-2">
              All access requires mission control approval. Demo credentials available upon request.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}