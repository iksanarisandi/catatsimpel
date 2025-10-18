/*
  SimpelCatat - Apps Script Web App
  Storage: Existing Google Sheet (tab default: "Transaksi")
  Columns: [id, createdAtISO, tanggalISO, tipe, nominal, keterangan]
  Tipe: MASUK | KELUAR
  Timezone: Asia/Makassar by default
*/

const CFG = {
  PROP_SPREADSHEET_ID: 'SIMPelCATAT_SPREADSHEET_ID',
  DEFAULT_SHEET_NAME: 'Transaksi',
  PAGE_SIZE: 50,
  SUMMARY_CACHE_KEY: 'SIMPelCATAT_SUMMARY',
  SUMMARY_CACHE_TTL: 60, // seconds
  TZ: 'Asia/Makassar'
};

function doGet() {
  setup();
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('SimpelCatat')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  return html;
}

function setup() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty(CFG.PROP_SPREADSHEET_ID);
  if (!ssId) return; // Waiting for user to set via UI
  const ss = SpreadsheetApp.openById(ssId);
  let sheet = ss.getSheetByName(CFG.DEFAULT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CFG.DEFAULT_SHEET_NAME);
  }
  const headers = ['id', 'createdAtISO', 'tanggalISO', 'tipe', 'nominal', 'keterangan'];
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = firstRow.every(v => v === '');
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

// MANUAL SETUP INSTRUCTIONS:
// Untuk mengatur Spreadsheet ID, buka File > Project Properties > Script Properties
// Tambahkan property: SIMPelCATAT_SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"
// Atau gunakan kode berikut di Apps Script editor:
// PropertiesService.getScriptProperties().setProperty('SIMPelCATAT_SPREADSHEET_ID', 'YOUR_SPREADSHEET_ID_HERE');

function getConfig() {
  const ssId = PropertiesService.getScriptProperties().getProperty(CFG.PROP_SPREADSHEET_ID);
  return { ssId, tz: CFG.TZ, pageSize: CFG.PAGE_SIZE };
}

function _getSheet() {
  const ssId = PropertiesService.getScriptProperties().getProperty(CFG.PROP_SPREADSHEET_ID);
  if (!ssId) throw new Error('Spreadsheet ID belum diset.');
  const ss = SpreadsheetApp.openById(ssId);
  const sheet = ss.getSheetByName(CFG.DEFAULT_SHEET_NAME);
  if (!sheet) throw new Error('Sheet tidak ditemukan: ' + CFG.DEFAULT_SHEET_NAME);
  return sheet;
}

function addTransaction(payload) {
  const { tipe, nominal, tanggalISO, keterangan } = payload;
  if (!['MASUK', 'KELUAR'].includes(tipe)) throw new Error('Tipe harus MASUK atau KELUAR');
  const amount = Number(nominal);
  if (!isFinite(amount) || amount <= 0) throw new Error('Nominal tidak valid');
  const now = new Date();
  const id = Utilities.getUuid();
  const row = [
    id,
    now.toISOString(),
    tanggalISO || _dateOnlyISO(now),
    tipe,
    amount,
    (keterangan || '').trim()
  ];
  const sheet = _getSheet();
  sheet.appendRow(row);
  CacheService.getScriptCache().remove(CFG.SUMMARY_CACHE_KEY);
  return { id };
}

function addTransactions(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('Tidak ada transaksi yang diserahkan.');
  }
  const now = new Date();
  const sheet = _getSheet();
  const rows = [];
  for (const payload of list) {
    const { tipe, nominal, tanggalISO, keterangan } = payload || {};
    if (!['MASUK', 'KELUAR'].includes(tipe)) {
      throw new Error('Tipe harus MASUK atau KELUAR');
    }
    const amount = Number(nominal);
    if (!isFinite(amount) || amount <= 0) {
      throw new Error('Nominal tidak valid');
    }
    const row = [
      Utilities.getUuid(),
      now.toISOString(),
      tanggalISO || _dateOnlyISO(now),
      tipe,
      amount,
      (keterangan || '').trim()
    ];
    rows.push(row);
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  CacheService.getScriptCache().remove(CFG.SUMMARY_CACHE_KEY);
  return { count: rows.length };
}

function editTransaction(id, updates) {
  const sheet = _getSheet();
  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (data[r][0] === id) {
      const row = data[r];
      if (updates.tipe) {
        if (!['MASUK', 'KELUAR'].includes(updates.tipe)) throw new Error('Tipe tidak valid');
        row[3] = updates.tipe;
      }
      if (updates.nominal != null) {
        const amount = Number(updates.nominal);
        if (!isFinite(amount) || amount <= 0) throw new Error('Nominal tidak valid');
        row[4] = amount;
      }
      if (updates.tanggalISO) {
        row[2] = updates.tanggalISO;
      }
      if (updates.keterangan != null) {
        row[5] = String(updates.keterangan).trim();
      }
      sheet.getRange(r + 1, 1, 1, row.length).setValues([row]);
      CacheService.getScriptCache().remove(CFG.SUMMARY_CACHE_KEY);
      return { id };
    }
  }
  throw new Error('Transaksi tidak ditemukan');
}

function deleteTransaction(id) {
  const sheet = _getSheet();
  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (data[r][0] === id) {
      sheet.deleteRow(r + 1);
      CacheService.getScriptCache().remove(CFG.SUMMARY_CACHE_KEY);
      return { id };
    }
  }
  throw new Error('Transaksi tidak ditemukan');
}

