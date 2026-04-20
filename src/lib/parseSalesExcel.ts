import * as XLSX from 'xlsx';

export interface ParsedInvoice {
  invoice_no: string;
  invoice_date: string; // YYYY-MM-DD
  party_name: string;
  transaction_type: string | null;
  payment_type: string | null;
  total_amount: number;
  received_amount: number;
  balance_due: number;
  is_cancelled: boolean;
}

export interface ParsedItem {
  invoice_no: string;
  invoice_date: string;
  party_name: string;
  item_name: string;
  hsn_sac: string | null;
  category: string | null;
  description: string | null;
  quantity: number;
  unit: string | null;
  unit_price: number;
  discount_percent: number;
  discount: number;
  tax_percent: number;
  tax: number;
  amount: number;
}

export interface ParsedSales {
  invoices: ParsedInvoice[];
  items: ParsedItem[];
}

function parseDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value).trim();
  // dd/mm/yyyy
  const m = str.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = '20' + y;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // try Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function num(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function findHeaderRow(rows: unknown[][], expectedKey: string): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i] || [];
    if (r.some((c) => String(c ?? '').toLowerCase().trim() === expectedKey.toLowerCase())) {
      return i;
    }
  }
  return -1;
}

function findSheet(wb: XLSX.WorkBook, includes: string): string | null {
  const lc = includes.toLowerCase();
  return wb.SheetNames.find((n) => n.toLowerCase().includes(lc)) || null;
}

export async function parseSalesWorkbook(file: File): Promise<ParsedSales> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });

  const invoiceSheetName = findSheet(wb, 'sale report') || findSheet(wb, 'sales') || wb.SheetNames[0];
  const itemSheetName = findSheet(wb, 'item');

  const invoices: ParsedInvoice[] = [];
  const items: ParsedItem[] = [];

  if (invoiceSheetName) {
    const sheet = wb.Sheets[invoiceSheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null });
    const headerIdx = findHeaderRow(rows, 'invoice no');
    if (headerIdx >= 0) {
      const header = (rows[headerIdx] as unknown[]).map((h) => String(h ?? '').toLowerCase().trim());
      const col = (key: string) => header.findIndex((h) => h.includes(key));
      const cDate = col('date');
      const cInv = col('invoice');
      const cParty = col('party');
      const cType = col('transaction');
      const cTotal = col('total amount');
      const cPay = col('payment type');
      const cRecv = header.findIndex((h) => h.includes('received') || h.includes('paid amount'));
      const cBal = col('balance');

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] as unknown[];
        if (!r || r.every((c) => c === null || c === undefined || c === '')) continue;
        const invNo = str(r[cInv]);
        const date = parseDate(r[cDate]);
        const party = str(r[cParty]);
        if (!invNo || !date || !party) continue;
        const txType = str(r[cType]) || '';
        invoices.push({
          invoice_no: invNo,
          invoice_date: date,
          party_name: party,
          transaction_type: txType || null,
          payment_type: str(r[cPay]),
          total_amount: num(r[cTotal]),
          received_amount: num(r[cRecv]),
          balance_due: num(r[cBal]),
          is_cancelled: txType.toLowerCase().includes('cancel'),
        });
      }
    }
  }

  if (itemSheetName) {
    const sheet = wb.Sheets[itemSheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null });
    const headerIdx = findHeaderRow(rows, 'item name');
    if (headerIdx >= 0) {
      const header = (rows[headerIdx] as unknown[]).map((h) => String(h ?? '').toLowerCase().trim());
      const col = (key: string) => header.findIndex((h) => h.includes(key));
      const cDate = col('date');
      const cInv = header.findIndex((h) => h.includes('invoice'));
      const cParty = col('party');
      const cItem = col('item name');
      const cHsn = col('hsn');
      const cCat = col('category');
      const cDesc = col('description');
      const cQty = col('quantity');
      const cUnit = header.findIndex((h) => h === 'unit');
      const cPrice = col('unitprice');
      const cDiscPct = col('discount percent');
      const cDisc = header.findIndex((h) => h === 'discount');
      const cTaxPct = col('tax percent');
      const cTax = header.findIndex((h) => h === 'tax');
      const cAmt = col('amount');

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] as unknown[];
        if (!r || r.every((c) => c === null || c === undefined || c === '')) continue;
        const invNo = str(r[cInv]);
        const date = parseDate(r[cDate]);
        const itemName = str(r[cItem]);
        if (!invNo || !date || !itemName) continue;
        items.push({
          invoice_no: invNo,
          invoice_date: date,
          party_name: str(r[cParty]) || '',
          item_name: itemName,
          hsn_sac: str(r[cHsn]),
          category: str(r[cCat]),
          description: str(r[cDesc]),
          quantity: num(r[cQty]),
          unit: str(r[cUnit]),
          unit_price: num(r[cPrice]),
          discount_percent: num(r[cDiscPct]),
          discount: num(r[cDisc]),
          tax_percent: num(r[cTaxPct]),
          tax: num(r[cTax]),
          amount: num(r[cAmt]),
        });
      }
    }
  }

  return { invoices, items };
}
