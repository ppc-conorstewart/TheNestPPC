// ==============================
// Utility helpers for retrieving the authenticated Discord user
// stored in localStorage (set after OAuth callback).
// ==============================

const STORAGE_KEY = 'flyiq_user';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export function getStoredDiscordUser() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage?.getItem(STORAGE_KEY);
  if (!raw) return null;
  return safeParse(raw);
}

export function getStoredDiscordName(defaultName = 'Current User') {
  const user = getStoredDiscordUser();
  if (!user) return defaultName;
  return (
    user.global_name ||
    user.username ||
    user.display_name ||
    (user.user && (user.user.global_name || user.user.username)) ||
    user.tag ||
    user.id ||
    defaultName
  );
}

export function getStoredDiscordId() {
  const user = getStoredDiscordUser();
  return user?.id || null;
}

export function getStoredDiscordAvatar() {
  const user = getStoredDiscordUser();
  if (!user) return null;
  if (user.avatar && user.id) {
    const ext = String(user.avatar).startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=64`;
  }
  if (user.user && user.user.avatar && user.user.id) {
    const ext = String(user.user.avatar).startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.user.id}/${user.user.avatar}.${ext}?size=64`;
  }
  const discriminator = user.discriminator || user.user?.discriminator || '0';
  const idx = Number.isFinite(Number(discriminator)) ? Number(discriminator) % 5 : 0;
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

export function getAuthHeaders() {
  const user = getStoredDiscordUser();
  if (!user) return {};
  return { 'x-user-id': user.id, 'x-user-name': getStoredDiscordName(user.id) };
}
