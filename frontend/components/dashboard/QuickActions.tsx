'use client';

import { 
  MessageSquare, 
  Upload, 
  Download, 
  Settings, 
  Bell,
  Shield,
  Zap,
  AlertTriangle,
  Satellite
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export function QuickActions() {
  const router = useRouter();
  const toast = useToast();

  const quickActions: QuickAction[] = [
    {
      id: 'new-chat',
      label: 'New Chat',
      description: 'Start new conversation',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-blue-500/20 text-blue-400',
      action: () => router.push('/chat'),
    },
    {
      id: 'upload',
      label: 'Upload Logs',
      description: 'Upload system diagnostics',
      icon: <Upload className="h-5 w-5" />,
      color: 'bg-green-500/20 text-green-400',
      action: () => {
        toast.info('Upload feature coming soon');
      },
    },
    {
      id: 'backup',
      label: 'Backup Data',
      description: 'Create system backup',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-purple-500/20 text-purple-400',
      action: () => {
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 2000)),
          {
            loading: 'Creating backup...',
            success: 'Backup completed successfully',
            error: 'Backup failed',
          }
        );
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'System configuration',
      icon: <Settings className="h-5 w-5" />,
      color: 'bg-yellow-500/20 text-yellow-400',
      action: () => router.push('/settings'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'View all alerts',
      icon: <Bell className="h-5 w-5" />,
      color: 'bg-red-500/20 text-red-400',
      action: () => {
        toast.warning('3 new notifications');
      },
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Run security scan',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-emerald-500/20 text-emerald-400',
      action: () => {
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 3000)),
          {
            loading: 'Running security scan...',
            success: 'All systems secure',
            error: 'Security scan failed',
          }
        );
      },
    },
  ];

  const emergencyActions = [
    {
      id: 'emergency',
      label: 'Emergency Protocol',
      description: 'Activate emergency measures',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-red-500/20 text-red-400',
      action: () => {
        if (window.confirm('Are you sure you want to activate emergency protocol?')) {
          toast.error('Emergency protocol activated!');
        }
      },
    },
    {
      id: 'power',
      label: 'Power Cycle',
      description: 'Restart non-critical systems',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-orange-500/20 text-orange-400',
      action: () => {
        if (window.confirm('Initiate power cycle?')) {
          toast.warning('Power cycle initiated');
        }
      },
    },
  ];

  return (
    <Card className="backdrop-blur-sm bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5 text-blue-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 border-gray-700 hover:border-gray-600 hover:bg-gray-800/30"
              onClick={action.action}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                {action.icon}
              </div>
              <div className="text-center">
                <div className="font-medium text-white text-sm">{action.label}</div>
                <div className="text-xs text-gray-400">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Emergency Actions */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-white mb-3">Emergency Controls</h4>
          <div className="space-y-2">
            {emergencyActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start p-3 border-gray-700 hover:border-red-500/50 hover:bg-red-500/10"
                onClick={action.action}
              >
                <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">{action.label}</div>
                  <div className="text-xs text-gray-400">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">System Status</span>
            </div>
            <span className="text-green-400 font-medium">Nominal</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">Last Updated</span>
            <span className="text-gray-300">Just now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}