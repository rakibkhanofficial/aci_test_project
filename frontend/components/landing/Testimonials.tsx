import { 
  Star, 
  Quote, 
  User,
  Rocket,
  Globe,
  Shield
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Commander Alex Johnson',
    role: 'ISS Mission Specialist',
    content: 'CHIMERA saved our mission when our primary life support system showed anomalies. The AI accurately diagnosed the issue and guided us through the repair procedure.',
    rating: 5,
    avatar: 'AJ',
    mission: 'ISS Expedition 67',
  },
  {
    name: 'Dr. Sarah Chen',
    role: 'NASA Lead Scientist',
    content: 'The multimodal analysis capabilities are groundbreaking. Being able to show the system a component and get instant diagnostics has revolutionized how we conduct maintenance.',
    rating: 5,
    avatar: 'SC',
    mission: 'Mars Simulation Program',
  },
  {
    name: 'Captain Mikhail Volkov',
    role: 'Roscosmos Cosmonaut',
    content: 'As someone who has worked with multiple space agencies, I can confidently say CHIMERA is the most advanced astronaut assistance system ever deployed.',
    rating: 5,
    avatar: 'MV',
    mission: 'Soyuz MS-22',
  },
];

const missionStats = [
  { icon: Rocket, label: 'Missions Supported', value: '142+' },
  { icon: Globe, label: 'Countries', value: '18' },
  { icon: Shield, label: 'Critical Issues Resolved', value: '1,247' },
  { icon: User, label: 'Astronauts Trained', value: '89' },
];

export function Testimonials() {
  return (
    <div className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <Container className="relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trusted by Space Agencies Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real astronauts. Real missions. Real results.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="backdrop-blur-sm bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-12 w-12 border border-gray-700">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-xs text-blue-400">{testimonial.mission}</div>
                  </div>
                </div>

                <Quote className="h-6 w-6 text-gray-600 mb-4" />
                
                <p className="text-gray-300 mb-6 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Verified Mission
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Stats */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Mission Impact Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {missionStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-800/30 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
                  <stat.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Logos */}
        <div className="mt-16">
          <h4 className="text-lg font-medium text-gray-400 text-center mb-8">
            Developed in partnership with
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {['NASA', 'ESA', 'JAXA', 'Roscosmos', 'SpaceX', 'Blue Origin'].map((agency) => (
              <div
                key={agency}
                className="text-2xl font-bold text-gray-300 hover:text-white transition-colors"
              >
                {agency}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}