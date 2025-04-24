'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

/**
 * ClientOnly component to handle hydration mismatches
 * 
 * This component only renders its children on the client side after hydration
 * is complete, preventing hydration errors from server/client mismatches
 * in things like dates, random values, etc.
 */
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent rendering on the server
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
} 