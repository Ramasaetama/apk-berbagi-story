# 🔐 Cara Login dan Upload Cerita

## Problem: "Missing Authentication"

Error ini muncul karena Anda belum login. Aplikasi sekarang memerlukan autentikasi untuk upload cerita.

---

## 📝 Langkah-langkah:

### 1. Register Akun (Jika Belum Punya)

1. **Buka halaman Register:**
   - Klik menu **"Masuk"** di navigation
   - Klik **"Daftar di sini"**

2. **Isi form registrasi:**
   ```
   Nama: [Nama Anda]
   Email: [Email valid]
   Password: [Min 8 karakter]
   ```

3. **Klik "Daftar"**
   - Tunggu hingga muncul notifikasi sukses
   - Anda akan otomatis diarahkan ke halaman login

### 2. Login ke Aplikasi

1. **Buka halaman Login:**
   - Klik menu **"Masuk"**

2. **Isi form login:**
   ```
   Email: [Email yang sudah didaftar]
   Password: [Password Anda]
   ```

3. **Klik "Masuk"**
   - Token akan disimpan di localStorage
   - Menu akan berubah menjadi **"Keluar"**

### 3. Upload Cerita

Setelah login berhasil:

1. **Klik menu "Tambah Story"**
2. **Isi form:**
   - Deskripsi cerita (required)
   - Upload foto (required)
   - Pilih lokasi di map (optional)
3. **Klik "Kirim Cerita"**

---

## ✅ Cara Cek Status Login

Buka **DevTools** (F12) → **Console**, ketik:

```javascript
localStorage.getItem('auth_token')
```

Jika ada token (string panjang) = ✅ **Sudah login**  
Jika `null` = ❌ **Belum login**

---

## 🔓 Logout

1. Klik menu **"Keluar"**
2. Token akan dihapus dari localStorage
3. Anda akan diarahkan ke halaman login

---

## 🐛 Troubleshooting

### Error: "Missing authentication" padahal sudah login

**Solusi:**
1. Buka DevTools (F12) → Console
2. Cek token: `localStorage.getItem('auth_token')`
3. Jika null, login ulang
4. Jika ada token tapi masih error:
   ```javascript
   // Clear storage dan login ulang
   localStorage.clear();
   location.reload();
   ```

### Error: "Invalid token" atau "Token expired"

**Solusi:**
1. Logout
2. Login ulang dengan email & password yang benar

### Tidak bisa register

**Kemungkinan:**
- Email sudah terdaftar → Gunakan email lain
- Password kurang dari 8 karakter → Gunakan password lebih panjang
- Email tidak valid → Gunakan format email yang benar

---

## 📋 Test Credentials (Untuk Testing)

Jika Dicoding Story API menyediakan test account:

```
Email: test@example.com
Password: test123456
```

*(Cek dokumentasi API untuk test credentials yang valid)*

---

## 🔒 Keamanan

- ✅ Token disimpan di **localStorage** (aman di client-side)
- ✅ Token dikirim di header **Authorization: Bearer [token]**
- ✅ Halaman "Tambah Story" dilindungi (perlu login)
- ✅ Logout menghapus token dari localStorage

---

## 🎯 Fitur Setelah Login

Setelah login berhasil, Anda bisa:

1. ✅ Upload cerita dengan foto
2. ✅ Tambah lokasi di map
3. ✅ Lihat semua stories
4. ✅ Favorite stories (disimpan lokal)
5. ✅ Akses offline mode (PWA)
6. ✅ Receive push notifications

---

## 📞 Butuh Bantuan?

Jika masih ada error:
1. Buka DevTools → Console → Lihat error detail
2. Screenshot error dan URL API yang dipanggil
3. Cek dokumentasi Dicoding Story API: https://story-api.dicoding.dev/v1
