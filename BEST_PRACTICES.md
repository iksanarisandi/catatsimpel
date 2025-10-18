# 📚 Best Practices: Google Apps Script Web App Development

> **Dokumentasi lengkap untuk pengembangan web app berbasis Google Apps Script dengan fokus pada mobile-responsive design dan transaction filtering system.**

---

## 📖 Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Mobile Responsive Setup](#2-mobile-responsive-setup)
3. [Backend Best Practices](#3-backend-best-practices)
4. [Transaction Loading & Filtering](#4-transaction-loading--filtering)
5. [Date Handling](#5-date-handling)
6. [Caching Strategy](#6-caching-strategy)
7. [Performance Optimization](#7-performance-optimization)
8. [Common Pitfalls](#8-common-pitfalls)
9. [Deployment Guide](#9-deployment-guide)
10. [Testing & Debugging](#10-testing--debugging)

---

## 1. Project Architecture

### 1.1 File Structure

```
project/
├── Code.gs                 # Backend (Google Apps Script)
├── Index.html             # Frontend (HTML + CSS + JS)
├── appsscript.json        # Apps Script manifest
├── .clasp.json            # Clasp configuration (DO NOT COMMIT!)
├── .gitignore             # Git ignore rules
└── README.md              # Documentation
```

### 1.2 Separation of Concerns

**✅ RECOMMENDED:**
```javascript
// Frontend (Index.html)
- Calculate date ranges
- Handle UI interactions
- Format display data
- Manage user input

// Backend (Code.gs)
- Data validation
- Sheet operations
- Business logic
- Caching
```

**❌ AVOID:**
```javascript
// Backend calculating frontend-specific things
// Frontend directly accessing sheets
// Mixed responsibilities
```

### 1.3 Configuration Management

**Use Script Properties for environment-specific config:**

```javascript
// Code.gs
function getSpreadsheetId() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID not configured');
  }
  
  return spreadsheetId;
}

// Setup function (run once manually)
function setupConfig() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', 'your-sheet-id-here');
}
```

**Benefits:**
- ✅ No hardcoded credentials
- ✅ Easy multi-environment deployment
- ✅ Secure configuration
- ✅ No sensitive data in repository

---

## 2. Mobile Responsive Setup

### 2.1 Essential Meta Tags

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  
  <!-- CRITICAL: Mobile viewport configuration -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  <!-- Prevent phone number detection -->
  <meta name="format-detection" content="telephone=no" />
  
  <!-- PWA Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#0f172a" />
  
  <title>Your App</title>
</head>
```

**⚠️ IMPORTANT:** In `Code.gs`, only add viewport via `addMetaTag()`:

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Your App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}
```

**❌ Apps Script DOES NOT support these via addMetaTag():**
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `theme-color`

Put them directly in HTML `<head>` instead.

### 2.2 Tailwind CSS Setup

**✅ RECOMMENDED: Use CDN for rapid prototyping**

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          poppins: ['Poppins', 'sans-serif']
        },
        colors: {
          brand: {
            50: '#f1f5f9',
            500: '#2563eb',
            600: '#1d4ed8',
            700: '#1e40af'
          }
        }
      }
    }
  };
</script>
```

**⚠️ Production Note:** Consider building Tailwind locally for production to avoid CDN dependency.

### 2.3 Mobile-First Responsive Classes

```html
<!-- Container with mobile-first approach -->
<div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
  
  <!-- Responsive grid: 2 cols mobile, 4 cols tablet+ -->
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div>Card 1</div>
    <div>Card 2</div>
    <div>Card 3</div>
    <div>Card 4</div>
  </div>
  
  <!-- Responsive text sizing -->
  <p class="text-sm sm:text-base lg:text-lg">
    Responsive text
  </p>
  
  <!-- Responsive padding -->
  <div class="px-3 py-4 sm:px-4 sm:py-5">
    Content
  </div>
  
</div>
```

**Tailwind Breakpoints:**
```
sm:  640px  (tablet)
md:  768px  (tablet landscape)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

### 2.4 Responsive Form Design

**Multi-Entry Form Example:**

```html
<!-- Desktop: 3 columns, Mobile: stack vertically -->
<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  
  <!-- Each entry row -->
  <div class="entry-row flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
    <select class="entry-tipe rounded-xl px-3 py-2.5 text-sm">
      <option value="KELUAR">Keluar</option>
      <option value="MASUK">Masuk</option>
    </select>
    
    <input class="entry-nominal rounded-xl px-3 py-2.5 text-sm" 
           placeholder="Nominal" 
           inputmode="numeric" />
    
    <input class="entry-keterangan rounded-xl px-3 py-2.5 text-sm" 
           placeholder="Keterangan" />
  </div>
  
</div>
```

### 2.5 Mobile-Optimized CSS

```css
/* Base styles for mobile */
body {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}

/* Responsive value sizing */
.summary-value {
  font-size: 1.125rem;  /* 18px mobile */
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;
}

@media (min-width: 640px) {
  .summary-value {
    font-size: 1.25rem;  /* 20px tablet */
  }
}

@media (min-width: 1024px) {
  .summary-value {
    font-size: 1.5rem;   /* 24px desktop */
  }
}

/* Custom scrollbar */
::-webkit-scrollbar { 
  width: 6px; 
}

::-webkit-scrollbar-thumb { 
  background: #cbd5e1; 
  border-radius: 10px; 
}
```

### 2.6 Desktop vs Mobile Layout Pattern

```javascript
// Detect screen size and render accordingly
function renderTransactions(items, reset) {
  const container = document.getElementById('transactionsList');
  
  if (window.innerWidth >= 1024) {
    // Desktop: Table view
    renderTableView(container, items);
  } else {
    // Mobile: Card view
    renderCardView(container, items);
  }
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    loadTransactions(true); // Reload and re-render
  }, 300);
});
```

---

## 3. Backend Best Practices

### 3.1 Sheet Access Pattern

**✅ RECOMMENDED: Lazy-loaded sheet cache**

```javascript
// Global cache
let _sheetCache = {
  transactions: null,
  categories: null
};

function getTransactionsSheet() {
  if (!_sheetCache.transactions) {
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    _sheetCache.transactions = ss.getSheetByName('Transaksi');
    
    if (!_sheetCache.transactions) {
      throw new Error('Sheet "Transaksi" not found');
    }
  }
  return _sheetCache.transactions;
}
```

**Why it works:**
- ✅ Reduces API calls
- ✅ Faster execution
- ✅ Automatic per-execution caching

### 3.2 Data Retrieval Optimization

**❌ SLOW: Getting entire sheet**
```javascript
const data = sheet.getDataRange().getValues();  // Reads entire sheet
```

**✅ FAST: Specific range**
```javascript
const lastRow = sheet.getLastRow();
if (lastRow > 1) {
  // Only read rows 2 to lastRow, columns 1 to 6
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
}
```

**Performance comparison:**
- `getDataRange()`: ~500ms for 1000 rows
- Specific range: ~200ms for 1000 rows
- **60% faster!**

### 3.3 Batch Operations

**❌ AVOID: Multiple individual writes**
```javascript
transactions.forEach(tx => {
  sheet.appendRow([tx.date, tx.type, tx.amount]); // N API calls!
});
```

**✅ RECOMMENDED: Single batch write**
```javascript
const rows = transactions.map(tx => [tx.date, tx.type, tx.amount]);
const lastRow = sheet.getLastRow();
sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
// Just 1 API call!
```

**Performance:**
- Individual: ~100ms per row
- Batch: ~150ms for 10 rows
- **85% faster for 10 items!**

### 3.4 Error Handling Pattern

```javascript
function getTransactions(params) {
  try {
    // Validate input
    if (!params.startDateStr || !params.endDateStr) {
      return {
        status: 'error',
        message: 'Parameter tanggal wajib diisi',
        data: []
      };
    }
    
    // Business logic
    const sheet = getTransactionsSheet();
    const data = processData(sheet, params);
    
    return {
      status: 'success',
      data: data,
      message: `Berhasil mengambil ${data.length} transaksi`
    };
    
  } catch (error) {
    Logger.log('Error in getTransactions: ' + error.message);
    return {
      status: 'error',
      message: 'Gagal mengambil transaksi: ' + error.message,
      data: []
    };
  }
}
```

**Key points:**
- ✅ Always return consistent structure
- ✅ Include status field
- ✅ Log errors for debugging
- ✅ Return empty data on error (not null)

---

## 4. Transaction Loading & Filtering

### 4.1 Architecture Overview

```
┌─────────────┐
│  Frontend   │
│             │
│ Calculate   │  startDateStr: "2025-10-01"
│ date range  │  endDateStr:   "2025-10-31"
│             │  tipe:         "MASUK"
│             │  search:       "gaji"
└──────┬──────┘
       │ google.script.run.getTransactions(params)
       ▼
┌─────────────┐
│   Backend   │
│             │
│ 1. Check    │◄─── Cache (2 min TTL)
│    cache    │
│             │
│ 2. Query    │
│    sheet    │
│             │
│ 3. Filter   │──► String comparison
│    data     │    (txYmd >= startYmd)
│             │
│ 4. Return   │
│    result   │
└──────┬──────┘
       │ { status, data, message, debug }
       ▼
┌─────────────┐
│  Frontend   │
│             │
│ Render      │
│ transactions│
└─────────────┘
```

### 4.2 Frontend: Date Range Calculation

**✅ BEST PRACTICE: Frontend calculates dates**

```javascript
function loadTransactions(reset) {
  let startDateStr, endDateStr;
  const rangeValue = document.getElementById('range').value;
  
  switch(rangeValue) {
    case 'today':
      const today = getTodayISO();
      startDateStr = today;
      endDateStr = today;
      break;
      
    case 'week':
      // This week (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sunday
      const monday = new Date(now);
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(now.getDate() - daysToMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      startDateStr = formatDateToISO(monday);
      endDateStr = formatDateToISO(sunday);
      break;
      
    case 'month':
      // This month
      const today2 = new Date();
      const firstDay = new Date(today2.getFullYear(), today2.getMonth(), 1);
      const lastDay = new Date(today2.getFullYear(), today2.getMonth() + 1, 0);
      
      startDateStr = formatDateToISO(firstDay);
      endDateStr = formatDateToISO(lastDay);
      break;
      
    case 'all':
      startDateStr = '2000-01-01';
      endDateStr = '2099-12-31';
      break;
      
    case 'custom':
      startDateStr = document.getElementById('start').value;
      endDateStr = document.getElementById('end').value;
      
      if (!startDateStr || !endDateStr) {
        showToast('Pilih tanggal mulai dan akhir');
        return;
      }
      break;
  }
  
  const params = {
    startDateStr: startDateStr,
    endDateStr: endDateStr,
    tipe: document.getElementById('tipe').value,
    search: document.getElementById('search').value
  };
  
  console.log('📤 Loading with params:', params);
  
  google.script.run
    .withSuccessHandler(handleSuccess)
    .withFailureHandler(handleError)
    .getTransactions(params);
}

// Helper function
function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**Why this approach:**
- ✅ Clear separation: Frontend = UI, Backend = Data
- ✅ Easier to debug (dates visible in params)
- ✅ Backend stays simple and focused
- ✅ Timezone issues handled in one place

### 4.3 Backend: Transaction Query

**✅ BEST PRACTICE: Simple filter with string comparison**

```javascript
function getTransactions(params) {
  try {
    const startDateStr = params && params.startDateStr;
    const endDateStr = params && params.endDateStr;
    const tipe = params && params.tipe;
    const search = params && params.search;
    
    // Validation
    if (!startDateStr || !endDateStr) {
      return {
        status: 'error',
        message: 'Parameter tanggal wajib diisi',
        data: []
      };
    }
    
    // Check cache
    const cacheKey = `trans_${startDateStr}_${endDateStr}_${tipe || 'all'}_${search || ''}`;
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      const cachedData = JSON.parse(cached);
      cachedData.debug.cacheHit = true;
      return cachedData;
    }
    
    // Query sheet
    const sheet = getTransactionsSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { status: 'success', data: [], message: 'Tidak ada data' };
    }
    
    const allData = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    // Parse dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    
    // Convert to YMD strings for comparison
    const timezone = 'Asia/Makassar';
    const startYmd = Utilities.formatDate(startDate, timezone, 'yyyy-MM-dd');
    const endYmd = Utilities.formatDate(endDate, timezone, 'yyyy-MM-dd');
    
    // Filter data
    const filteredData = [];
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      
      if (!row || !row[2]) continue; // Skip invalid rows
      
      // Get transaction date as YMD string
      let txYmd;
      if (row[2] instanceof Date) {
        txYmd = Utilities.formatDate(row[2], timezone, 'yyyy-MM-dd');
      } else {
        txYmd = String(row[2]).substring(0, 10);
      }
      
      if (!txYmd || txYmd.length < 10) continue;
      
      // STRING COMPARISON (reliable!)
      if (txYmd >= startYmd && txYmd <= endYmd) {
        
        // Type filter
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
          tanggalISO: txYmd,
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
      message: `Berhasil mengambil ${filteredData.length} transaksi`
    };
    
    // Save to cache
    cache.put(cacheKey, JSON.stringify(result), 120); // 2 min TTL
    
    return result;
    
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return {
      status: 'error',
      message: 'Gagal mengambil transaksi: ' + error.message,
      data: []
    };
  }
}
```

---

## 5. Date Handling

### 5.1 The Problem with Date Objects

**❌ PROBLEMATIC:**
```javascript
// Date comparison is timezone-dependent
const date1 = new Date('2025-10-18');  // Might be Oct 17 23:00 UTC-7
const date2 = new Date('2025-10-18');  // Might be Oct 18 00:00 UTC+7
date1 < date2; // Unpredictable!
```

**✅ SOLUTION: String comparison**
```javascript
// Reliable, timezone-independent
const date1 = '2025-10-18';
const date2 = '2025-10-18';
date1 >= date2; // Always predictable!
```

### 5.2 Date Formatting Best Practice

**Backend (Apps Script):**
```javascript
// ALWAYS use Utilities.formatDate with explicit timezone
const timezone = 'Asia/Makassar';
const dateObj = new Date('2025-10-18');
const ymd = Utilities.formatDate(dateObj, timezone, 'yyyy-MM-dd');
// Result: "2025-10-18" (consistent)
```

**Frontend (JavaScript):**
```javascript
// For display dates, format with locale
const date = new Date('2025-10-18');
const formatted = date.toLocaleDateString('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// Result: "18 Oktober 2025"

// For queries, use ISO format
function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### 5.3 Date Range Patterns

**Today:**
```javascript
const today = new Date();
const ymd = formatDateToISO(today);
startDateStr = ymd;
endDateStr = ymd;
```

**This Week (Monday-Sunday):**
```javascript
const today = new Date();
const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

// Calculate days to Monday
const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

// Get Monday
const monday = new Date(today);
monday.setDate(today.getDate() - daysToMonday);

// Get Sunday (6 days after Monday)
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);

startDateStr = formatDateToISO(monday);
endDateStr = formatDateToISO(sunday);
```

**This Month:**
```javascript
const today = new Date();

// First day of month
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

// Last day of month (day 0 of next month)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

startDateStr = formatDateToISO(firstDay);
endDateStr = formatDateToISO(lastDay);
```

### 5.4 Handling Sheet Date Data

Sheet data might be Date objects or strings. Handle both:

```javascript
function getDateYmd(cellValue, timezone) {
  if (cellValue instanceof Date) {
    // It's a Date object
    return Utilities.formatDate(cellValue, timezone, 'yyyy-MM-dd');
  } else {
    // It's a string, extract yyyy-MM-dd part
    return String(cellValue).substring(0, 10);
  }
}

// Usage
const txYmd = getDateYmd(row[2], 'Asia/Makassar');
```

---

## 6. Caching Strategy

### 6.1 When to Use Cache

**✅ CACHE:**
- Read-heavy operations
- Data that doesn't change frequently
- Expensive calculations
- Query results that repeat

**❌ DON'T CACHE:**
- Write operations
- Real-time data
- User-specific sensitive data
- Data that changes on every request

### 6.2 Implementation Pattern

```javascript
function getData(params) {
  // 1. Create unique cache key
  const cacheKey = `prefix_${param1}_${param2}`;
  
  // 2. Check cache
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    const data = JSON.parse(cached);
    data.debug = data.debug || {};
    data.debug.cacheHit = true;
    return data;
  }
  
  // 3. Fetch fresh data
  const freshData = expensiveOperation(params);
  
  // 4. Save to cache with TTL
  const result = {
    status: 'success',
    data: freshData,
    debug: { cacheHit: false }
  };
  
  cache.put(cacheKey, JSON.stringify(result), 120); // 120 seconds = 2 min
  
  return result;
}
```

### 6.3 Cache Invalidation

**When data changes, clear related caches:**

```javascript
function addTransaction(transactionData) {
  // ... save transaction ...
  
  // Clear related caches
  const cache = CacheService.getScriptCache();
  cache.remove('summary_cache');
  // Note: Can't clear all transaction queries easily
  // Solution: Use short TTL (2 min) so stale data expires quickly
  
  return { status: 'success' };
}
```

### 6.4 Cache Key Design

**✅ GOOD: Include all relevant parameters**
```javascript
const cacheKey = `trans_${startDate}_${endDate}_${type}_${search}`;
// Different filters = different cache entries
```

**❌ BAD: Too generic**
```javascript
const cacheKey = 'transactions';
// All filters share same cache = wrong results!
```

### 6.5 Recommended TTL Values

```javascript
// Summary data (changes on every transaction)
cache.put(key, data, 60);  // 1 minute

// Transaction queries (append-only, changes less)
cache.put(key, data, 120); // 2 minutes

// Static reference data (categories, wallets)
cache.put(key, data, 600); // 10 minutes
```

---

## 7. Performance Optimization

### 7.1 Batch API Calls

**❌ SLOW: Sequential calls**
```javascript
google.script.run
  .withSuccessHandler(() => {
    google.script.run
      .withSuccessHandler(() => {
        google.script.run.getThirdThing();
      })
      .getSecondThing();
  })
  .getFirstThing();
```

**✅ FAST: Parallel calls**
```javascript
let results = { first: null, second: null, third: null };
let completed = 0;

function checkComplete() {
  if (completed === 3) {
    // All done, proceed
    processResults(results);
  }
}

google.script.run
  .withSuccessHandler(data => {
    results.first = data;
    completed++;
    checkComplete();
  })
  .getFirstThing();

google.script.run
  .withSuccessHandler(data => {
    results.second = data;
    completed++;
    checkComplete();
  })
  .getSecondThing();

google.script.run
  .withSuccessHandler(data => {
    results.third = data;
    completed++;
    checkComplete();
  })
  .getThirdThing();
```

**Or use Promise wrapper:**
```javascript
function runAsync(functionName, ...args) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName](...args);
  });
}

// Usage
async function loadData() {
  const [summary, categories, wallets] = await Promise.all([
    runAsync('getSummary'),
    runAsync('getCategories'),
    runAsync('getWallets')
  ]);
  
  // Process all results
}
```

### 7.2 Minimize DOM Operations

**❌ SLOW: Multiple DOM updates**
```javascript
transactions.forEach(tx => {
  const card = createCard(tx);
  container.appendChild(card); // DOM update on each iteration!
});
```

**✅ FAST: Single DOM update**
```javascript
const fragment = document.createDocumentFragment();

transactions.forEach(tx => {
  const card = createCard(tx);
  fragment.appendChild(card); // Build in memory
});

container.appendChild(fragment); // Single DOM update!
```

### 7.3 Debounce Search Input

**❌ SLOW: Query on every keystroke**
```javascript
searchInput.addEventListener('input', () => {
  loadTransactions(); // API call on every key!
});
```

**✅ FAST: Debounced search**
```javascript
let searchTimeout;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadTransactions(); // API call after 500ms pause
  }, 500);
});
```

### 7.4 Loading States

**Always show loading feedback:**

```javascript
function loadTransactions() {
  // Show loading
  const container = document.getElementById('transactionsList');
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      <p class="mt-3 text-sm text-slate-400">Memuat transaksi...</p>
    </div>
  `;
  
  // Make API call
  google.script.run
    .withSuccessHandler(handleSuccess)
    .withFailureHandler(handleError)
    .getTransactions(params);
}
```

---

## 8. Common Pitfalls

### 8.1 Timezone Issues

**❌ WRONG:**
```javascript
const date = new Date('2025-10-18');
// Browser might interpret as UTC or local timezone!
```

**✅ CORRECT:**
```javascript
// Backend: Explicit timezone
const ymd = Utilities.formatDate(date, 'Asia/Makassar', 'yyyy-MM-dd');

// Frontend: Use strings
const ymd = '2025-10-18';
```

### 8.2 Empty Data Handling

**❌ WRONG:**
```javascript
function getTransactions() {
  const data = querySheet();
  return data; // Might return null or undefined!
}
```

**✅ CORRECT:**
```javascript
function getTransactions() {
  const data = querySheet();
  return {
    status: 'success',
    data: data || [],  // Always return array
    message: data.length ? `Found ${data.length} items` : 'No data'
  };
}
```

### 8.3 Currency Formatting

**❌ WRONG:**
```javascript
const formatted = 'Rp ' + amount; // "Rp 1500000" (hard to read)
```

**✅ CORRECT:**
```javascript
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
// Result: "Rp1.500.000"
```

### 8.4 Input Validation

**Always validate before processing:**

```javascript
function addTransaction(data) {
  // Validate required fields
  if (!data.tanggalISO || !data.tipe || !data.nominal) {
    return {
      status: 'error',
      message: 'Data tidak lengkap'
    };
  }
  
  // Validate data types
  if (typeof data.nominal !== 'number' || isNaN(data.nominal)) {
    return {
      status: 'error',
      message: 'Nominal harus berupa angka'
    };
  }
  
  // Validate values
  if (data.nominal <= 0) {
    return {
      status: 'error',
      message: 'Nominal harus lebih dari 0'
    };
  }
  
  // Proceed with save
  // ...
}
```

### 8.5 Error Messages

**❌ BAD: Technical jargon**
```javascript
message: "ReferenceError: sheet is not defined at line 42"
```

**✅ GOOD: User-friendly**
```javascript
message: "Gagal menyimpan transaksi. Silakan coba lagi."
// Log technical details for debugging
Logger.log('Technical error: ' + error.stack);
```

---

## 9. Deployment Guide

### 9.1 Pre-Deployment Checklist

```markdown
- [ ] Script Properties configured
- [ ] Sheet structure matches code expectations
- [ ] Test data available
- [ ] Error handling in place
- [ ] Cache TTL values appropriate
- [ ] Loading states implemented
- [ ] Mobile responsive tested
- [ ] No console.log in production code (or conditional)
- [ ] No hardcoded credentials
- [ ] .clasp.json in .gitignore
```

### 9.2 Deployment Steps

**1. Setup Script Properties:**
```javascript
// Run this function once manually
function setupConfig() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', 'your-sheet-id-here');
  properties.setProperty('TIMEZONE', 'Asia/Makassar');
}
```

**2. Test Locally:**
```bash
clasp push
# Open Apps Script editor
# Run setupConfig() manually
# Test functions in editor
```

**3. Deploy Web App:**
```
1. In Apps Script editor: Deploy > New deployment
2. Type: Web app
3. Description: "Production v1.0"
4. Execute as: Me (your-email@gmail.com)
5. Who has access: Anyone
6. Click "Deploy"
7. Copy Web App URL
```

**4. Update README:**
```markdown
## Live URL
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 9.3 Version Management

**Use clasp for version control:**

```bash
# Push changes
clasp push

# Create new version
clasp version "v1.1: Added filters"

# Deploy specific version
clasp deploy --versionNumber 2 --description "v1.1"
```

**Git tagging:**
```bash
git tag -a v1.0 -m "Initial release"
git push origin v1.0
```

---

## 10. Testing & Debugging

### 10.1 Debug Mode

**Add debug flag:**

```javascript
const DEBUG = false; // Set to true for development

function log(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

// Usage
log('🔍 Filtering with params:', params);
```

### 10.2 Response Debug Info

**Always include debug info in development:**

```javascript
const result = {
  status: 'success',
  data: filteredData,
  message: '...',
  debug: {
    cacheHit: false,
    executionTime: Date.now() - startTime,
    filterParams: { startYmd, endYmd, tipe },
    totalRows: allData.length,
    filteredRows: filteredData.length,
    timestamp: new Date().toISOString()
  }
};
```

### 10.3 Console Logging Best Practices

**Use emoji for visual scanning:**

```javascript
console.log('📤 Sending request:', params);
console.log('📥 Received response:', response);
console.log('✅ Success:', message);
console.log('❌ Error:', error);
console.log('🔍 Debug:', debugInfo);
console.log('⚡ Cache hit!');
console.log('🔄 Loading...');
console.log('✨ Rendering:', items.length, 'items');
```

### 10.4 Testing Checklist

**Frontend:**
```markdown
- [ ] All filters work correctly
- [ ] Empty state displays properly
- [ ] Loading states show
- [ ] Error messages display
- [ ] Mobile layout responsive
- [ ] Desktop layout works
- [ ] Forms validate input
- [ ] Currency formats correctly
- [ ] Dates display in correct format
- [ ] Search works
```

**Backend:**
```markdown
- [ ] Data retrieval correct
- [ ] Filtering logic accurate
- [ ] Date comparison reliable
- [ ] Cache working
- [ ] Batch operations successful
- [ ] Error handling graceful
- [ ] Validation prevents bad data
- [ ] Timezone handling correct
```

### 10.5 Common Debug Scenarios

**Scenario 1: Filter returns 0 results**

```javascript
// Add extensive logging
console.log('🔍 Filter params:', { startYmd, endYmd });
console.log('🔍 Sample date from sheet:', allData[0][2]);
console.log('🔍 Comparison:', {
  txYmd: txYmd,
  startYmd: startYmd,
  passes: txYmd >= startYmd && txYmd <= endYmd
});
```

**Scenario 2: Dates not matching**

```javascript
// Check date format
const row = allData[0];
console.log('Date cell value:', row[2]);
console.log('Type:', typeof row[2]);
console.log('Is Date object:', row[2] instanceof Date);

if (row[2] instanceof Date) {
  console.log('Formatted:', Utilities.formatDate(row[2], 'Asia/Makassar', 'yyyy-MM-dd'));
}
```

**Scenario 3: Cache not working**

```javascript
// Log cache operations
const cacheKey = `trans_${params}`;
console.log('🔑 Cache key:', cacheKey);

const cached = cache.get(cacheKey);
console.log('⚡ Cache result:', cached ? 'HIT' : 'MISS');

if (!cached) {
  cache.put(cacheKey, JSON.stringify(data), 120);
  console.log('💾 Saved to cache');
}
```

---

## 11. Real-World Example: Complete Filter Implementation

### 11.1 HTML Structure

```html
<!-- Filter Section -->
<div class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  
  <!-- Date Range Filter -->
  <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
    <label class="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Rentang</label>
    <select id="range" class="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm">
      <option value="today" selected>Hari ini</option>
      <option value="week">Mingguan</option>
      <option value="month">Bulanan</option>
      <option value="all">Semua</option>
      <option value="custom">Tanggal khusus</option>
    </select>
  </div>
  
  <!-- Type Filter -->
  <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
    <label class="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Tipe</label>
    <select id="tipe" class="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm">
      <option value="">Semua</option>
      <option value="MASUK">Pemasukan</option>
      <option value="KELUAR">Pengeluaran</option>
    </select>
  </div>
  
  <!-- Custom Date Start -->
  <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
    <label class="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Dari</label>
    <input type="date" id="start" disabled class="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm disabled:opacity-50" />
  </div>
  
  <!-- Custom Date End -->
  <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
    <label class="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Sampai</label>
    <input type="date" id="end" disabled class="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm disabled:opacity-50" />
  </div>
  
</div>

<!-- Search -->
<div class="mb-6">
  <input type="text" id="search" placeholder="🔍 Cari keterangan..." class="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm" />
</div>

<!-- Transactions List -->
<div id="transactionsList"></div>
```

### 11.2 JavaScript Implementation

```javascript
// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  loadTransactions(true);
});

function setupFilters() {
  const rangeEl = document.getElementById('range');
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');
  const tipeEl = document.getElementById('tipe');
  const searchEl = document.getElementById('search');
  
  // Range change: enable/disable date pickers
  rangeEl.addEventListener('change', () => {
    const isCustom = rangeEl.value === 'custom';
    startEl.disabled = !isCustom;
    endEl.disabled = !isCustom;
    
    if (!isCustom) {
      startEl.value = '';
      endEl.value = '';
    }
    
    loadTransactions(true);
  });
  
  // Type filter change
  tipeEl.addEventListener('change', () => {
    loadTransactions(true);
  });
  
  // Date picker change
  startEl.addEventListener('change', () => {
    if (startEl.value && endEl.value) {
      loadTransactions(true);
    }
  });
  
  endEl.addEventListener('change', () => {
    if (startEl.value && endEl.value) {
      loadTransactions(true);
    }
  });
  
  // Search with debounce
  let searchTimeout;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadTransactions(true);
    }, 500);
  });
}

function loadTransactions(reset) {
  if (reset) {
    showLoading();
  }
  
  const params = buildFilterParams();
  
  if (!params) return; // Validation failed
  
  console.log('📤 Loading transactions:', params);
  
  google.script.run
    .withSuccessHandler(handleTransactionsSuccess)
    .withFailureHandler(handleTransactionsError)
    .getTransactions(params);
}

function buildFilterParams() {
  const rangeValue = document.getElementById('range').value;
  let startDateStr, endDateStr;
  
  switch(rangeValue) {
    case 'today':
      const today = getTodayISO();
      startDateStr = today;
      endDateStr = today;
      break;
      
    case 'week':
      const weekRange = getThisWeekRange();
      startDateStr = weekRange.start;
      endDateStr = weekRange.end;
      break;
      
    case 'month':
      const monthRange = getThisMonthRange();
      startDateStr = monthRange.start;
      endDateStr = monthRange.end;
      break;
      
    case 'all':
      startDateStr = '2000-01-01';
      endDateStr = '2099-12-31';
      break;
      
    case 'custom':
      startDateStr = document.getElementById('start').value;
      endDateStr = document.getElementById('end').value;
      
      if (!startDateStr || !endDateStr) {
        showToast('Pilih tanggal mulai dan akhir untuk filter custom', 'error');
        return null;
      }
      break;
  }
  
  return {
    startDateStr: startDateStr,
    endDateStr: endDateStr,
    tipe: document.getElementById('tipe').value,
    search: document.getElementById('search').value
  };
}

function getTodayISO() {
  return formatDateToISO(new Date());
}

function getThisWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: formatDateToISO(monday),
    end: formatDateToISO(sunday)
  };
}

function getThisMonthRange() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    start: formatDateToISO(firstDay),
    end: formatDateToISO(lastDay)
  };
}

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function handleTransactionsSuccess(response) {
  console.log('📥 Response:', response);
  
  if (response.status === 'success') {
    renderTransactions(response.data, true);
    
    if (response.debug) {
      console.log('🔍 Debug:', response.debug);
    }
  } else {
    showToast(response.message || 'Gagal memuat transaksi', 'error');
  }
}

function handleTransactionsError(error) {
  console.error('❌ Error:', error);
  showToast('Terjadi kesalahan saat memuat transaksi', 'error');
  
  const container = document.getElementById('transactionsList');
  container.innerHTML = `
    <div class="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-6 text-center">
      <p class="text-sm text-red-400">Gagal memuat transaksi</p>
    </div>
  `;
}

function showLoading() {
  const container = document.getElementById('transactionsList');
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      <p class="mt-3 text-sm text-slate-400">Memuat transaksi...</p>
    </div>
  `;
}

