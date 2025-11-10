/**
 * Stories View - Handles DOM rendering for Stories page
 */
import dbHelper from '../utils/indexedDB.js';
import Swal from 'sweetalert2';

class StoriesView {
  constructor() {
    this.container = null;
    this.favoriteStates = new Map();
  }

  async initFavoriteStates(stories) {
    for (const story of stories) {
      const isFavorite = await dbHelper.isFavorite(story.id);
      this.favoriteStates.set(story.id, isFavorite);
    }
  }

  render() {
    return `
      <div class="stories-container">
        <header class="stories-header">
          <h1><i class="fas fa-book-open"></i> Berbagi Cerita</h1>
          <p>Jelajahi cerita menarik dari berbagai lokasi</p>
        </header>
        
        <div class="stories-layout">
          <section class="stories-list" aria-label="Daftar cerita">
            <div class="loading" id="loading">
              <i class="fas fa-spinner fa-spin"></i> Memuat cerita...
            </div>
            <ul class="story-items" id="story-items"></ul>
          </section>
          
          <section class="stories-map" aria-label="Peta lokasi cerita">
            <div id="map" style="height: 600px;"></div>
          </section>
        </div>
      </div>
    `;
  }

  showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
      loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat cerita...';
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showMessage(message, type = 'info', isLocal = false) {
    const loadingElement = document.getElementById('loading');
    if (!loadingElement) return;

    const iconMap = {
      info: 'fas fa-info-circle',
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      error: 'fas fa-times-circle'
    };

    const colorMap = {
      info: '#d1ecf1',
      success: '#d4edda',
      warning: '#fff3cd',
      error: '#f8d7da'
    };

    loadingElement.style.display = 'block';
    loadingElement.innerHTML = `
      <div style="text-align: center; padding: 1rem; background: ${colorMap[type]}; color: #333; border-radius: 8px; margin-bottom: 1rem;">
        <p style="margin: 0;"><i class="${iconMap[type]}"></i> ${message}</p>
      </div>
    `;
  }

  showEmptyState(isAuthenticationError = false) {
    const loadingElement = document.getElementById('loading');
    if (!loadingElement) return;

    loadingElement.innerHTML = `
      <div style="text-align: center; padding: 3rem 2rem; max-width: 600px; margin: 0 auto;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">
          <i class="fas fa-book-open" style="color: #007bff;"></i>
        </div>
        <h2 style="color: #333; margin-bottom: 1rem; font-size: 1.5rem;">
          ${isAuthenticationError ? 'Autentikasi Diperlukan' : 'Belum Ada Cerita'}
        </h2>
        ${isAuthenticationError 
          ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin-bottom: 1.5rem; border-radius: 8px;">
              <p style="color: #856404; margin: 0; font-weight: bold; margin-bottom: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i> Silakan Login Terlebih Dahulu
              </p>
              <p style="color: #856404; margin: 0; font-size: 0.9rem;">
                Untuk melihat cerita dari server, Anda perlu login terlebih dahulu.
              </p>
            </div>
            <a href="#/login" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 0.5rem;">
              <i class="fas fa-sign-in-alt"></i> Login Sekarang
            </a>
            <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">atau</p>
            <a href="#/add-story" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 0.5rem;">
              <i class="fas fa-plus"></i> Tambah Cerita Baru
            </a>
          `
          : `
            <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.6;">
              Jadilah yang pertama menambahkan cerita menarik!
            </p>
            <a href="#/add-story" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem;">
              <i class="fas fa-plus"></i> Tambah Cerita 
            </a>
            <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">
              Tips: Setelah menambahkan cerita dengan lokasi, kembali ke halaman ini untuk melihatnya di peta!
            </p>
          `
        }
      </div>
    `;
  }

  async renderStoryList(stories) {
    const container = document.getElementById('story-items');
    if (!container) return;

    // Initialize favorite states
    await this.initFavoriteStates(stories);

    container.innerHTML = stories
      .map(
        (story) => {
          const isFavorite = this.favoriteStates.get(story.id);
          return `
        <li class="story-item">
          <article 
            class="story-card" 
            data-story-id="${story.id}" 
            tabindex="0" 
            role="button" 
            aria-label="Cerita dari ${story.name}. Tekan Enter untuk melihat di peta."
            data-lat="${story.lat || ''}" 
            data-lon="${story.lon || ''}"
          >
            <div class="story-image">
              <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" loading="lazy">
              <button 
                class="favorite-button ${isFavorite ? 'active' : ''}" 
                data-story-id="${story.id}"
                aria-label="${isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}"
                title="${isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}"
              >
                <i class="fas fa-heart"></i>
              </button>
            </div>
            <div class="story-content">
              <h3 class="story-name"><i class="fas fa-user"></i> ${story.name}</h3>
              <p class="story-description">${story.description}</p>
              <time datetime="${story.createdAt}">
                <i class="fas fa-calendar-alt"></i>
                ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              ${story.lat && story.lon ? `
                <p class="story-location" aria-label="Lokasi">
                  <i class="fas fa-map-marker-alt"></i> ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
                </p>
              ` : ''}
            </div>
          </article>
        </li>
      `;
        }
      )
      .join('');

    // Add event listeners for favorite buttons
    this.attachFavoriteListeners(stories);
  }

  attachFavoriteListeners(stories) {
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    
    favoriteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const storyId = button.dataset.storyId;
        const story = stories.find(s => s.id === storyId);
        
        if (story) {
          await this.toggleFavorite(button, story);
        }
      });
    });
  }

  async toggleFavorite(button, story) {
    try {
      const isCurrentlyFavorite = button.classList.contains('active');
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await dbHelper.deleteFavoriteStory(story.id);
        button.classList.remove('active');
        button.setAttribute('aria-label', 'Tambahkan ke favorit');
        button.setAttribute('title', 'Tambahkan ke favorit');
        this.favoriteStates.set(story.id, false);
        
        Swal.fire({
          icon: 'info',
          title: 'Dihapus dari Favorit',
          text: 'Cerita telah dihapus dari daftar favorit',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        // Add to favorites
        await dbHelper.addFavoriteStory(story);
        button.classList.add('active');
        button.setAttribute('aria-label', 'Hapus dari favorit');
        button.setAttribute('title', 'Hapus dari favorit');
        this.favoriteStates.set(story.id, true);
        
        Swal.fire({
          icon: 'success',
          title: 'Ditambahkan ke Favorit',
          text: 'Cerita berhasil ditambahkan ke favorit',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengubah status favorit',
        confirmButtonColor: '#007bff'
      });
    }
  }

  getMapContainer() {
    return document.getElementById('map');
  }

  getStoryCards() {
    return document.querySelectorAll('.story-card');
  }

  highlightStoryCard(storyId) {
    const card = document.querySelector(`[data-story-id="${storyId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlight');
      setTimeout(() => card.classList.remove('highlight'), 2000);
      card.focus();
    }
  }
}

export default StoriesView;