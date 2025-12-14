'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Rocket } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        toast.error('Login failed', {
          description: 'Please check your credentials and try again.',
        });
      } else {
        toast.success('Welcome back!', {
          description: 'Successfully logged into CHIMERA system.',
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error('Login failed', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    form.setValue('username', 'astronaut_01');
    form.setValue('password', 'SecurePass123!');
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username: 'astronaut_01',
        password: 'SecurePass123!',
        redirect: false,
      });

      if (result?.error) {
        setError('Demo login failed');
        toast.error('Demo login unavailable');
      } else {
        toast.success('Welcome aboard!', {
          description: 'Entering demo mode as Astronaut 01.',
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('Demo login failed');
      toast.error('Demo system unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-gray-900/50 border-gray-700 shadow-2xl">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75" />
            <div className="relative p-3 bg-gray-900 rounded-full border border-gray-700">
              <Rocket className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white">
          Mission Control Access
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your credentials to access the CHIMERA system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="astronaut_01"
                      className="bg-gray-800/50 border-gray-600 focus:border-blue-500"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-gray-800/50 border-gray-600 focus:border-blue-500"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Launch System'}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-400">Or try demo</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-gray-600 hover:bg-gray-800 hover:text-white"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Demo Astronaut Login
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have access?{' '}
              <a
                href="/auth/register"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Request credentials
              </a>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-xs text-gray-500 text-center">
          Secure access required. All login attempts are logged.
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">System Online</span>
        </div>
      </CardFooter>
    </Card>
  );
}