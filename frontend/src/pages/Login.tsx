import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginLocationState {
  email?: string;
}

export default function Login() {
  const location = useLocation();
  const stateEmail = (location.state as LoginLocationState)?.email ?? '';
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [emailReadOnly, setEmailReadOnly] = useState(!stateEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailFocus = () => {
    if (emailReadOnly) {
      setEmailReadOnly(false);
    }
  };
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim() ?? '';
    const password = passwordRef.current?.value ?? '';
    if (!email || !password) return;
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back',
        description: 'You have been logged in successfully.',
      });
      const target = isTherapist ? '/therapist' : '/dashboard';
      window.location.href = target;
      return;
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your journey"
    >
      <form
        name="login"
        method="post"
        action="/login"
        onSubmit={handleSubmit}
        className="space-y-6"
        autoComplete="on"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={stateEmail}
            required
            autoComplete="username"
            readOnly={emailReadOnly}
            onFocus={handleEmailFocus}
            className="h-12"
            aria-label="Email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-12 pr-12"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="therapist"
            checked={isTherapist}
            onCheckedChange={(checked) => setIsTherapist(checked === true)}
          />
          <Label
            htmlFor="therapist"
            className="text-sm font-normal cursor-pointer"
          >
            I'm a therapist
          </Label>
        </div>

        <p className="text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
