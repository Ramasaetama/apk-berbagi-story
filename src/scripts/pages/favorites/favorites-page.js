import Swal from 'sweetalert2';
import dbHelper from '../../utils/indexedDB.js';

const FavoritesPage = {
  async render() {
    return `
      <div class="favorites-page">
        <div class="container">
          <div class="favorites-header">
            <h1><i class="fas fa-heart"></i> Cerita Favorit</h1>
            <p class="subtitle">Kelola cerita favorit Anda yang tersimpan secara offline</p>
          </div>

          <div class="favorites-controls">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                id="search-favorites" 
                placeholder="Cari cerita favorit..." 
                aria-label="Cari cerita favorit"
              />
            </div>
            
            <div class="sort-controls">
              <label for="sort-favorites">
                <i class="fas fa-sort"></i> Urutkan:
              </label>
              <select id="sort-favorites" aria-label="Urutkan cerita">
                <option value="savedAt-desc">Terbaru Disimpan</option>
                <option value="savedAt-asc">Terlama Disimpan</option>
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
              </select>
            </div>

            <button id="clear-favorites" class="btn btn-danger" aria-label="Hapus semua favorit">
              <i class="fas fa-trash-alt"></i> Hapus Semua
            </button>
          </div>

          <div id="favorites-stats" class="favorites-stats"></div>
          <div id="favorites-list" class="favorites-list loading">
            <div class="spinner"></div>
            <p>Memuat cerita favorit...</p>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.loadFavorites();
    this.initializeEventListeners();
  },

  async loadFavorites(searchQuery = '', sortOption = 'savedAt-desc') {
    const favoritesList = document.getElementById('favorites-list');
    const statsContainer = document.getElementById('favorites-stats');

    try {
      let stories;
      
      // Get stories based on search query
      if (searchQuery) {
        stories = await dbHelper.searchFavoriteStories(searchQuery);
      } else {
        stories = await dbHelper.getAllFavoriteStories();
      }

      // Sort stories
      const [sortBy, order] = sortOption.split('-');
      stories = stories.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Update stats
      statsContainer.innerHTML = `
        <div class="stats-card">
          <i class="fas fa-heart"></i>
          <div>
            <h3>${stories.length}</h3>
            <p>Total Favorit</p>
          </div>
        </div>
        <div class="stats-card">
          <i class="fas fa-database"></i>
          <div>
            <h3>Offline</h3>
            <p>Tersimpan Lokal</p>
          </div>
        </div>
      `;

      // Display stories
      if (stories.length === 0) {
        favoritesList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-heart-broken"></i>
            <h3>Belum Ada Favorit</h3>
            <p>${searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian Anda.' : 'Mulai tambahkan cerita ke favorit dari halaman Stories.'}</p>
            <a href="#/stories" class="btn btn-primary">
              <i class="fas fa-book-open"></i> Lihat Stories
            </a>
          </div>
        `;
        return;
      }

      favoritesList.innerHTML = stories.map(story => `
        <div class="story-card favorite-card" data-story-id="${story.id}">
          <div class="story-image">
            ${story.photoUrl ? `
              <img src="${story.photoUrl}" alt="${story.name}" loading="lazy" />
            ` : `
              <div class="no-image">
                <i class="fas fa-image"></i>
              </div>
            `}
          </div>
          
          <div class="story-content">
            <div class="story-header">
              <h3>${story.name}</h3>
              <span class="favorite-badge" title="Favorit">
                <i class="fas fa-heart"></i>
              </span>
            </div>
            
            <p class="story-description">${story.description}</p>
            
            <div class="story-meta">
              <span title="Tanggal dibuat">
                <i class="fas fa-calendar"></i> 
                ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span title="Disimpan pada">
                <i class="fas fa-bookmark"></i> 
                ${new Date(story.savedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            ${story.lat && story.lon ? `
              <div class="story-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
              </div>
            ` : ''}
          </div>

          <div class="story-actions">
            <button class="btn btn-danger btn-sm remove-favorite" data-id="${story.id}" aria-label="Hapus dari favorit">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      `).join('');

      // Add event listeners for remove buttons
      document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = button.dataset.id;
          await this.removeFavorite(id);
        });
      });

    } catch (error) {
      console.error('Error loading favorites:', error);
      favoritesList.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Gagal Memuat Favorit</h3>
          <p>Terjadi kesalahan saat memuat cerita favorit.</p>
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="fas fa-redo"></i> Muat Ulang
          </button>
        </div>
      `;
    }
  },

  async removeFavorite(id) {
    const result = await Swal.fire({
      title: 'Hapus Favorit?',
      text: 'Cerita ini akan dihapus dari daftar favorit Anda.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-trash"></i> Ya, Hapus',
      cancelButtonText: '<i class="fas fa-times"></i> Batal'
    });

    if (result.isConfirmed) {
      try {
        await dbHelper.deleteFavoriteStory(id);
        
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Cerita telah dihapus dari favorit',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });

        // Reload favorites
        const searchQuery = document.getElementById('search-favorites')?.value || '';
        const sortOption = document.getElementById('sort-favorites')?.value || 'savedAt-desc';
        await this.loadFavorites(searchQuery, sortOption);

      } catch (error) {
        console.error('Error removing favorite:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal menghapus cerita dari favorit',
          confirmButtonColor: '#007bff'
        });
      }
    }
  },

  async clearAllFavorites() {
    const result = await Swal.fire({
      title: 'Hapus Semua Favorit?',
      text: 'Semua cerita favorit akan dihapus. Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-trash"></i> Ya, Hapus Semua',
      cancelButtonText: '<i class="fas fa-times"></i> Batal'
    });

    if (result.isConfirmed) {
      try {
        const allStories = await dbHelper.getAllFavoriteStories();
        
        for (const story of allStories) {
          await dbHelper.deleteFavoriteStory(story.id);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Semua cerita favorit telah dihapus',
          timer: 2000,
          showConfirmButton: false
        });

        await this.loadFavorites();

      } catch (error) {
        console.error('Error clearing favorites:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal menghapus cerita favorit',
          confirmButtonColor: '#007bff'
        });
      }
    }
  },

  initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-favorites');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const sortOption = document.getElementById('sort-favorites')?.value || 'savedAt-desc';
          this.loadFavorites(e.target.value, sortOption);
        }, 300);
      });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-favorites');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const searchQuery = document.getElementById('search-favorites')?.value || '';
        this.loadFavorites(searchQuery, e.target.value);
      });
    }

    // Clear all button
    const clearButton = document.getElementById('clear-favorites');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAllFavorites();
      });
    }
  }
};

export default FavoritesPage;
