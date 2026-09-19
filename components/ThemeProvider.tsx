"use client";

import { useEffect, type ReactNode } from "react";
import {
  ADMIN_THEME_ID,
  CMS_THEME_KEY,
  applyThemeToDocument,
  isAdminPath,
  readThemeId,
  resolvePreferredThemeId,
} from "@/lib/themes";

export function ThemeProvider({
  children,
  defaultThemeId,
}: {
  children: ReactNode;
  defaultThemeId?: string;
}) {
  useEffect(() => {
    const sync = () => {
      if (isAdminPath()) {
        applyThemeToDocument(ADMIN_THEME_ID);
        return;
      }
      const preferred = resolvePreferredThemeId(readThemeId(), defaultThemeId);
      applyThemeToDocument(preferred);
    };

    sync();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CMS_THEME_KEY) sync();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CMS_THEME_KEY, sync as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CMS_THEME_KEY, sync as EventListener);
    };
  }, [defaultThemeId]);

  return <>{children}</>;
}
