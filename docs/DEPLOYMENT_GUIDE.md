# 🚀 Panduan Deployment ke GitHub Pages

## Langkah-langkah Deployment

### 1. Persiapan

#### A. Pastikan Semua File Sudah Lengkap

✅ **Icon** (WAJIB):
- [ ] Icon berbagai ukuran sudah ada di `src/public/icons/`
- [ ] Minimal: icon-192x192.png dan icon-512x512.png

✅ **Screenshots** (OPSIONAL tapi direkomendasikan):
- [ ] screenshot-1.png (mobile) di `src/public/screenshots/`
- [ ] screenshot-2.png (desktop) di `src/public/screenshots/`

✅ **Favicon**:
- [ ] favicon.png ada di `src/public/`

> **Catatan**: Jika belum punya icon/screenshots, lihat file `ICON_SCREENSHOTS_GUIDE.md`

#### B. Update STUDENT.txt
```
Nama: [Nama Lengkap Anda]
Email: [Email Anda]
ID Dicoding: [ID Dicoding Anda]

URL Deployment: [Akan diisi setelah deploy]
```

#### C. Test Lokal Dulu
```bash
npm install
npm run build
npm run preview
```

Buka http://localhost:4173 dan cek:
- ✓ Aplikasi berjalan normal
- ✓ Service Worker terdaftar (cek di DevTools > Application)
- ✓ Manifest tidak ada warning (cek di DevTools > Application > Manifest)
- ✓ Icon dan screenshots muncul

### 2. Setup Repository GitHub

#### A. Buat Repository Baru di GitHub
1. Buka https://github.com/new
2. Isi nama repository (contoh: `berbagi-story-pwa`)
3. Set visibility: **Public**
4. **JANGAN** centang "Add README"
5. Klik "Create repository"

#### B. Update vite.config.js

Buka `vite.config.js` dan update bagian `base`:

```javascript
// Jika repository bernama 'berbagi-story-pwa'
base: '/berbagi-story-pwa/',

// Atau biarkan default (akan auto-detect dari GitHub Actions)
base: process.env.GITHUB_REPOSITORY 
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/',
```

#### C. Push ke GitHub

```bash
# Inisialisasi git (jika belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit - PWA implementation"

# Add remote (ganti dengan URL repository Anda)
git remote add origin https://github.com/[username]/[repository-name].git

# Push ke main branch
git branch -M main
git push -u origin main
```

### 3. Aktifkan GitHub Pages

#### Opsi A: Otomatis via GitHub Actions (DIREKOMENDASIKAN)

1. **Aktifkan GitHub Pages**:
   - Buka repository di GitHub
   - Klik **Settings**
   - Klik **Pages** di sidebar kiri
   - Di bagian "Source":
     - Pilih: **GitHub Actions**

2. **Deploy Otomatis**:
   - GitHub Actions akan otomatis mendeteksi workflow
   - Buka tab **Actions** untuk lihat progress
   - Tunggu hingga workflow selesai (✓ hijau)
   - URL akan muncul di tab **Actions** atau **Settings > Pages**

3. **URL Deployment**:
   ```
   https://[username].github.io/[repository-name]/
   ```

#### Opsi B: Manual via gh-pages

```bash
# Install gh-pages
npm install -D gh-pages

# Update package.json, tambahkan script:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

Lalu di GitHub Settings > Pages, pilih source: **gh-pages branch**

### 4. Update STUDENT.txt

Setelah deployment berhasil, update `STUDENT.txt`:

```
Nama: John Doe
Email: john@example.com
ID Dicoding: johndoe123

