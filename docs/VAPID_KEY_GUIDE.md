# 🔑 VAPID Key Configuration

## ⚠️ PENTING: Update VAPID Public Key

Push notification memerlukan VAPID public key dari Dicoding Story API.

## 📍 Lokasi File yang Perlu Diupdate

**File**: `src/scripts/utils/pushNotification.js`  
**Line**: 57-58

```javascript
// Line 57 di pushNotification.js
async getVapidPublicKey() {
  try {
    // ... kode lain ...
    
    // GANTI KEY INI dengan key dari API Dicoding
    return 'BL4vlMg7cgX4kwjkILQZEeCl7FPqLDL7c4i5kfQ5LkVwCCCTLcSCKfmXKvVkTJrQhQXz9UJ0KqF8NN8lFuUJwNI';
    //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //     GANTI DENGAN VAPID PUBLIC KEY YANG BENAR DARI DOKUMENTASI API
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    throw error;
  }
}
```

## 📖 Cara Mendapatkan VAPID Key

### Opsi 1: Dari Dokumentasi API Dicoding Story

1. Buka dokumentasi REST API: https://story-api.dicoding.dev/v1/
2. Cari section "Push Notification" atau "Web Push"
3. Copy VAPID public key yang tersedia
4. Paste ke file `pushNotification.js` line 57

### Opsi 2: Dari API Endpoint (Jika Tersedia)

Beberapa API menyediakan endpoint untuk mendapatkan VAPID key:

```javascript
// Contoh request (jika endpoint tersedia)
GET https://story-api.dicoding.dev/v1/push/vapid
Authorization: Bearer YOUR_TOKEN

// Response
{
  "error": false,
  "message": "VAPID key retrieved",
  "publicKey": "BL4v..."
}
```

### Opsi 3: Tanya Mentor/Forum Dicoding

Jika tidak menemukan di dokumentasi, tanya di forum Dicoding atau mentor.

## ✅ Verifikasi Key Sudah Benar

Setelah update VAPID key, test:

1. Build & preview:
```bash
npm run build
npm run preview
```

2. Buka http://localhost:4173

3. Buka halaman **Settings**

4. Toggle "Aktifkan Notifikasi Push"

5. Jika berhasil:
   - ✓ Muncul permission request dari browser
   - ✓ Status berubah jadi "Notifikasi push aktif"
   - ✓ Button "Coba Notifikasi" bisa diklik
   - ✓ Tidak ada error di Console

6. Jika gagal:
   - ✗ Error di Console tentang "invalid VAPID key" atau "subscription failed"
   - ✗ Key kemungkinan salah atau format tidak sesuai

## 🔍 Format VAPID Key

VAPID public key biasanya:
- String panjang (88 karakter)
- Base64 URL-safe format
- Dimulai dengan huruf (contoh: `BL4v...`, `BCq7...`, dll)
- Tidak mengandung `+`, `/`, atau `=` (diganti `-`, `_`)

**Contoh format yang BENAR**:
```
BL4vlMg7cgX4kwjkILQZEeCl7FPqLDL7c4i5kfQ5LkVwCCCTLcSCKfmXKvVkTJrQhQXz9UJ0KqF8NN8lFuUJwNI
```

**Format yang SALAH**:
```
BL4vlMg7cgX4kwjkILQZEeCl7FPqLDL7c4i5kfQ5LkVwCCCTLcSCKfmXKvVkTJrQhQXz9UJ0KqF8NN8lFuUJwNI=
                                                                                    ^
                                                                              Ada '=' di akhir
```

## 🚨 Troubleshooting

### Error: "Failed to subscribe to push notifications"

**Penyebab**: VAPID key salah atau tidak valid

**Solusi**:
1. Cek key dari dokumentasi API lagi
2. Pastikan tidak ada spasi atau karakter tambahan
3. Pastikan format base64 URL-safe
4. Copy-paste ulang dengan hati-hati

### Error: "Push subscription failed: invalid public key"

**Penyebab**: Format key tidak sesuai

**Solusi**:
1. Hapus karakter `+`, `/`, `=` jika ada
2. Ganti dengan format URL-safe: `-`, `_`
3. Atau download library `web-push` dan generate sendiri (advanced)

### Push notification tidak muncul setelah subscribe

**Penyebab**: Key benar tapi backend tidak mengirim notifikasi

**Solusi**:
1. Cek apakah server API Dicoding support push untuk akun Anda
2. Test dengan membuat story baru (trigger notifikasi)
3. Cek Console untuk error response dari API

## 📝 Catatan

- **Tanpa VAPID key yang benar**, push notification tidak akan berfungsi
- Tapi aplikasi tetap akan berfungsi untuk fitur lainnya:
  - ✓ Install PWA
  - ✓ Offline mode
  - ✓ IndexedDB/Favorites
  
- Untuk submission Dicoding, push notification WAJIB berfungsi untuk mendapat nilai penuh

## 🎯 Setelah Update VAPID Key

1. ✅ Update file `pushNotification.js`
2. ✅ Rebuild: `npm run build`
3. ✅ Test lokal: `npm run preview`
4. ✅ Verifikasi push notification berfungsi
5. ✅ Commit & push ke GitHub
6. ✅ Deploy

## 📞 Kontak

Jika masih bermasalah dengan VAPID key:
1. Cek forum diskusi Dicoding
2. Tanya di Discord/Slack Dicoding Academy
3. Email ke support Dicoding

---

**PENTING**: Jangan lupa update key ini sebelum deployment! ⚠️
