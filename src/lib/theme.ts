import type { ThemeMode } from "@prisma/client";

export type ThemeSettings = {
  mode: ThemeMode;
  primary: string | null;
  secondary: string | null;
  guardrails: boolean;
};

export type ThemeInput = {
  themeMode?: unknown;
  themePrimary?: unknown;
  themeSecondary?: unknown;
  themeGuardrails?: unknown;
};

export const DEFAULT_PRIMARY = "#1d4ed8";
export const DEFAULT_SECONDARY = "#0f172a";

export const THEME_MODE_VALUES: ThemeMode[] = ["SYSTEM", "LIGHT", "DARK", "CUSTOM"];

type Rgb = { r: number; g: number; b: number };

function clamp01(value: number) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clamp255(value: number) {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return Math.round(value);
}

function normalizeHex(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const input = raw.trim();
  const short = /^#?[0-9a-fA-F]{3}$/.test(input);
  const full = /^#?[0-9a-fA-F]{6}$/.test(input);
  if (!short && !full) return null;
  const bare = input.replace(/^#/, "").toLowerCase();
  if (bare.length === 3) {
    return `#${bare
      .split("")
      .map((c) => `${c}${c}`)
      .join("")}`;
  }
  return `#${bare}`;
}

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(rgb: Rgb): string {
  const toHex = (v: number) => clamp255(v).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function mix(hexA: string, hexB: string, amount: number): string {
  const t = clamp01(amount);
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

function toLinear(channel: number): number {
  const c = channel / 255;
  if (c <= 0.03928) return c / 12.92;
  return ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = luminance(hexA);
  const l2 = luminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function targetTextColor(bg: string): string {
  const black = "#020617";
  const white = "#f8fafc";
  return contrastRatio(bg, white) >= contrastRatio(bg, black) ? white : black;
}

function enforceContrast(
  color: string,
  against: string,
  minRatio: number,
  preferDarkText: boolean,
): { color: string; text: string } {
  let candidate = color;
  let text = targetTextColor(candidate);
  if (contrastRatio(candidate, against) >= minRatio) {
    return { color: candidate, text };
  }

  for (let i = 1; i <= 24; i += 1) {
    const amt = i * 0.04;
    const adjusted = preferDarkText ? mix(candidate, "#ffffff", amt) : mix(candidate, "#000000", amt);
    if (contrastRatio(adjusted, against) >= minRatio) {
      candidate = adjusted;
      text = targetTextColor(candidate);
      return { color: candidate, text };
    }
  }

  // Last fallback if no satisfactory shade is found.
  candidate = preferDarkText ? "#dbeafe" : "#1d4ed8";
  text = targetTextColor(candidate);
  return { color: candidate, text };
}

function resolvePrimarySecondary(settings: ThemeSettings): { primary: string; secondary: string } {
  const primary = normalizeHex(settings.primary) ?? DEFAULT_PRIMARY;
  const secondary = normalizeHex(settings.secondary) ?? DEFAULT_SECONDARY;
  return { primary, secondary };
}

export function parseThemeInput(input: ThemeInput):
  | { ok: true; value: ThemeSettings }
  | { ok: false; error: string } {
  const modeRaw = typeof input.themeMode === "string" ? input.themeMode.toUpperCase() : "";
  const mode = THEME_MODE_VALUES.find((v) => v === modeRaw);
  if (!mode) {
    return { ok: false, error: "Invalid theme mode" };
  }

  const primaryRaw =
    typeof input.themePrimary === "string" ? input.themePrimary.trim() : input.themePrimary === null ? "" : "";
  const secondaryRaw =
    typeof input.themeSecondary === "string"
      ? input.themeSecondary.trim()
      : input.themeSecondary === null
        ? ""
        : "";

  const primary = primaryRaw.length ? normalizeHex(primaryRaw) : null;
  if (primaryRaw.length && !primary) {
    return { ok: false, error: "Primary color must be a valid hex color" };
  }

  const secondary = secondaryRaw.length ? normalizeHex(secondaryRaw) : null;
  if (secondaryRaw.length && !secondary) {
    return { ok: false, error: "Secondary color must be a valid hex color" };
  }

  const guardrails = input.themeGuardrails === false ? false : true;

  return {
    ok: true,
    value: {
      mode,
      primary,
      secondary,
      guardrails,
    },
  };
}

function buildLightPalette(settings: ThemeSettings) {
  const { primary, secondary } = resolvePrimarySecondary(settings);
  const baseBg = "#e9eef9";
  const basePanel = "#f8fbff";
  const basePanelMuted = "#dce6f5";
  const text = "#050f1f";
  const textStrong = "#000814";
  const muted = "#334155";
  const muted2 = "#475569";
  const border = mix(secondary, "#ffffff", 0.78);

  const accentSource = settings.mode === "CUSTOM" ? primary : DEFAULT_PRIMARY;
  const accentSecondarySource = settings.mode === "CUSTOM" ? secondary : DEFAULT_SECONDARY;

  if (!settings.guardrails) {
    return {
      bg: baseBg,
      panel: basePanel,
      panelMuted: basePanelMuted,
      text,
      textStrong,
      muted,
      muted2,
      border,
      accent: accentSource,
      accentText: targetTextColor(accentSource),
      secondary: accentSecondarySource,
      secondaryText: targetTextColor(accentSecondarySource),
      accentSoft: mix(accentSource, "#ffffff", 0.83),
      accentRing: mix(accentSource, "#ffffff", 0.35),
    };
  }

  const guardedPrimary = enforceContrast(accentSource, basePanel, 3.1, false);
  const guardedSecondary = enforceContrast(accentSecondarySource, basePanel, 3.1, false);

  return {
    bg: baseBg,
    panel: basePanel,
    panelMuted: basePanelMuted,
    text,
    textStrong,
    muted,
    muted2,
    border,
    accent: guardedPrimary.color,
    accentText: guardedPrimary.text,
    secondary: guardedSecondary.color,
    secondaryText: guardedSecondary.text,
    accentSoft: mix(guardedPrimary.color, "#ffffff", 0.83),
    accentRing: mix(guardedPrimary.color, "#ffffff", 0.35),
  };
}

function buildDarkPalette(settings: ThemeSettings) {
  const { primary, secondary } = resolvePrimarySecondary(settings);
  const baseBg = "#020611";
  const basePanel = "#081224";
  const basePanelMuted = "#10203a";
  const text = "#dbeafe";
  const textStrong = "#eff6ff";
  const muted = "#9fb2c9";
  const muted2 = "#89a0bb";
  const border = mix(secondary, "#000000", 0.55);

  const accentSource = settings.mode === "CUSTOM" ? primary : DEFAULT_PRIMARY;
  const accentSecondarySource = settings.mode === "CUSTOM" ? secondary : DEFAULT_SECONDARY;

  if (!settings.guardrails) {
    return {
      bg: baseBg,
      panel: basePanel,
      panelMuted: basePanelMuted,
      text,
      textStrong,
      muted,
      muted2,
      border,
      accent: accentSource,
      accentText: targetTextColor(accentSource),
      secondary: accentSecondarySource,
      secondaryText: targetTextColor(accentSecondarySource),
      accentSoft: mix(accentSource, "#000000", 0.72),
      accentRing: mix(accentSource, "#ffffff", 0.18),
    };
  }

  const guardedPrimary = enforceContrast(accentSource, basePanel, 3.1, true);
  const guardedSecondary = enforceContrast(accentSecondarySource, basePanel, 3.1, true);

  return {
    bg: baseBg,
    panel: basePanel,
    panelMuted: basePanelMuted,
    text,
    textStrong,
    muted,
    muted2,
    border,
    accent: guardedPrimary.color,
    accentText: guardedPrimary.text,
    secondary: guardedSecondary.color,
    secondaryText: guardedSecondary.text,
    accentSoft: mix(guardedPrimary.color, "#000000", 0.72),
    accentRing: mix(guardedPrimary.color, "#ffffff", 0.18),
  };
}

export function buildThemeCssVars(settings: ThemeSettings): Record<string, string> {
  const light = buildLightPalette(settings);
  const dark = buildDarkPalette(settings);

  return {
    "--light-bg": light.bg,
    "--light-panel": light.panel,
    "--light-panel-muted": light.panelMuted,
    "--light-text": light.text,
    "--light-text-strong": light.textStrong,
    "--light-muted": light.muted,
    "--light-muted-2": light.muted2,
    "--light-border": light.border,
    "--light-accent": light.accent,
    "--light-accent-text": light.accentText,
    "--light-secondary": light.secondary,
    "--light-secondary-text": light.secondaryText,
    "--light-accent-soft": light.accentSoft,
    "--light-accent-ring": light.accentRing,

    "--dark-bg": dark.bg,
    "--dark-panel": dark.panel,
    "--dark-panel-muted": dark.panelMuted,
    "--dark-text": dark.text,
    "--dark-text-strong": dark.textStrong,
    "--dark-muted": dark.muted,
    "--dark-muted-2": dark.muted2,
    "--dark-border": dark.border,
    "--dark-accent": dark.accent,
    "--dark-accent-text": dark.accentText,
    "--dark-secondary": dark.secondary,
    "--dark-secondary-text": dark.secondaryText,
    "--dark-accent-soft": dark.accentSoft,
    "--dark-accent-ring": dark.accentRing,
  };
}

export function toThemeSettings(value: {
  themeMode: ThemeMode;
  themePrimary: string | null;
  themeSecondary: string | null;
  themeGuardrails: boolean;
}): ThemeSettings {
  return {
    mode: value.themeMode,
    primary: normalizeHex(value.themePrimary),
    secondary: normalizeHex(value.themeSecondary),
    guardrails: value.themeGuardrails,
  };
}
