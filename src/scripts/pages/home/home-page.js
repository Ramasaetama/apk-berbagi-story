export default class HomePage {
  async render() {
    return `
      <section class="container home-section">
        <header class="home-header">
          <h1>Selamat Datang di Aplikasi Berbagi Story</h1>
          <p class="home-subtitle">bagikan cerita dimanapun anda berada</p>
        </header>

        <div class="home-features">
          <div class="feature-card">
            <div class="feature-icon">📍</div>
            <h2>Cerita dengan Lokasi</h2>
            <p>Lihat cerita-cerita menarik yang tersebar di berbagai lokasi di peta interaktif</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📸</div>
            <h2>Bagikan Cerita Anda</h2>
            <p>Tambahkan cerita baru dengan foto dan pilih lokasi di peta</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🗺️</div>
            <h2>Peta Interaktif</h2>
            <p>Jelajahi cerita berdasarkan lokasi geografis pada peta digital</p>
          </div>
        </div>

        <div class="home-actions">
          <a href="#/stories" class="btn-primary" aria-label="Lihat semua cerita">
            Lihat Semua Cerita
          </a>
          <a href="#/add-story" class="btn-secondary" aria-label="Tambah cerita baru">
            Tambah Cerita Baru
          </a>
        </div>

        <section class="home-about">
          <h2>Tentang Aplikasi</h2>
          <p>
            Aplikasi Berbagi Cerita adalah platform untuk berbagi cerita dimanapun anda berada
          </p>
        </section>

        <section class="home-auth-info" id="auth-info-section">
          <h2>Status Autentikasi</h2>
          <div id="auth-status"></div>
        </section>
      </section>
    `;
  }

  async afterRender() {
    const skipContent = document.querySelector('.skip-to-content');
    if (skipContent) {
      skipContent.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.home-header').focus();
      });
    }

    // Display auth status
    this.displayAuthStatus();
  }

  displayAuthStatus() {
    const authStatus = document.getElementById('auth-status');
    const token = localStorage.getItem('auth_token');
    const userName = localStorage.getItem('user_name');

    if (token) {
      authStatus.innerHTML = `
        <div class="auth-success">
          <p>✅ <strong>Anda sudah login</strong></p>
          <p>👤 Nama: ${userName || 'User'}</p>
          <p>🔑 Token tersimpan di localStorage</p>
        </div>
      `;
    } else {
      authStatus.innerHTML = `
        <div class="auth-not-logged">
          <p>❌ <strong>Belum login</strong></p>
          <p>Silakan <a href="#/login">login</a> untuk dapat menambahkan story</p>
        </div>
      `;
    }
  }
}
