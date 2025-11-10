export default class AboutPage {
  async render() {
    return `
      <section class="container about-section">
        <header class="about-header">
          <h1>Tentang Aplikasi Berbagi Cerita</h1>
        </header>

        <article class="about-content">
          <h2>Aplikasi Apa Ini?</h2>
          <p>
            Aplikasi Berbagi Cerita adalah platform interaktif untuk berbagi pengalaman dan cerita 
            bersama komunitas Dicoding. Aplikasi ini memungkinkan pengguna untuk melihat cerita dari 
            berbagai lokasi di seluruh dunia dan menambahkan cerita mereka sendiri dengan foto dan lokasi geografis.
          </p>

          <h2>Fitur Utama</h2>
          <ul class="feature-list">
            <li><strong>Peta Interaktif:</strong> Jelajahi cerita berdasarkan lokasi geografis pada peta digital dengan marker dan popup</li>
            <li><strong>Berbagi Cerita:</strong> Tambahkan cerita baru dengan foto dan pilih lokasi di peta</li>
            <li><strong>Ambil Foto dari Kamera:</strong> Gunakan kamera langsung untuk menangkap momen spesial</li>
            <li><strong>Aksesibilitas:</strong> Dirancang dengan mempertimbangkan aksesibilitas untuk semua pengguna</li>
            <li><strong>Responsif:</strong> Dapat diakses dengan baik di berbagai ukuran layar (mobile, tablet, desktop)</li>
          </ul>

          <h2>Teknologi yang Digunakan</h2>
          <ul class="tech-list">
            <li>JavaScript ES6+ dengan Vite sebagai build tool</li>
            <li>Single-Page Application (SPA) dengan Hash Routing</li>
            <li>Leaflet untuk visualisasi peta digital</li>
            <li>Dicoding Story API untuk backend</li>
            <li>CSS3 untuk styling responsif</li>
          </ul>

          <h2>Cara Menggunakan</h2>
          <ol class="usage-list">
            <li>Pada halaman beranda, klik "Lihat Semua Cerita" untuk melihat cerita-cerita yang ada</li>
            <li>Klik "Tambah Cerita Baru" untuk menambahkan cerita Anda</li>
            <li>Isi deskripsi cerita, unggah foto, dan klik pada peta untuk memilih lokasi</li>
            <li>Atau gunakan tombol "Ambil Foto dari Kamera" untuk mengambil foto langsung</li>
            <li>Klik "Kirim Cerita" untuk mempublikasikan cerita Anda</li>
          </ol>

          <div class="about-footer">
            <p>
              <strong>API Endpoint:</strong> <a href="https://story-api.dicoding.dev/v1" target="_blank" rel="noopener noreferrer">
                https://story-api.dicoding.dev/v1
              </a>
            </p>
          </div>
        </article>
      </section>
    `;
  }

  async afterRender() {
    // Add any additional functionality here if needed
  }
}
