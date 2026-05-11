// اسم الكوكي المستخدم لتذكر المستخدم النشط الحالي عبر الجلسات
export const ACTIVE_USER_COOKIE = "active_user_id";

// تحليل معرّف المستخدم النشط: يتحقق أن القيمة عدد صحيح موجب، وإلا يُرجع null
export function parseActiveUserId(value?: string | null) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

// جلب معرّف المستخدم النشط من الكوكي أولاً، وإن لم يُوجد يُحاول من التخزين المحلي (localStorage)
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

// حفظ معرّف المستخدم النشط في كوكي (لمدة 30 يوماً) وفي التخزين المحلي لضمان استمراريته
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
