import { ClientLayout } from "@/components/layout/client-layout";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
