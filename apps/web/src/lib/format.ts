/** Small presentation formatters shared across skins. */

/** Chinese relative-date formatter for comment timestamps. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return iso;
  }
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) {
    return '刚刚';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} 天前`;
  }
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRoleLabel(role?: string | null): string {
  if (role === 'admin') {
    return 'ADMIN';
  }
  if (role === 'vip') {
    return 'VIP';
  }
  return 'MEMBER';
}

/** Map the unlock route's ?error= search param to a Chinese message. */
export function unlockErrorLabel(
  search?: Record<string, string | undefined>,
): string | undefined {
  const error = (search ?? {}).error;
  if (error === 'missing') {
    return '请输入访问密码';
  }
  if (error === 'invalid') {
    return '密码错误，请重试';
  }
  return undefined;
}
