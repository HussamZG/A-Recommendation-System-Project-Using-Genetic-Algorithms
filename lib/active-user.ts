export const ACTIVE_USER_COOKIE = "active_user_id";

export function parseActiveUserId(value?: string | null) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export function getActiveUserIdFromDocument() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ACTIVE_USER_COOKIE}=`));

  if (cookieEntry) {
    const cookieValue = decodeURIComponent(cookieEntry.split("=")[1] ?? "");
    const parsedFromCookie = parseActiveUserId(cookieValue);
    if (parsedFromCookie) {
      return parsedFromCookie;
    }
  }

  try {
    return parseActiveUserId(localStorage.getItem(ACTIVE_USER_COOKIE));
  } catch {
    return null;
  }
}

export function rememberActiveUser(userId: number) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACTIVE_USER_COOKIE}=${userId}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;

  try {
    localStorage.setItem(ACTIVE_USER_COOKIE, String(userId));
  } catch {
    // Ignore storage failures in private browsing modes.
  }
}
