import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-abstract.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background image */}
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        
        {/* Decorative blobs */}
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-foreground/5 blob-shape animate-breathe" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="mb-8">
            <h1 className="text-4xl font-serif text-primary-foreground">Sage</h1>
          </Link>
          <h2 className="text-3xl xl:text-4xl font-serif text-primary-foreground/90 mb-6 leading-tight">
            Find your community.<br />
            Begin your healing journey.
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            AI-assisted matching connects you with the right support group and therapist for your unique needs.
          </p>
          
          <div className="mt-12 flex items-center gap-3 text-primary-foreground/60 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Your data is private and secure</span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="lg:hidden mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-serif text-primary">Sage</h1>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h2 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground mb-8">{subtitle}</p>
          
          {children}
        </div>
      </div>
    </div>
  );
}