function getSummary() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CFG.SUMMARY_CACHE_KEY);
  if (cached) return JSON.parse(cached);
  const sheet = _getSheet();
  const values = sheet.getDataRange().getValues();
  let masuk = 0, keluar = 0;
  for (let i = 1; i < values.length; i++) {
    const tipe = values[i][3];
    const nominal = Number(values[i][4]) || 0;
    if (tipe === 'MASUK') masuk += nominal; else if (tipe === 'KELUAR') keluar += nominal;
  }
  const saldo = masuk - keluar; // initial balance 0
  const summary = { saldo, masuk, keluar, count: Math.max(0, values.length - 1) };
  cache.put(CFG.SUMMARY_CACHE_KEY, JSON.stringify(summary), CFG.SUMMARY_CACHE_TTL);
  return summary;
}

/**
 * BEST PRACTICE: Simple date range query dengan caching
 * Mengikuti pattern dari reference untuk performance optimal
 * @param {Object} params - { startDateStr, endDateStr, tipe, search }
 * @returns {Object} - { status, data, message, debug }
 */
function getTransactions(params) {
  try {
    // Ekstrak parameters
    const startDateStr = params && params.startDateStr;
    const endDateStr = params && params.endDateStr;
    const tipe = params && params.tipe;
    const search = params && params.search;
    
    // Validasi input
    if (!startDateStr || !endDateStr) {
      return {
        status: 'error',
        message: 'Parameter tanggal wajib diisi: startDateStr dan endDateStr',
        data: [],
        debug: { error: 'Missing date parameters' }
      };
    }
    
    // PERFORMANCE: Check cache first (2 minutes TTL)
    const cacheKey = `trans_${startDateStr}_${endDateStr}_${tipe || 'all'}_${search || ''}`;
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      const cachedData = JSON.parse(cached);
      cachedData.debug = cachedData.debug || {};
      cachedData.debug.cacheHit = true;
      return cachedData;
    }
    
    // Access sheet
    const sheet = _getSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      const result = {
        status: 'success',
        data: [],
        message: 'Tidak ada data transaksi',
        debug: { totalRows: 0 }
      };
      cache.put(cacheKey, JSON.stringify(result), 120); // 2 minutes
      return result;
    }
    
    // OPTIMIZED: Get specific range instead of entire sheet
    const allData = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    // Parse date range
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999); // End of day
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        status: 'error',
        message: 'Format tanggal tidak valid',
        data: [],
        debug: { startDateStr, endDateStr }
      };
    }
    
    // Filter data dengan timezone handling
    const timezone = CFG.TZ; // 'Asia/Makassar'
    const filteredData = [];
    let totalRowsChecked = 0;
    let dateMatchCount = 0;
    
    // BEST PRACTICE: String comparison untuk date filtering (lebih reliable)
    // Convert start/end dates to YMD string untuk comparison
    const startYmd = Utilities.formatDate(startDate, timezone, 'yyyy-MM-dd');
    const endYmd = Utilities.formatDate(endDate, timezone, 'yyyy-MM-dd');
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      totalRowsChecked++;
      
      // Skip invalid rows
      if (!row || !row[2]) continue;
      
      // Get date from sheet - bisa berupa Date object atau string
      let txYmd;
      if (row[2] instanceof Date) {
        // If it's a Date object, format it
        txYmd = Utilities.formatDate(row[2], timezone, 'yyyy-MM-dd');
      } else {
        // If it's a string, use directly (assuming yyyy-MM-dd format)
        txYmd = String(row[2]).substring(0, 10); // Get yyyy-MM-dd part
      }
      
      // Skip invalid dates
      if (!txYmd || txYmd.length < 10) continue;
      
      // BEST PRACTICE: String comparison for dates (reliable, fast)
      if (txYmd >= startYmd && txYmd <= endYmd) {
        dateMatchCount++;
        
        // Tipe filter
        if (tipe && tipe !== '' && row[3] !== tipe) continue;
        
        // Search filter
        if (search && search !== '') {
          const keterangan = String(row[5] || '').toLowerCase();
          if (!keterangan.includes(search.toLowerCase())) continue;
        }
        
        // Add to results
        filteredData.push({
          id: row[0],
          createdAtISO: row[1],
          tanggalISO: txYmd, // Use YMD format
          tanggalDisplay: `${txYmd.substring(8,10)}/${txYmd.substring(5,7)}/${txYmd.substring(0,4)}`,
          tipe: row[3] || '',
          nominal: parseFloat(row[4]) || 0,
          keterangan: row[5] || ''
        });
      }
    }
    
    const result = {
      status: 'success',
      data: filteredData,
      message: `Berhasil mengambil ${filteredData.length} transaksi`,
      debug: {
        cacheHit: false,
        filterRange: { startDateStr, endDateStr },
        filterRangeFormatted: { startYmd, endYmd },
        totalRows: lastRow - 1,
        rowsChecked: totalRowsChecked,
        dateMatches: dateMatchCount,
        finalResults: filteredData.length,
        timezone: timezone,
        sampleDate: allData.length > 0 ? (allData[0][2] instanceof Date ? 'Date object' : 'String: ' + String(allData[0][2]).substring(0, 10)) : 'No data'
      }
    };
    
    // PERFORMANCE: Save to cache
    cache.put(cacheKey, JSON.stringify(result), 120); // 2 minutes TTL
    
    return result;
    
  } catch (error) {
    Logger.log('Error in getTransactions: ' + error.message);
    return {
      status: 'error',
      message: 'Gagal mengambil transaksi: ' + error.message,
      data: [],
      debug: { error: error.toString() }
    };
  }
}

// REMOVED: _computeDateFilter, _dateOnlyISO, _dateISOInRange
// Best practice: Frontend calculates date range, backend just filters
// Simpler, more maintainable, better separation of concerns