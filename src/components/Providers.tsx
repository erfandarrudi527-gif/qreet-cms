"use client";

import { SessionProvider } from "next-auth/react";
import { BASE_PATH } from "@/lib/utils";
import LinearSplashLoader from "@/components/LinearSplashLoader";
import UniversalZipInspector from "@/components/UniversalZipInspector";

export default function Providers({ children }: { children: React.ReactNode }) {
  // the CMS runs under basePath (/cms), so client-side auth calls must target
  // <basePath>/api/auth instead of /api/auth
  return (
    <SessionProvider basePath={`${BASE_PATH}/api/auth`}>
      <LinearSplashLoader />
      {children}
    </SessionProvider>
  );
}
