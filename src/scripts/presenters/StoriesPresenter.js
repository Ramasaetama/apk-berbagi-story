/**
 * Stories Presenter - Handles interaction between StoriesView and StoryModel
 */
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
// Fix default marker icons when bundling (Vite/ESM)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Swal from 'sweetalert2';

import CONFIG from '../config.js';
import StoryModel from '../models/StoryModel.js';
import StoriesView from '../views/StoriesView.js';
import { enableKeyboardNavigation } from '../utils/accessibility.js';

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

// Create an explicit icon using the bundled images
const DEFAULT_ICON = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});

class StoriesPresenter {
  constructor() {
    this.model = new StoryModel();
    this.view = new StoriesView();
    this.map = null;
    this.markers = [];
  }

  async render() {
    return this.view.render();
  }

  async afterRender() {
    await this.loadStories();
    this.setupEventListeners();
  }

  async loadStories() {
    this.view.showLoading();

    try {
      const result = await this.model.fetchStories(1, 50, 0);
      
      if (result.success) {
        this.view.hideLoading();
        
        if (result.isLocal && result.error) {
          this.view.showMessage(
            '⚠️ API tidak tersedia. Menampilkan cerita lokal', 
            'warning'
          );
        } else if (result.isLocal) {
          this.view.showMessage(
            '📝 Menampilkan cerita yang Anda buat (disimpan lokal)', 
            'info'
          );
        }

        const stories = this.model.getStories();
        if (stories.length > 0) {
          this.view.renderStoryList(stories);
          this.initMap(stories);
          this.setupStoryCardListeners();
        } else {
          this.view.showEmptyState(result.isAuthError);
          this.initMap([]);
        }
      } else {
        if (result.isAuthError) {
          this.view.showEmptyState(true);
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Gagal Memuat Cerita',
            text: result.error || 'Terjadi kesalahan saat memuat cerita',
            confirmButtonText: 'OK',
            confirmButtonColor: '#007bff'
          });
        }
        this.initMap([]);
      }
    } catch (error) {
      console.error('Error in loadStories:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan yang tidak terduga',
        confirmButtonText: 'OK',
        confirmButtonColor: '#007bff'
      });
    }
  }

  setupStoryCardListeners() {
    const storyCards = this.view.getStoryCards();
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

    // Enable keyboard navigation
    enableKeyboardNavigation(document.querySelector('.stories-list'));
  }

  setupEventListeners() {
    // Additional event listeners can be added here
  }

  initMap(stories) {
    const mapContainer = this.view.getMapContainer();
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    try {
      // Initialize Leaflet map
      this.map = L.map(mapContainer).setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

      // Define multiple tile layers for Layer Control
      const tileLayers = {
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }),
        'OpenStreetMap DE': L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }),
        'CartoDB Positron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }),
        'CartoDB Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        })
      };

      // Add default layer
      tileLayers['OpenStreetMap'].addTo(this.map);

      // Add layer control
      L.control.layers(tileLayers, {}, {
        position: 'topright',
        collapsed: false
      }).addTo(this.map);

      // Add all story markers - show all stories, use default coordinates if no location
      this.markers = [];
      const allStories = this.model.getStories();
      const storiesWithLocation = this.model.getStoriesWithLocation();
      
      console.log('All stories count:', allStories.length);
      console.log('Stories with location count:', storiesWithLocation.length);
      
      if (allStories.length === 0) {
        // Show message if no stories at all
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'text-align: center; padding: 1rem; color: #666; background: rgba(255,255,255,0.9); border-radius: 8px; margin: 1rem;';
        messageDiv.innerHTML = '<i class="fas fa-info-circle"></i> Tidak ada cerita untuk ditampilkan.';
        mapContainer.parentNode.appendChild(messageDiv);
        return;
      }
      
      // Display all stories with markers
      allStories.forEach((story, index) => {
        try {
          // Use story coordinates if available, otherwise use default with slight offset
          let lat, lon;
          if (story.lat && story.lon) {
            lat = parseFloat(story.lat);
            lon = parseFloat(story.lon);
          } else {
            // Use default coordinates with slight random offset for stories without location
            lat = CONFIG.DEFAULT_MAP_CENTER[0] + (Math.random() - 0.5) * 0.1;
            lon = CONFIG.DEFAULT_MAP_CENTER[1] + (Math.random() - 0.5) * 0.1;
          }
          
          const marker = L.marker([lat, lon], { icon: DEFAULT_ICON })
            .addTo(this.map)
            .bindPopup(`
              <div class="popup-content">
                <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" style="width: 100%; max-width: 200px; border-radius: 4px; margin-bottom: 8px;">
                <strong><i class="fas fa-user"></i> ${story.name}</strong>
                <p>${story.description}</p>
                <time><i class="fas fa-calendar-alt"></i> ${new Date(story.createdAt).toLocaleDateString('id-ID')}</time>
                ${story.lat && story.lon ? 
                  `<p style="margin-top: 8px; color: #28a745;"><i class="fas fa-map-marker-alt"></i> ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</p>` : 
                  `<p style="margin-top: 8px; color: #6c757d;"><i class="fas fa-info-circle"></i> Lokasi tidak tersedia</p>`
                }
              </div>
            `);
          
          marker.storyData = story;
          this.markers.push(marker);
          
          // Add click event to sync with list
          marker.on('click', () => {
            this.view.highlightStoryCard(story.id);
          });
        } catch (err) {
          console.error('Error adding marker for story:', story.id, err);
        }
      });

      // Fit map to show all markers
      if (this.markers.length > 0) {
        try {
          const group = new L.featureGroup(this.markers);
          this.map.fitBounds(group.getBounds().pad(0.3));
        } catch (err) {
          console.error('Error fitting map bounds:', err);
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
}

export default StoriesPresenter;