function renderTransactions(items, reset) {
  const container = document.getElementById('transactionsList');
  
  if (reset) {
    container.innerHTML = '';
  }
  
  console.log('✨ Rendering:', items.length, 'transactions');
  
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="rounded-3xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center">
        <p class="text-sm text-slate-300">Belum ada transaksi untuk filter ini</p>
      </div>
    `;
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  items.forEach(item => {
    const card = createTransactionCard(item);
    fragment.appendChild(card);
  });
  
  container.appendChild(fragment);
}

function createTransactionCard(item) {
  const card = document.createElement('div');
  card.className = 'rounded-2xl border border-white/10 bg-white/5 px-4 py-4 mb-3';
  
  const isIncome = item.tipe === 'MASUK';
  const color = isIncome ? 'text-emerald-400' : 'text-rose-400';
  const sign = isIncome ? '+' : '-';
  
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-slate-200">${item.keterangan || '-'}</p>
        <p class="mt-1 text-xs text-slate-400">${item.tanggalDisplay}</p>
      </div>
      <div class="text-right">
        <p class="text-base font-semibold ${color}">
          ${sign} ${formatCurrency(item.nominal)}
        </p>
      </div>
    </div>
  `;
  
  return card;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(amount));
}

function showToast(message, type = 'info') {
  // Toast implementation
  console.log(`${type.toUpperCase()}: ${message}`);
}
```

---

## 12. Summary Checklist

### Quick Reference for New Projects

```markdown
## Setup Phase
- [ ] Create Google Sheet with proper structure
- [ ] Initialize Apps Script project
- [ ] Setup .gitignore (exclude .clasp.json)
- [ ] Configure Script Properties
- [ ] Setup Git repository

