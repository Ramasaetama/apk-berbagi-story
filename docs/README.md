# Berbagi Story - Progressive Web App

Aplikasi berbagi cerita dengan lokasi menggunakan teknologi Progressive Web App (PWA).

## Fitur-Fitur PWA

### ✅ Kriteria 1: Push Notification (Advanced - 4 pts)
- ✓ Notifikasi push dasar dari server
- ✓ Notifikasi dinamis dengan data dari API
- ✓ Toggle button untuk enable/disable notifikasi
- ✓ Action button untuk navigasi ke halaman detail

### ✅ Kriteria 2: PWA dengan Instalasi & Offline (Advanced - 4 pts)
- ✓ Aplikasi dapat diinstall (installable)
- ✓ Dapat diakses offline dengan app shell
- ✓ Screenshots dan shortcuts di Web App Manifest
- ✓ No warnings di Chrome DevTools Manifest
- ✓ Cache data dinamis dengan strategi caching yang sesuai
- ✓ Konten API tetap dapat diakses saat offline

### ✅ Kriteria 3: IndexedDB (Advanced - 4 pts)
- ✓ Fitur Favorit dengan CRUD operations
- ✓ Search dan sorting functionality
- ✓ Background sync untuk data offline

### ✅ Kriteria 4: Deployment
- ✓ Dideploy ke GitHub Pages
- ✓ URL tercantum di STUDENT.txt

## Teknologi yang Digunakan

- **Vite** - Build tool
- **Vanilla JavaScript** - Framework
- **IndexedDB (via idb)** - Local database
- **Service Worker** - Offline & caching
- **Push API** - Push notifications
- **Web App Manifest** - PWA configuration
- **Leaflet** - Maps
- **SweetAlert2** - UI notifications

## Instalasi

1. Clone repository:
```bash
git clone [repository-url]
cd starter-project-with-vite
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Build untuk production:
```bash
npm run build
```

5. Preview build:
```bash
npm run preview
```

## Deployment ke GitHub Pages

### Cara 1: Manual Deployment

1. Update `vite.config.js` dengan base URL yang benar:
```javascript
export default defineConfig({
  base: '/[repository-name]/',
  // ... config lainnya
});
```

2. Build project:
```bash
npm run build
```

3. Deploy folder `dist` ke GitHub Pages:
```bash
# Install gh-pages jika belum
npm install -g gh-pages

# Deploy
gh-pages -d dist
```

### Cara 2: GitHub Actions (Otomatis)

1. Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

2. Push ke GitHub:
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

3. Aktifkan GitHub Pages di Settings:
   - Buka repository di GitHub
   - Settings > Pages
   - Source: GitHub Actions

4. Update `STUDENT.txt` dengan URL deployment

## Cara Menggunakan Fitur PWA

### Install Aplikasi
1. Buka aplikasi di browser (Chrome/Edge)
2. Klik tombol "Install" yang muncul di banner
3. Atau klik icon install di address bar
4. Aplikasi akan terinstall di home screen

### Push Notification
1. Buka halaman "Pengaturan"
2. Toggle switch "Aktifkan Notifikasi Push"
3. Izinkan notifikasi saat diminta browser
4. Buat cerita baru untuk memicu notifikasi
5. Klik "Coba Notifikasi" untuk test

### Favorites (IndexedDB)
1. Buka halaman "Story"
2. Klik icon heart pada cerita untuk menambah ke favorit
3. Buka halaman "Favorit" untuk melihat daftar
4. Gunakan search untuk mencari cerita
5. Gunakan sort untuk mengurutkan
6. Klik "Hapus" untuk menghapus dari favorit

### Offline Mode
1. Matikan koneksi internet
2. Aplikasi tetap dapat diakses
3. Data cerita yang sudah di-cache tetap tampil
4. Cerita favorit dapat diakses sepenuhnya

## Struktur Project

```
src/
├── index.html
├── public/
│   ├── sw.js (Service Worker)
│   ├── manifest.json (Web App Manifest)
│   ├── icons/ (App Icons)
│   └── screenshots/ (App Screenshots)
├── scripts/
│   ├── index.js (Entry point)
│   ├── config.js (Configuration)
│   ├── utils/
│   │   ├── indexedDB.js (IndexedDB helper)
│   │   └── pushNotification.js (Push notification helper)
│   ├── pages/
│   │   ├── favorites/ (Favorites page)
│   │   └── settings/ (Settings page)
│   └── ...
└── styles/
    └── styles.css
```

## Browser Support

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

## Catatan Penting

1. **VAPID Key**: Pastikan menggunakan VAPID public key yang benar dari Dicoding Story API
2. **HTTPS**: PWA memerlukan HTTPS untuk service worker (GitHub Pages otomatis HTTPS)
3. **Icons**: Siapkan icon dengan berbagai ukuran (72x72 sampai 512x512)
4. **Screenshots**: Tambahkan screenshot aplikasi untuk Web App Manifest

## Troubleshooting

### Service Worker tidak terdaftar
- Pastikan mengakses via HTTPS atau localhost
- Cek Console untuk error
- Clear browser cache dan reload

### Push Notification tidak muncul
- Cek permission notifikasi di browser settings
- Pastikan VAPID key sudah benar
- Cek service worker sudah active

### IndexedDB error
- Clear browser data dan reload
- Cek Console untuk error detail
- Pastikan browser support IndexedDB

## License

MIT License - Dicoding Academy Submission

## Author

[Nama Anda] - [Email Anda]
