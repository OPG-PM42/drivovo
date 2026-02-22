import type { Metadata } from "next";

import "./globals.css";
import { StateProvider } from '@/ui/providers/state';

export const metadata: Metadata = {
  title: "Drivovo",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en">
      <body><StateProvider>{children}</StateProvider></body>
    </html>
  );
}
