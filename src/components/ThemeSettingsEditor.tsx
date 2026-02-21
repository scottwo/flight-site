"use client";

import { useMemo, useState } from "react";

import ThemeScope from "@/components/ThemeScope";
import type { ThemeMode } from "@prisma/client";
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY, type ThemeSettings } from "@/lib/theme";

type Props = {
  initialMode: ThemeMode;
  initialPrimary: string | null;
  initialSecondary: string | null;
  initialGuardrails: boolean;
};

const modeOptions: { value: ThemeMode; label: string; helper: string }[] = [
  { value: "SYSTEM", label: "System", helper: "Use default theme and follow viewer device mode." },
  { value: "LIGHT", label: "Light", helper: "Use default theme and force light mode." },
  { value: "DARK", label: "Dark", helper: "Use default theme and force dark mode." },
  { value: "CUSTOM", label: "Custom", helper: "Use your primary/secondary colors and follow device mode." },
];

function normalizeHexInput(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function isValidHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) || /^#[0-9a-fA-F]{3}$/.test(value);
}

function toSixDigitHex(value: string, fallback: string) {
  const normalized = normalizeHexInput(value);
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const short = normalized.slice(1);
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toLowerCase();
  }
  return fallback;
}

export default function ThemeSettingsEditor({
  initialMode,
  initialPrimary,
  initialSecondary,
  initialGuardrails,
}: Props) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [primary, setPrimary] = useState<string>(initialPrimary ?? DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState<string>(initialSecondary ?? DEFAULT_SECONDARY);
  const [guardrails, setGuardrails] = useState<boolean>(initialGuardrails);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  const primaryNormalized = normalizeHexInput(primary);
  const secondaryNormalized = normalizeHexInput(secondary);
  const primaryValid = isValidHex(primaryNormalized);
  const secondaryValid = isValidHex(secondaryNormalized);
  const primaryPickerValue = toSixDigitHex(primary, DEFAULT_PRIMARY);
  const secondaryPickerValue = toSixDigitHex(secondary, DEFAULT_SECONDARY);

  const previewSettings = useMemo<ThemeSettings>(
    () => ({
      mode,
      primary: primaryValid ? primaryNormalized : null,
      secondary: secondaryValid ? secondaryNormalized : null,
      guardrails,
    }),
    [mode, primaryNormalized, secondaryNormalized, primaryValid, secondaryValid, guardrails],
  );

  const onSave = async () => {
    if (!primaryValid || !secondaryValid) {
      setMessage("Use valid hex colors like #1d4ed8 and #0f172a.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/private/profile/theme", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          themeMode: mode,
          themePrimary: primaryNormalized,
          themeSecondary: secondaryNormalized,
          themeGuardrails: guardrails,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setMessage(data?.error || "Unable to save theme settings.");
      } else {
        setMessage("Theme saved. Refresh to ensure all server-rendered sections reflect changes.");
      }
    } catch {
      setMessage("Unable to save theme settings.");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setMode("SYSTEM");
    setPrimary(DEFAULT_PRIMARY);
    setSecondary(DEFAULT_SECONDARY);
    setGuardrails(true);
    setMessage("");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Primary color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryPickerValue}
              onChange={(e) => setPrimary(e.target.value)}
              aria-label="Choose primary color"
              className="h-10 w-12 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--panel)] p-1"
            />
            <input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              placeholder="#1d4ed8"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            />
          </div>
          {!primaryValid && <span className="text-xs text-red-500">Enter a valid hex color.</span>}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Secondary color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={secondaryPickerValue}
              onChange={(e) => setSecondary(e.target.value)}
              aria-label="Choose secondary color"
              className="h-10 w-12 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--panel)] p-1"
            />
            <input
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              placeholder="#0f172a"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            />
          </div>
          {!secondaryValid && <span className="text-xs text-red-500">Enter a valid hex color.</span>}
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--text)]">Mode</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                mode === opt.value
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--panel-muted)]"
              }`}
            >
              <p className="text-sm font-semibold text-[var(--text)]">{opt.label}</p>
              <p className="text-xs text-[var(--muted)]">{opt.helper}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--text)]">
        <input
          type="checkbox"
          checked={guardrails}
          onChange={(e) => setGuardrails(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        Enable contrast guardrails (recommended)
      </label>

      <ThemeScope settings={previewSettings} className="rounded-2xl border border-[var(--border)] p-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">Theme preview</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">Panel card</p>
              <p className="text-sm text-[var(--muted)]">Main content surface with text colors.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">Muted panel</p>
              <p className="text-sm text-[var(--muted)]">Secondary surface and supportive content.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent-text)]">
              Primary action
            </span>
            <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-semibold text-[var(--secondary-text)]">
              Secondary accent
            </span>
          </div>
        </div>
      </ThemeScope>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition hover:brightness-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save theme"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
        >
          Reset defaults
        </button>
        {message && <span className="text-xs text-[var(--muted)]">{message}</span>}
      </div>
    </div>
  );
}
