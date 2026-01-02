interface ExtractedData {
  vendor: string | null;
  date: string | null;
  total: number | null;
  currency: string | null;
  invoiceNo: string | null;
  confidence: number;
}

export function regexExtract(text: string): ExtractedData {
  const t = text.replace(/\s+/g, " ").trim();

  // Extract date (dd.mm.yyyy, dd/mm/yyyy, dd-mm-yyyy)
  const dateMatch = t.match(/(\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{2,4})/);
  const date = dateMatch ? normalizeDate(dateMatch[1]) : null;

  // Extract total amount
  const totalMatch =
    t.match(/TOPLAM[^0-9]{0,15}([0-9][0-9\.\s]*[,\.][0-9]{2})/i) ||
    t.match(/TOTAL[^0-9]{0,15}([0-9][0-9\.\s]*[,\.][0-9]{2})/i) ||
    t.match(/([0-9][0-9\.\s]*[,\.][0-9]{2})\s*(TL|TRY|₺|EUR|USD|\$|€)/i);

  const total = totalMatch ? normalizeAmount(totalMatch[1]) : null;

  // Extract currency
  let currency: string | null = null;
  if (totalMatch && totalMatch[2]) {
    const curr = totalMatch[2].toUpperCase();
    if (curr === "TL" || curr === "₺") currency = "TRY";
    else if (curr === "€") currency = "EUR";
    else if (curr === "$") currency = "USD";
    else currency = curr;
  }

  // Extract vendor (first capitalized words)
  const vendor = guessVendor(t);

  // Extract invoice number
  const invoiceNoMatch = t.match(/(?:FISCODE|NO|NUMBER|#)[:\s]*([A-Z0-9\-]+)/i);
  const invoiceNo = invoiceNoMatch ? invoiceNoMatch[1] : null;

  // Calculate confidence
  let confidence = 0.2; // base confidence
  if (date) confidence += 0.3;
  if (total) confidence += 0.4;
  if (vendor) confidence += 0.2;
  if (invoiceNo) confidence += 0.1;

  return {
    vendor,
    date,
    total,
    currency,
    invoiceNo,
    confidence: Math.min(0.99, confidence)
  };
}

function normalizeDate(s: string): string | null {
  const parts = s.replace(/-/g, ".").replace(/\//g, ".").split(".");
  if (parts.length < 3) return null;

  let [d, m, y] = parts;

  // Handle 2-digit year
  if (y.length === 2) {
    const currentYear = new Date().getFullYear();
    const century = Math.floor(currentYear / 100) * 100;
    y = String(century + parseInt(y));
  }

  // Pad with zeros
  d = d.padStart(2, "0");
  m = m.padStart(2, "0");
  y = y.padStart(4, "0");

  // Validate
  const month = parseInt(m);
  const day = parseInt(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return `${y}-${m}-${d}`;
}

function normalizeAmount(s: string): number | null {
  const cleaned = s.replace(/\s/g, "");

  // Handle both comma and dot as decimal separator
  if (cleaned.includes(",") && cleaned.includes(".")) {
    // Assume European format: 1.234,56 -> 1234.56
    const n = cleaned.replace(/\./g, "").replace(",", ".");
    return parseFloat(n);
  }

  if (cleaned.includes(",")) {
    // Assume comma is decimal: 1234,56 -> 1234.56
    return parseFloat(cleaned.replace(",", "."));
  }

  return parseFloat(cleaned);
}

function guessVendor(t: string): string | null {
  // Extract first capitalized words (likely company name)
  const head = t.slice(0, 150);
  const match = head.match(/[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9&\-\s]{2,}/);
  return match ? match[0].trim().slice(0, 40) : null;
}
