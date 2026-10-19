import type { Metadata } from 'next';
import { Toaster } from '@/components/admin/Toaster';

export const metadata: Metadata = {
  title: { default: 'Beheer', template: '%s | Beheer' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<'/admin'>) {
  return <Toaster>{children}</Toaster>;
}
