'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Upload, 
  Users, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Server,
  Satellite
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentConversations } from '@/components/dashboard/RecentConversations';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Container className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading mission control...</p>
        </div>
      </Container>
    );
  }

  const stats = [
    {
      title: 'Total Conversations',
      value: '142',
      icon: MessageSquare,
      trend: { value: 12, isPositive: true },
      iconColor: 'text-blue-400',
    },
    {
      title: 'Files Uploaded',
      value: '87',
      icon: Upload,
      trend: { value: 8, isPositive: true },
      iconColor: 'text-green-400',
    },
    {
      title: 'Active Sessions',
      value: '3',
      icon: Users,
      description: 'You, Mission Control, Backup',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Avg Response Time',
      value: '1.2s',
      icon: BarChart3,
      trend: { value: 15, isPositive: false },
      iconColor: 'text-yellow-400',
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning' as const,
      message: 'Backup communication system requires maintenance',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'info' as const,
      message: 'System update scheduled for tomorrow 02:00 UTC',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'success' as const,
      message: 'All primary systems operating nominally',
      time: '6 hours ago',
    },
  ];

  return (
    <Container className="py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-2xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {session?.user?.name || 'Astronaut'}!
            </h1>
            <p className="text-gray-400">
              CHIMERA-01 systems are operating nominally. Ready for your next command.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">All Systems Go</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 space-y-6">
          <RecentConversations />
          
          {/* System Status */}
          <SystemStatus />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* System Alerts */}
          <Card className="backdrop-blur-sm bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30"
                >
                  <div className="mt-1">
                    {alert.type === 'warning' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    {alert.type === 'info' && (
                      <Server className="h-4 w-4 text-blue-500" />
                    )}
                    {alert.type === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-gray-600">
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card className="backdrop-blur-sm bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-blue-500" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Primary Comms', status: 'online', latency: '12ms' },
                { label: 'Backup Link', status: 'standby', latency: '45ms' },
                { label: 'Ground Control', status: 'online', latency: '280ms' },
                { label: 'Satellite Relay', status: 'online', latency: '120ms' },
              ].map((connection, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connection.status === 'online' ? 'bg-green-500 animate-pulse' :
                      connection.status === 'standby' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-300">{connection.label}</span>
                  </div>
                  <span className="text-sm text-gray-400">{connection.latency}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Last Signal Update</span>
                  <span className="text-sm text-green-400">Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}