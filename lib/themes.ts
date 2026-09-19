import shortlist from "./cms-themes-shortlist.json";

export const CMS_THEME_KEY = "dfw-cms-theme";

export const ADMIN_THEME_ID = "admin-cms";

export type ThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  cta: string;
  ctaHover: string;
  success: string;
  warning: string;
};

export type Theme = {
  id: string;
  name: string;
  vibe: string;
  when: string;
  tokens: ThemeTokens;
};

type Shortlist = {
  defaultThemeId: string;
  fallbackThemeId: string;
  platformOnlyThemeIds: string[];
  themes: Theme[];
};

const data = shortlist as Shortlist;

export const THEMES: Theme[] = data.themes;

export const DEFAULT_THEME_ID =
  data.defaultThemeId ?? "slate-amber";

export const FALLBACK_THEME_ID =
  data.fallbackThemeId ?? "navy-amber";

export const FALLBACK = FALLBACK_THEME_ID;

export const PLATFORM_ONLY_THEME_IDS: string[] =
  data.platformOnlyThemeIds ?? ["saas-indigo"];

export const PLATFORM_ONLY = PLATFORM_ONLY_THEME_IDS;

const themeById = new Map(THEMES.map((theme) => [theme.id, theme]));

export function getTheme(id: string): Theme | undefined {
  return themeById.get(id);
}

export function isPlatformOnly(id: string): boolean {
  return PLATFORM_ONLY_THEME_IDS.includes(id);
}

export function resolveThemeId(id: string | null | undefined): string {
  if (id && themeById.has(id)) return id;
  if (themeById.has(FALLBACK_THEME_ID)) return FALLBACK_THEME_ID;
  return DEFAULT_THEME_ID;
}

export function readThemeId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CMS_THEME_KEY);
  } catch {
    return null;
  }
}

export function isAdminPath(pathname?: string): boolean {
  const path =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "");
  return path === "/admin" || path.startsWith("/admin/");
}

export function writeThemeId(id: string): void {
  if (typeof window === "undefined") return;
  const resolved = resolveThemeId(id);
  try {
    window.localStorage.setItem(CMS_THEME_KEY, resolved);
  } catch {
    // ignore quota / private mode
  }
  // Public ThemeProvider applies on public pages only — never restyle /admin here.
  window.dispatchEvent(new CustomEvent(CMS_THEME_KEY));
}

export function applyThemeToDocument(id: string): void {
  if (typeof document === "undefined") return;
  if (id === ADMIN_THEME_ID) {
    document.documentElement.dataset.theme = ADMIN_THEME_ID;
    return;
  }
  document.documentElement.dataset.theme = resolveThemeId(id);
}

export function resolvePreferredThemeId(
  stored: string | null | undefined,
  tenantDefault?: string | null,
): string {
  if (stored && themeById.has(stored)) return stored;
  if (tenantDefault && themeById.has(tenantDefault)) return tenantDefault;
  return resolveThemeId(DEFAULT_THEME_ID);
}
