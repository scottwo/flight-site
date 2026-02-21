import type { CSSProperties, ReactNode } from "react";
import type { ThemeMode } from "@prisma/client";

import { buildThemeCssVars, type ThemeSettings } from "@/lib/theme";

type Props = {
  settings?: ThemeSettings;
  mode?: ThemeMode;
  className?: string;
  children: ReactNode;
};

const defaultSettings: ThemeSettings = {
  mode: "SYSTEM",
  primary: null,
  secondary: null,
  guardrails: true,
};

export default function ThemeScope({ settings, mode, className, children }: Props) {
  const resolved = settings ?? defaultSettings;
  const vars = buildThemeCssVars(resolved);
  const scopeMode = (mode ?? resolved.mode).toLowerCase();

  return (
    <div
      data-theme-scope="true"
      data-theme-mode={scopeMode}
      className={className}
      style={vars as CSSProperties}
    >
      {children}
    </div>
  );
}
