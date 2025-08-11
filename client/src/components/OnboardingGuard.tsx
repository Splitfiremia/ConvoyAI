import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    const isOnOnboardingPage = location === '/onboarding';

    // If user hasn't completed onboarding and isn't on onboarding page, redirect
    if (!onboardingComplete && !isOnOnboardingPage && (location === '/dashboard' || location.startsWith('/dashboard'))) {
      navigate('/onboarding');
    }

    // If user has completed onboarding but is on onboarding page, redirect to dashboard
    if (onboardingComplete && isOnOnboardingPage) {
      navigate('/dashboard');
    }
  }, [location, navigate]);

  return <>{children}</>;
}