URL Deployment: https://johndoe.github.io/berbagi-story-pwa/
```

Commit dan push perubahan:
```bash
git add STUDENT.txt
git commit -m "Update deployment URL"
git push
```

### 5. Verifikasi Deployment

Buka URL deployment dan cek:

#### ✅ PWA Checklist:
- [ ] Aplikasi dapat dibuka
- [ ] Install prompt muncul (di Chrome/Edge)
- [ ] Service Worker aktif (cek DevTools)
- [ ] Manifest tidak ada error
- [ ] Icon dan screenshots muncul dengan benar
- [ ] Push notification bisa diaktifkan
- [ ] Favorites/IndexedDB berfungsi
- [ ] Offline mode berfungsi (matikan internet, refresh)

#### Testing Offline:
1. Buka aplikasi di browser
2. Buka DevTools > Application > Service Workers
3. Centang "Offline"
4. Refresh halaman
5. Aplikasi harus tetap bisa diakses

#### Testing Install:
1. Buka di Chrome/Edge (desktop atau mobile)
2. Lihat icon "Install" di address bar atau banner di bawah
3. Klik install
4. Aplikasi akan terinstall di home screen/start menu

#### Testing Push Notification:
1. Buka halaman Settings
2. Toggle "Aktifkan Notifikasi Push"
3. Izinkan notifikasi
4. Klik "Coba Notifikasi"
5. Notifikasi harus muncul
6. Atau buat story baru untuk trigger notifikasi real

#### Testing Favorites/IndexedDB:
1. Buka halaman Stories
2. Klik icon heart pada story
3. Buka halaman Favorites
4. Story harus muncul
5. Coba search dan sort
6. Coba hapus favorite

### 6. Troubleshooting

#### ❌ Build Error saat Deploy

**Error**: `Cannot find module 'idb'`
```bash
# Pastikan dependencies terinstall
npm install
```

**Error**: `Failed to load module script`
```bash
# Cek base URL di vite.config.js
# Pastikan sesuai dengan nama repository
```

#### ❌ Halaman 404 setelah Deploy

**Solusi**:
1. Cek base URL di `vite.config.js`
2. Pastikan nama repository sama dengan base URL
3. Rebuild dan redeploy:
```bash
npm run build
git add dist -f
git commit -m "Update build"
git push
```

#### ❌ Service Worker Tidak Terdaftar

**Solusi**:
1. Pastikan mengakses via HTTPS (GitHub Pages otomatis HTTPS)
2. Clear cache browser (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)
4. Cek Console untuk error

#### ❌ Push Notification Tidak Berfungsi

**Solusi**:
1. Pastikan VAPID key sudah benar di `pushNotification.js`
2. Cek permission browser (harus "Allow")
3. Pastikan service worker aktif
4. Cek Console untuk error

#### ❌ Icon Tidak Muncul

**Solusi**:
1. Pastikan file icon ada di `src/public/icons/`
2. Cek path di `manifest.json`
3. Clear cache dan reload
4. Cek format file (harus PNG)

### 7. Custom Domain (Opsional)

Jika punya domain sendiri:

1. Buat file `CNAME` di folder `public`:
```
yourdomain.com
```

2. Update DNS di domain provider:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: CNAME
Name: www
Value: [username].github.io
```

3. Di GitHub Settings > Pages, isi Custom domain

### 8. Maintenance

#### Update Aplikasi:
```bash
# Edit code
# Test lokal
npm run dev

# Build dan test
npm run build
npm run preview

# Commit dan push (GitHub Actions akan auto-deploy)
git add .
git commit -m "Update feature XYZ"
git push
```

#### Monitoring:
- Cek tab **Actions** di GitHub untuk status deployment
- Cek **Insights > Traffic** untuk visitor stats

### 9. Submission ke Dicoding

Pastikan:
1. ✅ URL deployment sudah di STUDENT.txt
2. ✅ URL bisa diakses publik
3. ✅ Semua fitur PWA berfungsi
4. ✅ Tidak ada error di Console
5. ✅ Manifest tidak ada warning

### 10. Useful Links

- **Repository**: https://github.com/[username]/[repo-name]
- **Deployment**: https://[username].github.io/[repo-name]/
- **Actions**: https://github.com/[username]/[repo-name]/actions
- **PWA Checklist**: https://web.dev/pwa-checklist/

---

## 📝 Checklist Sebelum Submit

- [ ] Code sudah dipush ke GitHub
- [ ] GitHub Actions deployment sukses
- [ ] URL deployment bisa diakses
- [ ] STUDENT.txt sudah diupdate dengan URL
- [ ] PWA bisa diinstall
- [ ] Service Worker aktif
- [ ] Push notification berfungsi
- [ ] IndexedDB/Favorites berfungsi
- [ ] Offline mode berfungsi
- [ ] Tidak ada error di Console
- [ ] Manifest tidak ada warning
- [ ] Icon dan screenshots muncul

---

**Good luck dengan submission Anda! 🎉**