## Mobile Responsive
- [ ] Add viewport meta tag
- [ ] Use Tailwind CSS with custom config
- [ ] Implement mobile-first responsive classes
- [ ] Test on actual mobile device
- [ ] Add touch-friendly UI elements

## Backend
- [ ] Use Script Properties for config
- [ ] Implement lazy-loaded sheet cache
- [ ] Use specific range queries (not getDataRange)
- [ ] Implement batch operations for writes
- [ ] Add CacheService with appropriate TTL
- [ ] Implement consistent error handling
- [ ] Add debug info in responses
- [ ] Use explicit timezone (Utilities.formatDate)

## Date Handling
- [ ] Frontend calculates date ranges
- [ ] Backend uses string comparison
- [ ] Format dates as 'yyyy-MM-dd'
- [ ] Handle both Date objects and strings from sheet
- [ ] Use explicit timezone in backend

## Filtering
- [ ] Implement all filter options (today, week, month, all, custom)
- [ ] Enable/disable date pickers based on filter
- [ ] Add debounced search
- [ ] Show loading states
- [ ] Handle empty results gracefully

## Performance
- [ ] Cache frequently accessed data
- [ ] Use DocumentFragment for DOM updates
- [ ] Debounce user input
- [ ] Make parallel API calls when possible
- [ ] Minimize sheet API calls

## Testing
- [ ] Test all filter combinations
- [ ] Test with empty data
- [ ] Test with large datasets
- [ ] Test on mobile and desktop
- [ ] Test date edge cases
- [ ] Check console for errors
- [ ] Verify cache behavior

## Deployment
- [ ] Run setupConfig() manually
- [ ] Test all functions in editor
- [ ] Deploy as Web App
- [ ] Test deployed version
- [ ] Update README with live URL
- [ ] Create git tag for version
```

---

## 📚 Additional Resources

- **Apps Script Documentation**: https://developers.google.com/apps-script
- **Tailwind CSS**: https://tailwindcss.com/docs
- **JavaScript Date Handling**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- **Clasp CLI**: https://github.com/google/clasp

---

## 🙏 Acknowledgments

This best practices guide is based on real-world implementation of the **SimpelCatat** project, incorporating lessons learned from:
- Google Apps Script official documentation
- Community best practices
- Performance optimization techniques
- Mobile-first design principles

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Author:** Factory.ai Development Team

---

## License

This documentation is provided as-is for educational purposes. Feel free to use, modify, and distribute.
