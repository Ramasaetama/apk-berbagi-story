# 🎯 QUICK START - Deploy ke GitHub Pages

## Option 1: Menggunakan Script Otomatis (RECOMMENDED)

```powershell
# Jalankan script helper
.\deploy-setup.bat
```

Script akan memandu Anda step-by-step!

---

## Option 2: Manual Commands

### Step 1: Create GitHub Repository
- Buka: https://github.com/new
- Nama: `berbagi-story` (atau nama lain)
- **Public** ✅
- Create repository

### Step 2: Update vite.config.js

Ganti baris ini:
```javascript
base: process.env.NODE_ENV === 'production' 
  ? './'  // Change this to '/nama-repo-anda/'
  : './',
```

Menjadi:
```javascript
base: process.env.NODE_ENV === 'production' 
  ? '/berbagi-story/'  // ⚠️ GANTI dengan nama repo Anda!
  : './',
```

### Step 3: Push ke GitHub

```powershell
git init
git add .
git commit -m "Initial commit: PWA Berbagi Story"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

⚠️ **GANTI** `USERNAME` dan `REPO-NAME` dengan milik Anda!

### Step 4: Enable GitHub Pages

1. Repository → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

### Step 5: Tunggu Deployment

- Tab **Actions** → Lihat workflow berjalan
- Tunggu hingga ✅ hijau (~2 menit)

### Step 6: Akses Website

```
https://USERNAME.github.io/REPO-NAME/
```

### Step 7: Update STUDENT.txt

```
Nama: Nama Lengkap Anda
URL: https://USERNAME.github.io/REPO-NAME/
```

---

## 🔄 Update Setelah Deploy

```powershell
npm run build           # Test lokal
git add .
git commit -m "Update: deskripsi perubahan"
git push                # Otomatis deploy!
```

---

## ✅ Checklist

- [ ] Repository created (PUBLIC)
- [ ] `base` di vite.config.js sudah update
- [ ] Code di-push ke GitHub
- [ ] GitHub Pages enabled (Actions)
- [ ] Workflow ✅ hijau
- [ ] Website bisa diakses
- [ ] PWA bisa diinstall
- [ ] STUDENT.txt updated

---

## 📞 Butuh Bantuan?

Lihat file lengkap: **DEPLOY_TO_GITHUB.md**
