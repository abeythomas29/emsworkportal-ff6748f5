import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import emsLogo from '@/assets/ems-logo.png';
import { Loader2, Eye, EyeOff, Users, Clock, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const demoAccounts = [
  { email: 'admin@ems.com', role: 'Admin / HR', color: 'bg-primary' },
  { email: 'manager@ems.com', role: 'Manager', color: 'bg-accent' },
  { email: 'online@ems.com', role: 'Employee (Online)', color: 'bg-secondary' },
  { email: 'offline@ems.com', role: 'Employee (Offline)', color: 'bg-muted' },
];

const features = [
  { icon: <Clock className="w-5 h-5" />, text: 'Track work hours & attendance' },
  { icon: <Calendar className="w-5 h-5" />, text: 'Manage leave requests' },
  { icon: <Users className="w-5 h-5" />, text: 'Team oversight & reports' },
  { icon: <CheckCircle className="w-5 h-5" />, text: 'Automated leave balances' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Welcome back!', {
          description: 'You have successfully logged in.',
        });
        navigate('/dashboard');
      } else {
        toast.error('Login failed', {
          description: 'Please check your credentials and try again.',
        });
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setIsLoading(true);
    
    try {
      const success = await login(demoEmail, 'demo123');
      if (success) {
        toast.success('Welcome!', {
          description: 'Logged in with demo account.',
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <img src={emsLogo} alt="EMS" className="h-16 w-auto mb-8 brightness-0 invert" />
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
            Employee Management
            <span className="text-primary block mt-2">Simplified</span>
          </h1>
          
          <p className="text-white/70 text-lg mb-10 max-w-md">
            Streamline attendance tracking, leave management, and work hour logging all in one powerful platform.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-white/80 animate-slide-right"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  {feature.icon}
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-10 w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={emsLogo} alt="EMS" className="h-12" />
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Quick Demo Access
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleDemoLogin(account.email)}
                      disabled={isLoading}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className={`w-8 h-8 rounded-full ${account.color} flex items-center justify-center text-white text-xs font-medium`}>
                        {account.role.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {account.role}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {account.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a href="#" className="text-primary hover:underline">
              support@ems.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
