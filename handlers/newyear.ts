/**
 * Calculate time until New Year and format message.
 */
export function getTimeUntilNewYear(messageTemplate: string): string {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
  const diff = nextYear.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return messageTemplate
    .replace('{days}', days.toString())
    .replace('{hours}', hours.toString())
    .replace('{minutes}', minutes.toString());
}

