/**
 * Convert bytes into a human-readable string using KB / MB / GB.
 * - Uses 1024 as the unit base.
 * - Returns e.g. "512 B", "1.2 KB", "3 MB", "4.5 GB".
 * - For invalid input (NaN / non-number) returns an empty string.
 */
export function formatSize(bytes: number): string {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '';
  if (bytes === 0) return '0 B';

  const negative = bytes < 0;
  let value = Math.abs(bytes);

  // include 'B' in units so the indexing matches the number of divisions
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;

  // convert up until value < 1024 or we run out of units
  while (value >= 1024 && unitIndex < units.length - 1) {
    value = value / 1024;
    unitIndex += 1;
  }

  // For bytes (unitIndex === 0) show integer; otherwise one decimal when needed
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  const display = unitIndex === 0 ? rounded.toString() : (Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1));

  return `${negative ? '-' : ''}${display} ${units[unitIndex]}`;
}
export const generateUUID=()=>crypto.randomUUID();
export default formatSize;
