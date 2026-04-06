'use client';
import { AudioProvider } from './AudioProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}
