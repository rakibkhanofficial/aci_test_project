'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Rocket, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';

export function Hero() {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const text = "CHIMERA-01 Mission Control";

useEffect(() => {
  if (currentIndex < text.length) {
    const timeout = setTimeout(() => {
      setTypedText(prev => prev + text[currentIndex]);
      setCurrentIndex(currentIndex + 1);
    }, 100);
    
    // Return cleanup function
    return () => clearTimeout(timeout);
  }
  
  // Return undefined when not setting timeout (no cleanup needed)
  return undefined;
}, [currentIndex, text]);

  return (
    <div className="relative overflow-hidden pt-20 pb-32">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-space-950/90 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      <Container className="relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative p-6 bg-gray-900/50 backdrop-blur-sm rounded-full border border-gray-700">
                <Rocket className="h-16 w-16 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-ping" />
              </div>
            </div>
          </div>

          {/* Animated Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {typedText}
              <span className="ml-2 animate-pulse">|</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered deep space communication system for astronaut guidance and spacecraft diagnostics
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
            {[
              { label: 'Uptime', value: '99.99%', icon: Shield, color: 'text-green-400' },
              { label: 'Response Time', value: '< 2ms', icon: Zap, color: 'text-blue-400' },
              { label: 'Accuracy', value: '98.7%', icon: Globe, color: 'text-purple-400' },
              { label: 'Coverage', value: '100%', icon: Rocket, color: 'text-pink-400' },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800"
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className={`h-6 w-6 ${stat.color} mb-1`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg"
              asChild
            >
              <a href="/auth/register">
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 hover:bg-gray-800 px-8 py-6 text-lg"
              asChild
            >
              <a href="/about">
                Learn About Mission
              </a>
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20">
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}