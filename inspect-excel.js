const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, 'ireps_tenders_full.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Get first 2 rows to see headers and sample data
const data = XLSX.utils.sheet_to_json(worksheet, { range: 0, header: 1 }).slice(0, 2);
console.log('Headers:', JSON.stringify(data[0]));
console.log('Sample Data:', JSON.stringify(data[1]));
