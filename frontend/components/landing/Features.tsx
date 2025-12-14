import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Brain, 
  Cloud, 
  Upload,
  MessageSquare,
  BarChart3,
  Clock
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: 'AI-Powered Diagnostics',
    description: 'Advanced machine learning algorithms analyze spacecraft systems in real-time',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'Natural Language Interface',
    description: 'Communicate with the system using plain English commands',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Upload className="h-8 w-8" />,
    title: 'Multimodal Input',
    description: 'Upload images, sensor data, and documents for comprehensive analysis',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Military-Grade Security',
    description: 'End-to-end encryption with quantum-resistant algorithms',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Real-Time Processing',
    description: 'Ultra-low latency analysis with sub-second response times',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Global Coverage',
    description: 'Maintain communication across any distance in the solar system',
    color: 'from-indigo-500 to-blue-500',
  },
];

const stats = [
  { label: 'Response Time', value: '< 2ms', icon: Clock },
  { label: 'Accuracy Rate', value: '99.7%', icon: BarChart3 },
  { label: 'Uptime', value: '99.99%', icon: Zap },
  { label: 'Data Security', value: 'AES-256', icon: Lock },
];

export function Features() {
  return (
    <div className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent" />
      
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Mission-Critical Features
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Designed for the harsh environment of deep space with reliability as the top priority
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-sm bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02]"
            >
              <CardHeader>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Stats */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
          <div className="relative bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              System Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gray-800/30 border border-gray-700"
                >
                  <div className="inline-flex p-3 rounded-lg bg-gray-700/50 mb-4">
                    <stat.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Fault-Tolerant Architecture</h3>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                <Cloud className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Redundant Systems</h4>
                <p className="text-gray-400">
                  Multiple backup systems ensure continuous operation even during failures
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                <Lock className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Secure Communication</h4>
                <p className="text-gray-400">
                  Encrypted data transmission with automatic failover to backup channels
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Auto-Recovery</h4>
                <p className="text-gray-400">
                  Self-healing systems automatically detect and resolve issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}