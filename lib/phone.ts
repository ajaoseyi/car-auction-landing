// Phone numbers as people type them: "0803 123 4567", "+234 803 123 4567", "(0803)-123-4567".

/** Keeps a leading "+" and the digits. */
export const normalizePhone = (raw: string) => {
  const t = raw.trim();
  return (t.startsWith("+") ? "+" : "") + t.replace(/\D/g, "");
};

/** 10 to 15 digits, with or without a country code. */
export const isValidPhone = (raw: string) => /^\+?\d{10,15}$/.test(normalizePhone(raw));
