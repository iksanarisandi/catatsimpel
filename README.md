# SimpelCatat 💰

Aplikasi pencatatan keuangan sederhana berbasis Google Apps Script dengan interface modern menggunakan Tailwind CSS.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Fitur

- 📊 **Ringkasan Keuangan Real-time**: Saldo, pemasukan, pengeluaran otomatis terhitung
- 📝 **Multi-Entry Form**: Input hingga 5 transaksi sekaligus
- 🔍 **Filter Fleksibel**: 
  - Hari ini (default)
  - Mingguan (Senin-Minggu)
  - Bulanan
  - Semua transaksi
  - Custom date range
- 📱 **Responsive Design**: Mobile-first, optimal di semua device
- 🎨 **Dark Theme UI**: Interface modern dengan Tailwind CSS
- ⚡ **Performance**: 
  - Cache system 2 menit
  - Optimized query dengan timezone handling
  - String-based date comparison untuk reliability
- 🌏 **Timezone**: Asia/Makassar (WITA)

## 🚀 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Google Apps Script (JavaScript runtime)
- **Storage**: Google Sheets
- **Deployment**: Google Apps Script Web App

## 📋 Struktur Data

### Sheet: Transaksi
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | String | UUID unik |
| createdAtISO | String | Timestamp ISO |
| tanggalISO | String | Tanggal transaksi (yyyy-MM-dd) |
| tipe | String | MASUK / KELUAR |
| nominal | Number | Jumlah uang |
| keterangan | String | Deskripsi transaksi |

## 🛠️ Setup & Installation

### Prerequisites
- Akun Google
- Google Clasp CLI (untuk development)

### 1. Setup Google Sheet
```
1. Buat Google Sheet baru
2. Copy ID sheet dari URL
3. Buka Apps Script Editor (Extensions > Apps Script)
4. Set Script Property:
   - Key: SIMPelCATAT_SPREADSHEET_ID
   - Value: [YOUR_SHEET_ID]
```

### 2. Clone Repository
```bash
git clone https://github.com/iksanarisandi/catatsimpel.git
cd catatsimpel
```

### 3. Install Clasp (jika belum)
```bash
npm install -g @google/clasp
clasp login
```

### 4. Setup Project
```bash
# Create .clasp.json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "."
}

# Push ke Apps Script
clasp push
```

### 5. Deploy Web App
```
1. Buka Apps Script Editor
2. Click "Deploy" > "New deployment"
3. Type: Web app
4. Execute as: Me
5. Who has access: Anyone
6. Click "Deploy"
7. Copy Web App URL
```

## 📖 API Documentation

### Backend Functions

#### `getTransactions(params)`
Mengambil transaksi berdasarkan date range dengan cache 2 menit.

**Parameters:**
```javascript
{
  startDateStr: "2025-10-01",  // yyyy-MM-dd
  endDateStr: "2025-10-31",    // yyyy-MM-dd
  tipe: "",                    // "MASUK" | "KELUAR" | ""
  search: ""                   // Search keyword
}
```

**Returns:**
```javascript
{
  status: "success",
  data: [...],              // Array of transactions
  message: "...",
  debug: {
    cacheHit: true/false,
    filterRange: {...},
    totalRows: 12,
    dateMatches: 12,
    finalResults: 12,
    timezone: "Asia/Makassar"
  }
}
```

#### `getSummary()`
Mengambil ringkasan keuangan dengan cache 1 menit.

**Returns:**
```javascript
{
  saldo: 13585000,
  masuk: 15030000,
  keluar: 1445000,
  count: 12
}
```

#### `addTransactions(list)`
Menyimpan batch transaksi sekaligus.

**Parameters:**
```javascript
[
  {
    tipe: "KELUAR",
    nominal: 50000,
    tanggalISO: "2025-10-18",
    keterangan: "Makan siang"
  },
  ...
]
```

## 🎯 Best Practices Implemented

### 1. **Simple Date Range Query**
✅ Frontend calculates date range  
✅ Backend hanya filter dengan string comparison  
✅ Separation of concerns yang jelas

### 2. **Caching Strategy**
✅ Transaction queries: 2 minutes TTL  
✅ Summary data: 1 minute TTL  
✅ Instant load pada repeat queries

### 3. **Timezone Handling**
✅ Explicit timezone: Asia/Makassar  
✅ Consistent date formatting  
✅ YMD string comparison untuk reliability

### 4. **Optimized Queries**
✅ Specific range instead of `getDataRange()`  
✅ Batch operations untuk write  
✅ Minimal API calls

### 5. **Mobile-First Design**
✅ Responsive breakpoints  
✅ Touch-friendly UI  
✅ Viewport optimization

## 🐛 Troubleshooting

### Transaksi tidak muncul dengan filter "Hari ini"
**Solusi:** Pastikan data di sheet menggunakan format Date yang benar atau string "yyyy-MM-dd"

### Error: "Spreadsheet ID belum diset"
**Solusi:** Set Script Property `SIMPelCATAT_SPREADSHEET_ID` di Apps Script

### Cache tidak clear setelah update
**Solusi:** Tunggu 2 menit atau refresh dengan Ctrl+Shift+R

## 📝 Changelog

### v2.0 (2025-10-18)
- ✅ Complete refactor dengan best practices
- ✅ Implement caching system
- ✅ Fix date comparison logic
- ✅ Add filter options (week, month, all, custom)
- ✅ Improve timezone handling
- ✅ Mobile-responsive layout
- ✅ Enhanced debug info

### v1.0 (Initial)
- Basic transaction recording
- Summary calculations
- Simple filters

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Iksan Arisandi**
- GitHub: [@iksanarisandi](https://github.com/iksanarisandi)

## 🙏 Acknowledgments

- Reference implementations from Google Apps Script best practices
- Tailwind CSS for the beautiful UI framework
- Factory.ai for development assistance

---

**Note:** Aplikasi ini menggunakan Google Apps Script sebagai backend. Pastikan Anda memiliki akses ke Google Sheet dan Apps Script untuk deployment.
