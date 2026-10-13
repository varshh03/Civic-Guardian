export { formatDate, formatNumber, formatRelativeTime } from './utils';

export function formatSlaCountdown(createdAt: string, slaHours: number): { text: string; isOverdue: boolean } {
  const deadline = new Date(new Date(createdAt).getTime() + slaHours * 3600 * 1000);
  const remaining = deadline.getTime() - Date.now();
  if (remaining <= 0) {
    const overdueHours = Math.abs(Math.floor(remaining / 3600000));
    return { text: `${overdueHours}h overdue`, isOverdue: true };
  }
  const hours = Math.floor(remaining / 3600000);
  return { text: `${hours}h left`, isOverdue: false };
}
