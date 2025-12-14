import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  iconColor = 'text-blue-400',
}: StatsCardProps) {
  return (
    <Card className={cn("backdrop-blur-sm bg-gray-900/50 border-gray-700", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-')}/20`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {(trend || description) && (
          <div className="flex items-center justify-between mt-2">
            {trend && (
              <p className={cn(
                "text-xs flex items-center",
                trend.isPositive ? "text-green-400" : "text-red-400"
              )}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                <span className="text-gray-400 ml-1">from last month</span>
              </p>
            )}
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}