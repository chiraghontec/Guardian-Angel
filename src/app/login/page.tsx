
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons/app-logo';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage() {
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="parent@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full" disabled>
            Login with Google (Placeholder)
          </Button>
        </CardContent>
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
