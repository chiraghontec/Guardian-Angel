
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons/app-logo';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormInputs = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { login, loading: authLoading, error: authError, setError: setAuthError, currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);
  
  useEffect(() => {
    if (authError) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: authError,
      });
      setAuthError(null); // Clear error after showing toast
    }
  }, [authError, toast, setAuthError]);

  async function onSubmit(data: LoginFormInputs) {
    await login(data);
  }
  
  if (currentUser) { // Prevents flash of login page if user is already logged in and redirecting
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AppLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">{APP_NAME}</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="parent@example.com" {...field} disabled={authLoading} />
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
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} disabled={authLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Login with Google (Placeholder)
              </Button>
            </CardContent>
          </form>
        </Form>
        <CardFooter className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline text-primary hover:text-primary/80">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
