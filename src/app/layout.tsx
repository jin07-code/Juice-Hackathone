import type { Metadata } from "next";
import "@/styles/globals.css";
import { GNB } from "@/components/layout/GNB";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDbProvider } from "./MockDbProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Hackathon Platform",
  description: "Hackathon platform for teams, rankings, and submissions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <GNB />
          <PageContainer>
            <AuthProvider>
              <MockDbProvider>{children}</MockDbProvider>
            </AuthProvider>
          </PageContainer>
        </div>
      </body>
    </html>
  );
}

