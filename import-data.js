const XLSX = require('xlsx');
const path = require('path');
const tenderService = require('./services/tenderService');

/**
 * Parses "DD/MM/YYYY HH:mm" into a JS Date object.
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
  if (!match) return null;
  const [_, day, month, year, hours, minutes] = match;
  return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
}

async function importData() {
  try {
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(path.join(__dirname, 'ireps_tenders_full.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${rows.length} records...`);

    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      const promises = batch.map(row => {
        const tenderData = {
          department: row['Deptt./Rly. Unit'],
          tender_no: row['Tender No'],
          title: row['Tender Title'],
          status: row['Status'] || 'Published',
          work_area: row['Work Area'],
          due_at: parseDate(row['Due Date/Time']),
          due_days: row['Due Days'],
          pdf_link: row['PDF Link']
        };

        return tenderService.upsertTender(tenderData)
          .then(() => { successCount++; })
          .catch(err => {
            console.error(`Error upserting ${tenderData.tender_no}:`, err.message);
            errorCount++;
          });
      });

      await Promise.all(promises);
      const progress = Math.min(((i + batchSize) / rows.length) * 100, 100).toFixed(2);
      process.stdout.write(`\rProgress: ${progress}% (${successCount} successes, ${errorCount} errors)`);
    }

    console.log('\nImport complete!');
    console.log(`Final stats: ${successCount} imported/updated, ${errorCount} failed.`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal import error:', err);
    process.exit(1);
  }
}

importData();
