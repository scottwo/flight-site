const RESERVED = new Set(["api", "dashboard", "admin", "p", "sign-in", "sign-up"]);

export function normalizeHandle(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const cleaned = trimmed.replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned;
}

export function validateHandle(handle: string): { ok: boolean; error?: string } {
  if (!handle) return { ok: false, error: "Handle is required" };
  if (RESERVED.has(handle)) return { ok: false, error: "Handle is reserved" };
  if (!/^[a-z0-9][a-z0-9-]*$/.test(handle)) {
    return { ok: false, error: "Only letters, numbers, and hyphens; must start with a letter/number" };
  }
  if (handle.length < 3 || handle.length > 24) {
    return { ok: false, error: "Handle must be 3-24 characters" };
  }
  if (handle.includes("--")) {
    return { ok: false, error: "Handle cannot contain consecutive hyphens" };
  }
  return { ok: true };
}
