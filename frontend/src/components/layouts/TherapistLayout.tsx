import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Stethoscope, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { SmartReminders } from '@/components/therapist/SmartReminders';

interface TherapistLayoutProps {
  children: React.ReactNode;
}

export function TherapistLayout({ children }: TherapistLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-3">
            <h1 className="text-xl font-serif text-primary">Sage</h1>
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-clinical-accent/10 text-clinical-accent rounded-full text-xs font-medium">
              <Stethoscope className="w-3 h-3" />
              Therapist
            </span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Link to="/therapist/resources">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <BookOpen className="w-5 h-5" />
              </Button>
            </Link>
            <SmartReminders />
            <span className="hidden md:block text-sm text-muted-foreground border-l border-border pl-3 ml-1">
              Dr. {user?.name || 'Therapist'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-card p-4 animate-fade-in">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 mt-auto">
        <div className="container px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI-assisted insights — therapists retain full control
            </p>
            <p>HIPAA Compliant • Encrypted</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
