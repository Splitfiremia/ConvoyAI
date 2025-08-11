import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const ConvoyLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="flex-shrink-0">
    <rect width="40" height="40" rx="8" fill="#3B82F6" />
    <circle cx="12" cy="12" r="3" fill="white" />
    <circle cx="28" cy="12" r="3" fill="white" />
    <circle cx="20" cy="20" r="4" fill="white" />
    <circle cx="12" cy="28" r="3" fill="white" />
    <circle cx="28" cy="28" r="3" fill="white" />
    <line x1="15" y1="14" x2="17" y2="18" stroke="white" strokeWidth="1.5" />
    <line x1="25" y1="14" x2="23" y2="18" stroke="white" strokeWidth="1.5" />
    <line x1="17" y1="22" x2="15" y2="26" stroke="white" strokeWidth="1.5" />
    <line x1="23" y1="22" x2="25" y2="26" stroke="white" strokeWidth="1.5" />
  </svg>
);

export default function Navbar() {
  const [location] = useLocation();
  const isSignupPage = location === '/signup';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3">
            <ConvoyLogo size={32} />
            <span className="text-2xl font-bold text-gray-900">Convoy AI</span>
          </Link>
          
          {!isSignupPage && (
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </a>
              <Link href="/login" className="text-gray-900 hover:text-blue-600 font-semibold transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50 flex items-center space-x-1">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {isSignupPage ? (
              <Link href="/">
                <Button variant="ghost" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            ) : (
              <Button asChild>
                <Link href="/signup">
                  Start Free Trial
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}