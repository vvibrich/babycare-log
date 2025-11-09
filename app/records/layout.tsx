import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
