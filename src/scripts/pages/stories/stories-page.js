import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
// Fix default marker icons when bundling (Vite/ESM)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

// Create a default icon instance to use explicitly when adding markers
// Create an explicit icon using the bundled images (more robust)
const DEFAULT_ICON = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});
console.log('Leaflet marker icon URLs:', { markerIconUrl, markerIconRetinaUrl, markerShadowUrl });
import CONFIG from '../../config.js';
import DicodingStoryAPI from '../../data/api.js';
import { getLocalStories } from '../../utils/localStorage.js';

export default class StoriesPage {
  constructor() {
    this.api = new DicodingStoryAPI();
  }

  async render() {
    return `
      <div class="stories-container">
        <header class="stories-header">
          <h1>Berbagi Cerita</h1>
          <p></p>
        </header>
        
        <div class="stories-layout">
          <section class="stories-list" aria-label="Daftar cerita">
            <div class="loading" id="loading">Memuat cerita...</div>
            <ul class="story-items" id="story-items"></ul>
          </section>
          
          <section class="stories-map" aria-label="Peta lokasi cerita">
            <div id="map" style="height: 600px;"></div>
          </section>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const loadingElement = document.getElementById('loading');
    const storyItemsElement = document.getElementById('story-items');
    const mapElement = document.getElementById('map');

    try {
      // Fetch stories from API 
      const data = await this.api.fetchAllStories(1, 50, 0);
      
      // Log the response for debugging
      console.log('API Response:', data);
      
      if (data && data.error === false && data.listStory && data.listStory.length > 0) {
        loadingElement.style.display = 'none';
        
        // Render story list
        this.renderStoryList(data.listStory, storyItemsElement);
        
        // Initialize map with Leaflet
        this.initMap(data.listStory, mapElement);

        // Enable keyboard navigation for story cards
        const storyCards = document.querySelectorAll('.story-card');
        storyCards.forEach(card => {
          // Add click event to sync list item with map
          card.addEventListener('click', () => {
            const storyId = card.getAttribute('data-story-id');
            const lat = card.getAttribute('data-lat');
            const lon = card.getAttribute('data-lon');
            
            if (lat && lon) {
              const marker = this.markers?.find(m => m.storyData?.id === storyId);
              if (marker) {
                this.map.setView([parseFloat(lat), parseFloat(lon)], 10);
                marker.openPopup();
              }
            }
          });
          
          // Add keyboard event
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              card.click();
            }
          });
        });
      } else {
        // Try to load local stories instead
        const localStories = getLocalStories();
        
        if (localStories.length > 0) {
          loadingElement.style.display = 'none';
          
          // Show info message
          loadingElement.innerHTML = `
            <div style="text-align: center; padding: 1rem; background: #d4edda; color: #155724; border-radius: 8px; margin-bottom: 1rem;">
              <p style="margin: 0;">📝 Menampilkan cerita yang Anda buat (disimpan lokal)</p>
            </div>
          `;
          
          // Render local stories
          this.renderStoryList(localStories, storyItemsElement);
          
          // Initialize map
          this.initMap(localStories, mapElement);

          // Enable keyboard navigation for story cards
          const storyCards = document.querySelectorAll('.story-card');
          storyCards.forEach(card => {
            card.addEventListener('click', () => {
              const storyId = card.getAttribute('data-story-id');
              const lat = card.getAttribute('data-lat');
              const lon = card.getAttribute('data-lon');
              
              if (lat && lon) {
                const marker = this.markers?.find(m => m.storyData?.id === storyId);
                if (marker) {
                  this.map.setView([parseFloat(lat), parseFloat(lon)], 10);
                  marker.openPopup();
                }
              }
            });
            
            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
              }
            });
          });
        } else {
          this.showEmptyState(loadingElement, mapElement);
        }
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      
      // Try to load local stories as fallback
      const localStories = getLocalStories();
      
      if (localStories.length > 0) {
        loadingElement.style.display = 'none';
        
        loadingElement.innerHTML = `
          <div style="text-align: center; padding: 1rem; background: #fff3cd; color: #856404; border-radius: 8px; margin-bottom: 1rem;">
            <p style="margin: 0;">⚠️ API tidak tersedia. Menampilkan cerita yang Anda buat (disimpan lokal)</p>
          </div>
        `;
        
        this.renderStoryList(localStories, storyItemsElement);
        this.initMap(localStories, mapElement);
      } else if (error.message && error.message.includes('401')) {
        this.showEmptyState(loadingElement, mapElement, true);
      } else {
        loadingElement.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <p style="color: #dc3545; margin-bottom: 1rem;">Gagal memuat cerita dari API.</p>
            <p style="color: #666; font-size: 0.9rem;">
              Anda masih bisa menambahkan cerita baru dengan mengklik "Tambah Cerita" di menu.
            </p>
            <details style="margin-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
              <summary style="cursor: pointer; color: #007bff;">Detail Error (Klik untuk melihat)</summary>
              <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; overflow-x: auto;">${error.message || 'Unknown error'}</pre>
            </details>
          </div>
        `;
      }
    }
  }

  showEmptyState(loadingElement, mapElement, isAuthenticationError = false) {
    loadingElement.innerHTML = `
      <div style="text-align: center; padding: 3rem 2rem; max-width: 600px; margin: 0 auto;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
        <h2 style="color: #333; margin-bottom: 1rem; font-size: 1.5rem;">
          ${isAuthenticationError ? 'Autentikasi Diperlukan' : 'Belum Ada Cerita'}
        </h2>
        ${isAuthenticationError 
          ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin-bottom: 1.5rem; border-radius: 8px;">
              <p style="color: #856404; margin: 0; font-weight: bold; margin-bottom: 0.5rem;">
                ⚠️ Silakan Login Terlebih Dahulu
              </p>
              <p style="color: #856404; margin: 0; font-size: 0.9rem;">
                Untuk melihat cerita dari server, Anda perlu login terlebih dahulu.
              </p>
            </div>
            <a href="#/login" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 0.5rem;">
              🔑 Login Sekarang
            </a>
            <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">atau</p>
            <a href="#/add-story" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 0.5rem;">
              ➕ Tambah Cerita Baru
            </a>
          `
          : `
            <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.6;">
              Jadilah yang pertama menambahkan cerita menarik!
            </p>
            <a href="#/add-story" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 1rem;">
              ➕ Tambah Cerita 
            </a>
            <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">
              Tips: Setelah menambahkan cerita dengan lokasi, kembali ke halaman ini untuk melihatnya di peta!
            </p>
          `
        }
      </div>
    `;
    
    // Initialize empty map for demonstration
    if (mapElement) {
      this.initMap([], mapElement);
    }
  }

  renderStoryList(stories, container) {
    container.innerHTML = stories
      .map(
        (story) => `
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
            </div>
            <div class="story-content">
              <h3 class="story-name">${story.name}</h3>
              <p class="story-description">${story.description}</p>
              <time datetime="${story.createdAt}">
                ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              ${story.lat && story.lon ? `
                <p class="story-location" aria-label="Lokasi">
                  📍 ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
                </p>
              ` : ''}
            </div>
          </article>
        </li>
      `
      )
      .join('');
  }

  initMap(stories, mapContainer) {
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    try {
      // Initialize Leaflet map
      const map = L.map(mapContainer).setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add all story markers
      const markers = [];
      const storiesWithLocation = stories.filter(story => story.lat && story.lon);
      
      if (storiesWithLocation.length === 0) {
        // Show message if no stories have location
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'text-align: center; padding: 1rem; color: #666;';
        messageDiv.textContent = 'Tidak ada cerita dengan lokasi untuk ditampilkan di peta.';
        mapContainer.parentNode.appendChild(messageDiv);
        
        // Store map instance
        this.map = map;
        this.markers = [];
        return;
      }
      
      storiesWithLocation.forEach((story) => {
        try {
          const marker = L.marker([story.lat, story.lon], { icon: DEFAULT_ICON })
            .addTo(map)
            .bindPopup(`
              <div class="popup-content">
                <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" style="width: 100%; max-width: 200px; border-radius: 4px; margin-bottom: 8px;">
                <strong>${story.name}</strong>
                <p>${story.description}</p>
                <time>${new Date(story.createdAt).toLocaleDateString('id-ID')}</time>
              </div>
            `);
          
          marker.storyData = story;
          markers.push(marker);
          
          // Add click event to sync with list
          marker.on('click', () => {
            const listItem = document.querySelector(`[data-story-id="${story.id}"]`);
            if (listItem) {
              listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              listItem.classList.add('highlight');
              setTimeout(() => listItem.classList.remove('highlight'), 2000);
              // Ensure the card is focusable for keyboard navigation
              listItem.focus();
            }
          });
        } catch (err) {
          console.error('Error adding marker for story:', story.id, err);
        }
      });

      // Fit map to show all markers
      if (markers.length > 0) {
        try {
          const group = new L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.3));
        } catch (err) {
          console.error('Error fitting map bounds:', err);
        }
      }

      // Store map instance for later use
      this.map = map;
      this.markers = markers;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
}

