const xlsx = require('xlsx');

/**
 * Mapping keyword → field
 */
const COLUMN_KEYWORD_MAP = [
    { field: 'transaction_date', keywords: ['ngày giao dịch', 'transaction date'] },
    { field: 'remitter',         keywords: ['đối tác', 'remitter'] },
    { field: 'remitter_bank',    keywords: ['nh đối tác', 'remitter bank'] },
    { field: 'details',          keywords: ['diễn giải', 'details'] },
    { field: 'transaction_no',   keywords: ['số bút toán', 'transaction no'] },
    { field: 'debit',            keywords: ['nợ tktt', 'debit'] },
    { field: 'credit',           keywords: ['có tktt', 'credit'] },
    { field: 'balance',          keywords: ['số dư', 'balance'] },
];

/**
 * Normalize text
 */
const normalize = (str) =>
    String(str || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Tìm header row
 */
const findHeaderRow = (rows) => {
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];

        const cellMap = {};
        row.forEach((cell, colIdx) => {
            if (cell !== null && cell !== undefined && String(cell).trim() !== '') {
                cellMap[colIdx] = normalize(cell);
            }
        });

        const colMap = {};

        for (const { field, keywords } of COLUMN_KEYWORD_MAP) {
            for (const [colIdx, text] of Object.entries(cellMap)) {
                if (keywords.some(kw => text.includes(normalize(kw)))) {
                    colMap[field] = Number(colIdx);
                    break;
                }
            }
        }

        if (Object.keys(colMap).length >= 5) {
            return { rowIndex: rowIdx, colMap };
        }
    }

    return null;
};

/**
 * Parse tiền
 */
const parseAmount = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const num = Number(String(val).replace(/,/g, '').trim());
    return isNaN(num) ? 0 : num;
};

/**
 * Parse date → Date object
 */
const parseDateValue = (val) => {
    if (!val) return null;

    const str = String(val).trim();

    // dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [day, month, year] = str.split('/');
        return new Date(year, month - 1, day); // ⚠️ month - 1
    }

    // Excel serial number
    const num = Number(str);
    if (!isNaN(num) && num > 40000 && num < 60000) {
        const date = xlsx.SSF.parse_date_code(num);
        if (date) {
            return new Date(date.y, date.m - 1, date.d);
        }
    }

    return null;
};

/**
 * Validate row có phải data thật
 */
const isDataRow = (row, colMap) => {
    const val = row[colMap['transaction_date']];
    if (!val) return false;

    const str = normalize(val);

    // bỏ dòng tổng kết
    if (str.includes('số dư') || str.includes('opening') || str.includes('closing')) {
        return false;
    }

    // dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return true;

    // excel serial
    const num = Number(str);
    return !isNaN(num) && num > 40000 && num < 60000;
};

/**
 * Clean text
 */
const cleanText = (val) =>
    String(val ?? '')
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Main parse function
 */
const parseExcelBuffer = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: false });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: true,
    });

    // 1. Find header
    const headerResult = findHeaderRow(rawRows);

    if (!headerResult) {
        throw new Error('Không tìm thấy header trong file Excel');
    }

    const { rowIndex, colMap } = headerResult;

    const payments = [];

    // 2. Loop data rows
    for (let i = rowIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i];

        if (!isDataRow(row, colMap)) continue;

        const transactionDate = parseDateValue(row[colMap['transaction_date']]);

        if (!transactionDate) continue;

        const payment = {
            transaction_date: transactionDate,
            remitter:         cleanText(row[colMap['remitter']]),
            remitter_bank:    cleanText(row[colMap['remitter_bank']]),
            details:          cleanText(row[colMap['details']]),
            transaction_no:   cleanText(row[colMap['transaction_no']]),
            debit:            parseAmount(row[colMap['debit']]),
            credit:           parseAmount(row[colMap['credit']]),
            balance:          parseAmount(row[colMap['balance']]),
        };

        payments.push(payment);
    }

    return payments;
};

module.exports = {
    parseExcelBuffer
};