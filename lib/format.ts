// Display helpers, matching car-auction-app's utils/formatters.ts.

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n: number) => String(n).padStart(2, "0");

/** 48500000 -> "₦48,500,000". */
export const formatNaira = (amount: number) => "₦" + String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** 14 -> "2pm". */
export const formatHour = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

/** "Thu 5 Nov · 10am" (or "10:30am"), in the browser's time zone. */
export function formatPickup(iso: string) {
  const d = new Date(iso);
  const hour = formatHour(d.getHours());
  const time = d.getMinutes() ? hour.replace(/(am|pm)$/, `:${pad2(d.getMinutes())}$1`) : hour;
  return `${SHORT_DAYS[d.getDay()]} ${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} · ${time}`;
}
