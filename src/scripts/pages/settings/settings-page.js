import Swal from 'sweetalert2';
import pushNotificationHelper from '../../utils/pushNotification.js';
import dbHelper from '../../utils/indexedDB.js';

const SettingsPage = {
  async render() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const isLoggedIn = !!token;
    
    return `
      <div class="settings-page">
        <div class="container">
          <div class="settings-header">
            <h1><i class="fas fa-cog"></i> Pengaturan</h1>
            <p class="subtitle">Kelola preferensi dan notifikasi aplikasi</p>
          </div>

          <div class="settings-content">
            <!-- Push Notification Settings -->
            <div class="settings-section">
              <h2><i class="fas fa-bell"></i> Notifikasi Push</h2>
              <p class="section-description">
                Terima notifikasi ketika ada cerita baru yang dibagikan
              </p>

              ${!isLoggedIn ? `
                <div class="alert alert-warning">
                  <i class="fas fa-exclamation-triangle"></i>
                  <div>
                    <strong>Login Diperlukan</strong>
                    <p>Anda harus login terlebih dahulu untuk mengaktifkan notifikasi push.</p>
                    <a href="#/login" class="btn btn-primary btn-sm">
                      <i class="fas fa-sign-in-alt"></i> Login Sekarang
                    </a>
                  </div>
                </div>
              ` : `
                <div class="alert alert-info">
                  <i class="fas fa-info-circle"></i>
                  <div>
                    <p><strong>Cara Kerja Push Notification:</strong></p>
                    <ol>
                      <li>Klik tombol "Subscribe" untuk mendaftar notifikasi</li>
                      <li>Izinkan notifikasi saat browser meminta</li>
                      <li>Tambahkan story baru untuk memicu notifikasi</li>
                      <li>Notifikasi akan muncul otomatis dari server</li>
                    </ol>
                  </div>
                </div>

                <div class="notification-controls">
                  <button id="subscribe-notification" class="btn btn-primary ${pushNotificationHelper.isSubscribed() ? 'hidden' : ''}">
                    <i class="fas fa-bell"></i> Subscribe Notifikasi
                  </button>
                  
                  <button id="unsubscribe-notification" class="btn btn-warning ${!pushNotificationHelper.isSubscribed() ? 'hidden' : ''}">
                    <i class="fas fa-bell-slash"></i> Unsubscribe Notifikasi
                  </button>

                  <button id="test-notification" class="btn btn-secondary ${!pushNotificationHelper.isSubscribed() ? 'disabled' : ''}" ${!pushNotificationHelper.isSubscribed() ? 'disabled' : ''}>
                    <i class="fas fa-vial"></i> Coba Notifikasi
                  </button>
                </div>

                <div id="notification-status" class="notification-status">
                  ${this.getNotificationStatusHTML()}
                </div>
              `}
            </div>

            <!-- Storage Info -->
            <div class="settings-section">
              <h2><i class="fas fa-database"></i> Penyimpanan</h2>
              <p class="section-description">
                Informasi tentang data yang tersimpan secara offline
              </p>

              <div id="storage-info" class="storage-info">
                <div class="spinner"></div>
                <p>Memuat informasi penyimpanan...</p>
              </div>

              <button id="clear-cache" class="btn btn-warning">
                <i class="fas fa-broom"></i> Bersihkan Cache
              </button>
            </div>

            <!-- App Info -->
            <div class="settings-section">
              <h2><i class="fas fa-info-circle"></i> Informasi Aplikasi</h2>
              
              <div class="app-info">
                <div class="info-item">
                  <i class="fas fa-check-circle"></i>
                  <div>
                    <strong>Status PWA</strong>
                    <span id="pwa-status">Terinstal</span>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fas fa-wifi"></i>
                  <div>
                    <strong>Status Koneksi</strong>
                    <span id="connection-status">${navigator.onLine ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fas fa-mobile-alt"></i>
                  <div>
                    <strong>Versi</strong>
                    <span>1.0.0</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- About -->
            <div class="settings-section">
              <h2><i class="fas fa-heart"></i> Tentang</h2>
              <p>
                <strong>Berbagi Story</strong> adalah aplikasi Progressive Web App 
                untuk berbagi cerita dengan lokasi. Dikembangkan sebagai bagian dari 
                submission Dicoding Academy.
              </p>
              <div class="about-links">
                <a href="#/about" class="btn btn-link">
                  <i class="fas fa-info"></i> Selengkapnya
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.loadStorageInfo();
    this.initializeEventListeners();
    this.updateConnectionStatus();

    // Listen for online/offline events
    window.addEventListener('online', () => this.updateConnectionStatus());
    window.addEventListener('offline', () => this.updateConnectionStatus());
  },

  getNotificationStatusHTML() {
    const state = pushNotificationHelper.getSubscriptionState();
    
    if (!state.isSupported) {
      return `
        <div class="status-badge status-error">
          <i class="fas fa-times-circle"></i>
          Notifikasi push tidak didukung di browser ini
        </div>
      `;
    }

    if (state.permission === 'denied') {
      return `
        <div class="status-badge status-error">
          <i class="fas fa-ban"></i>
          Notifikasi diblokir. Aktifkan di pengaturan browser.
        </div>
      `;
    }

    if (state.isSubscribed) {
      return `
        <div class="status-badge status-success">
          <i class="fas fa-check-circle"></i>
          Notifikasi push aktif
        </div>
      `;
    }

    return `
      <div class="status-badge status-warning">
        <i class="fas fa-exclamation-circle"></i>
        Notifikasi push nonaktif
      </div>
    `;
  },

  async loadStorageInfo() {
    const storageInfoContainer = document.getElementById('storage-info');
    
    try {
      const info = await dbHelper.getStorageInfo();
      
      // Get cache storage estimate if available
      let cacheSize = 'N/A';
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
        const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
        cacheSize = `${usedMB} MB / ${quotaMB} MB`;
      }

      storageInfoContainer.innerHTML = `
        <div class="storage-stats">
          <div class="stat-card">
            <i class="fas fa-heart"></i>
            <div>
              <h3>${info.totalFavorites}</h3>
              <p>Cerita Favorit</p>
            </div>
          </div>

          <div class="stat-card">
            <i class="fas fa-clock"></i>
            <div>
              <h3>${info.totalOfflineStories}</h3>
              <p>Cerita Offline</p>
            </div>
          </div>

          <div class="stat-card">
            <i class="fas fa-hdd"></i>
            <div>
              <h3>${cacheSize}</h3>
              <p>Penggunaan Cache</p>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading storage info:', error);
      storageInfoContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          Gagal memuat informasi penyimpanan
        </div>
      `;
    }
  },

  updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      if (navigator.onLine) {
        statusElement.textContent = 'Online';
        statusElement.className = 'status-online';
      } else {
        statusElement.textContent = 'Offline';
        statusElement.className = 'status-offline';
      }
    }
  },

  initializeEventListeners() {
    // Subscribe button
    const subscribeButton = document.getElementById('subscribe-notification');
    if (subscribeButton) {
      subscribeButton.addEventListener('click', async () => {
        await this.enablePushNotifications();
      });
    }

    // Unsubscribe button
    const unsubscribeButton = document.getElementById('unsubscribe-notification');
    if (unsubscribeButton) {
      unsubscribeButton.addEventListener('click', async () => {
        await this.disablePushNotifications();
      });
    }

    // Test notification button
    const testButton = document.getElementById('test-notification');
    if (testButton) {
      testButton.addEventListener('click', async () => {
        await this.sendTestNotification();
      });
    }

    // Clear cache button
    const clearCacheButton = document.getElementById('clear-cache');
    if (clearCacheButton) {
      clearCacheButton.addEventListener('click', async () => {
        await this.clearCache();
      });
    }
  },

  async enablePushNotifications() {
    try {
      const loadingSwal = Swal.fire({
        title: 'Subscribing...',
        text: 'Mohon tunggu, mendaftarkan notifikasi push',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      await pushNotificationHelper.subscribe();

      loadingSwal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Subscribe!',
        html: `
          <p>Notifikasi push telah diaktifkan.</p>
          <p><strong>Cara Test:</strong></p>
          <ol style="text-align: left;">
            <li>Tambahkan story baru di menu "Tambah Story"</li>
            <li>Notifikasi akan muncul otomatis dari server</li>
          </ol>
        `,
        confirmButtonColor: '#007bff'
      });

      // Update UI
      const subscribeBtn = document.getElementById('subscribe-notification');
      const unsubscribeBtn = document.getElementById('unsubscribe-notification');
      const testBtn = document.getElementById('test-notification');
      
      if (subscribeBtn) subscribeBtn.classList.add('hidden');
      if (unsubscribeBtn) unsubscribeBtn.classList.remove('hidden');
      if (testBtn) testBtn.disabled = false;

      // Update status display
      const statusContainer = document.getElementById('notification-status');
      if (statusContainer) {
        statusContainer.innerHTML = this.getNotificationStatusHTML();
      }

    } catch (error) {
      console.error('Error enabling push notifications:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal Subscribe',
        text: error.message || 'Gagal mengaktifkan notifikasi push',
        confirmButtonColor: '#007bff'
      });

      throw error;
    }
  },

  async disablePushNotifications() {
    try {
      const result = await Swal.fire({
        title: 'Unsubscribe Notifikasi?',
        text: 'Anda tidak akan menerima notifikasi push lagi',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-bell-slash"></i> Ya, Unsubscribe',
        cancelButtonText: '<i class="fas fa-times"></i> Batal'
      });

      if (!result.isConfirmed) return;

      await pushNotificationHelper.unsubscribe();

      await Swal.fire({
        icon: 'info',
        title: 'Berhasil Unsubscribe',
        text: 'Notifikasi push telah dinonaktifkan',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // Update UI
      const subscribeBtn = document.getElementById('subscribe-notification');
      const unsubscribeBtn = document.getElementById('unsubscribe-notification');
      const testBtn = document.getElementById('test-notification');
      
      if (subscribeBtn) subscribeBtn.classList.remove('hidden');
      if (unsubscribeBtn) unsubscribeBtn.classList.add('hidden');
      if (testBtn) testBtn.disabled = true;

      // Update status display
      const statusContainer = document.getElementById('notification-status');
      if (statusContainer) {
        statusContainer.innerHTML = this.getNotificationStatusHTML();
      }

    } catch (error) {
      console.error('Error disabling push notifications:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal unsubscribe notifikasi',
        confirmButtonColor: '#007bff'
      });
      throw error;
    }
  },

  async sendTestNotification() {
    try {
      await pushNotificationHelper.sendTestNotification();
      
      Swal.fire({
        icon: 'success',
        title: 'Notifikasi Terkirim',
        text: 'Cek notifikasi Anda!',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengirim notifikasi percobaan',
        confirmButtonColor: '#007bff'
      });
    }
  },

  async clearCache() {
    const result = await Swal.fire({
      title: 'Bersihkan Cache?',
      text: 'Data cache akan dihapus. Aplikasi akan memuat ulang data dari server.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-broom"></i> Ya, Bersihkan',
      cancelButtonText: '<i class="fas fa-times"></i> Batal'
    });

    if (result.isConfirmed) {
      try {
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Cache telah dibersihkan. Halaman akan dimuat ulang.',
          timer: 2000,
          showConfirmButton: false
        });

        // Reload page
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error) {
        console.error('Error clearing cache:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal membersihkan cache',
          confirmButtonColor: '#007bff'
        });
      }
    }
  }
};

export default SettingsPage;
