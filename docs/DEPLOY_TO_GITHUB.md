# 🚀 Cara Deploy ke GitHub Pages

## Langkah 1: Persiapan Repository

### A. Buat Repository Baru di GitHub

1. **Buka** https://github.com/new
2. **Isi form:**
   - Repository name: `berbagi-story` (atau nama lain)
   - Description: `PWA Berbagi Story - Dicoding Submission`
   - Public ✅ (harus public untuk GitHub Pages gratis)
   - **JANGAN** centang "Initialize with README"
3. **Klik** "Create repository"

### B. Update Base Path (PENTING!)

Setelah tahu nama repo, update file `vite.config.js`:

```javascript
base: process.env.NODE_ENV === 'production' 
  ? '/nama-repo-anda/'  // ⚠️ GANTI dengan nama repo Anda!
  : './',
```

**Contoh:**
- Jika repo: `berbagi-story` → `base: '/berbagi-story/'`
- Jika repo: `story-app` → `base: '/story-app/'`

## Langkah 2: Push ke GitHub

Buka terminal/PowerShell di folder project, jalankan:

```powershell
# Initialize git (jika belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit: PWA Berbagi Story"

# Rename branch ke main (jika masih master)
git branch -M main

# Add remote (GANTI dengan URL repo Anda!)
git remote add origin https://github.com/username-anda/nama-repo-anda.git

# Push
git push -u origin main
```

**Contoh lengkap:**
```powershell
git init
git add .
git commit -m "Initial commit: PWA Berbagi Story"
git branch -M main
git remote add origin https://github.com/johndoe/berbagi-story.git
git push -u origin main
```

## Langkah 3: Enable GitHub Pages

1. **Buka repository** di GitHub
2. **Klik tab** "Settings"
3. **Scroll ke** "Pages" (menu kiri)
4. **Di "Source":**
   - Pilih: **GitHub Actions**
5. **Klik** "Save"

## Langkah 4: Tunggu Deployment

1. **Klik tab** "Actions"
2. Lihat workflow **"Deploy to GitHub Pages"** sedang berjalan
3. Tunggu hingga ✅ **hijau** (sekitar 1-2 menit)
4. Jika ada ❌ **error**, klik untuk lihat log

## Langkah 5: Akses Website

Website Anda akan tersedia di:

```
https://username-anda.github.io/nama-repo-anda/
```

**Contoh:**
- Username: `johndoe`, Repo: `berbagi-story`
- URL: `https://johndoe.github.io/berbagi-story/`

## Langkah 6: Update STUDENT.txt

Edit file `STUDENT.txt` dan isi dengan URL deployment:

```
Nama: Nama Lengkap Anda
URL: https://username-anda.github.io/nama-repo-anda/
```

## 🔄 Update Aplikasi (Setelah Deploy Pertama)

Setiap kali ada perubahan:

```powershell
# Build lokal untuk test
npm run build
npm run preview

# Jika sudah ok, push ke GitHub
git add .
git commit -m "Update: deskripsi perubahan"
git push

# GitHub Actions akan otomatis deploy!
```

## ✅ Checklist Sebelum Submit

- [ ] Repository public
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Build berhasil (Actions tab hijau)
- [ ] Website bisa diakses
- [ ] PWA bisa diinstall
- [ ] Service Worker berjalan
- [ ] Push notification berfungsi
- [ ] IndexedDB berfungsi (favorites)
- [ ] Offline mode berfungsi
- [ ] STUDENT.txt sudah diupdate dengan URL
- [ ] Manifest tidak ada error

## 🐛 Troubleshooting

### Error: "Page not found"
- ✅ Cek `base` di `vite.config.js` sudah benar
- ✅ Rebuild: `npm run build && git push`

### Error: "Assets tidak load (404)"
- ✅ Cek `base` path harus pakai trailing slash: `/repo-name/`
- ✅ Rebuild dan push lagi

### Workflow tidak jalan
- ✅ Pastikan file `.github/workflows/deploy.yml` ada
- ✅ Pastikan branch name benar (main/master)
- ✅ Cek Actions tab untuk error log

### Service Worker tidak register
- ✅ GitHub Pages harus HTTPS ✅ (otomatis)
- ✅ Cek DevTools → Application → Service Workers
- ✅ Hard refresh: Ctrl+Shift+R

## 📝 Catatan Penting

1. **First deployment** bisa butuh 5-10 menit
2. **Updates** biasanya 1-2 menit
3. **Cache browser** bisa bikin perubahan tidak terlihat → hard refresh!
4. **Service Worker** bisa cache versi lama → unregister di DevTools jika perlu
5. **GitHub Pages** hanya support static files (no server-side)

## 🎉 Selamat!

Website PWA Anda sudah live di internet! 🚀
