import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});
const DEFAULT_ICON = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});
console.log('Leaflet marker icon URLs (add-story):', { markerIconUrl, markerIconRetinaUrl, markerShadowUrl });
import CONFIG from '../../config.js';
import DicodingStoryAPI from '../../data/api.js';
import { addLocalStory } from '../../utils/localStorage.js';
import { isLoggedIn, getAuthToken } from '../../utils/auth.js';
import Swal from 'sweetalert2';

export default class AddStoryPage {
  constructor() {
    this.api = new DicodingStoryAPI();
    this.map = null;
    this.marker = null;
    this.selectedPosition = null;
    this.cameraStream = null;
  }

  async render() {
    // Check if user is logged in
    if (!isLoggedIn()) {
      return `
        <div class="auth-required-container">
          <div class="auth-required-card">
            <i class="fas fa-lock fa-3x"></i>
            <h2>Login Diperlukan</h2>
            <p>Anda harus login terlebih dahulu untuk membagikan cerita.</p>
            <a href="#/login" class="btn btn-primary">
              <i class="fas fa-sign-in-alt"></i> Login Sekarang
            </a>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="add-story-container">
        <header class="add-story-header">
          <h1>Tambah Cerita Baru</h1>
        </header>
        
        <form id="story-form" class="story-form" aria-label="Form tambah cerita">
          <div class="form-group">
            <label for="description">Deskripsi Cerita *</label>
            <textarea 
              id="description" 
              name="description" 
              rows="5" 
              placeholder="Tuliskan cerita Anda di sini..."
              required
              aria-required="true"
            ></textarea>
            <span class="error-message" id="description-error" aria-live="polite"></span>
          </div>

          <div class="form-group">
            <label for="photo">Foto Cerita *</label>
            <div class="photo-upload-container">
              <input 
                type="file" 
                id="photo" 
                name="photo" 
                accept="image/*" 
                required
                aria-required="true"
                aria-describedby="photo-help"
              >
              <p id="photo-help" class="help-text">Format: JPG, PNG, GIF. Maksimal 1MB</p>
              <button type="button" class="btn-camera" id="camera-btn" aria-label="Ambil foto dari kamera">
                📷 Ambil Foto dari Kamera
              </button>
            </div>
            <div id="photo-preview" class="photo-preview" aria-live="polite"></div>
            <span class="error-message" id="photo-error" aria-live="polite"></span>
          </div>

          <div class="form-group">
            <label for="location-info">Lokasi (Opsional)</label>
            <p id="location-info" class="location-info">
              Klik pada peta di bawah untuk memilih lokasi cerita
            </p>
            <span class="error-message" id="location-error" aria-live="polite"></span>
          </div>

          <div id="story-map" class="story-map" style="height: 400px;"></div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" aria-label="Kirim cerita">
              Kirim Cerita
            </button>
            <button type="button" class="btn-reset" id="reset-btn" aria-label="Reset form">
              Reset
            </button>
          </div>

          <div id="form-message" class="form-message" aria-live="polite"></div>
        </form>
      </div>
    `;
  }

  async afterRender() {
    this.initMap();
    this.setupFormHandlers();
    this.setupCameraHandler();
  }

  initMap() {
    const mapContainer = document.getElementById('story-map');
    
    // Initialize Leaflet map
    this.map = L.map(mapContainer).setView(CONFIG.DEFAULT_MAP_CENTER, CONFIG.DEFAULT_MAP_ZOOM);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Add marker for user location 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 13);
        },
        () => {
        }
      );
    }

    // Add click event to select location
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.selectedPosition = { lat, lon: lng };

      // Remove existing marker
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      // Add new marker at clicked position
      this.marker = L.marker([lat, lng], { icon: DEFAULT_ICON })
        .addTo(this.map)
        .bindPopup('📍 Lokasi cerita dipilih')
        .openPopup();

      // Update location info
      const locationInfo = document.getElementById('location-info');
      locationInfo.textContent = `Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      locationInfo.classList.add('location-selected');
    });
  }

  setupFormHandlers() {
    const form = document.getElementById('story-form');
    const photoInput = document.getElementById('photo');
    const resetBtn = document.getElementById('reset-btn');

    // Photo preview
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.validatePhoto(file);
        this.showPhotoPreview(file);
      }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    // Reset form
    resetBtn.addEventListener('click', () => {
      this.resetForm();
    });
  }

  setupCameraHandler() {
    const cameraBtn = document.getElementById('camera-btn');

    cameraBtn.addEventListener('click', () => {
      this.openCamera();
    });
  }

  openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.cameraStream = stream;
          this.showCameraModal(stream);
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
          this.showMessage('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.', 'error');
        });
    } else {
      this.showMessage('Browser tidak mendukung akses kamera.', 'error');
    }
  }

  showCameraModal(stream) {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.innerHTML = `
      <div class="camera-modal-content">
        <video id="camera-video" autoplay></video>
        <div class="camera-controls">
          <button type="button" class="btn-capture" id="capture-btn">📷 Ambil Foto</button>
          <button type="button" class="btn-cancel" id="cancel-camera-btn">Batal</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const video = modal.querySelector('#camera-video');
    video.srcObject = stream;

    const captureBtn = modal.querySelector('#capture-btn');
    const cancelBtn = modal.querySelector('#cancel-camera-btn');

    captureBtn.addEventListener('click', () => {
      this.capturePhotoFromCamera(video);
      this.closeCameraModal();
    });

    cancelBtn.addEventListener('click', () => {
      this.closeCameraModal();
    });
  }

  capturePhotoFromCamera(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        const photoInput = document.getElementById('photo');
        
        // Create a new DataTransfer object to set the file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;
        photoInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 'image/jpeg', 0.9);
  }

  closeCameraModal() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }

    const modal = document.querySelector('.camera-modal');
    if (modal) {
      modal.remove();
    }
  }

  validatePhoto(file) {
    const errorElement = document.getElementById('photo-error');
    
    // Check file size (1MB max)
    if (file.size > 1024 * 1024) {
      errorElement.textContent = 'Ukuran file terlalu besar. Maksimal 1MB.';
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      errorElement.textContent = 'File harus berupa gambar.';
      return false;
    }

    errorElement.textContent = '';
    return true;
  }

  showPhotoPreview(file) {
    const preview = document.getElementById('photo-preview');
    const reader = new FileReader();

    reader.onload = (e) => {
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Preview foto cerita" style="max-width: 300px; border-radius: 8px;">
      `;
    };

    reader.readAsDataURL(file);
  }

  async handleSubmit() {
    const form = document.getElementById('story-form');
    const description = document.getElementById('description').value.trim();
    const photoInput = document.getElementById('photo');

    // Validate inputs
    if (!description) {
      this.showMessage('Deskripsi harus diisi.', 'error');
      return;
    }

    if (!photoInput.files || photoInput.files.length === 0) {
      this.showMessage('Foto harus diunggah.', 'error');
      return;
    }

    const photo = photoInput.files[0];
    if (!this.validatePhoto(photo)) {
      return;
    }

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    try {
      const data = await this.api.addStory(
        description,
        photo,
        this.selectedPosition?.lat,
        this.selectedPosition?.lon
      );

      if (data.error === false) {
        // Save to local storage for viewing without authentication
        const photoFile = photo;
        
        if (photoFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const photoUrl = e.target.result;
            
            addLocalStory({
              name: 'Guest',
              description: description,
              photoUrl: photoUrl,
              lat: this.selectedPosition?.lat,
              lon: this.selectedPosition?.lon,
            });
            
            console.log('Story saved to local storage');
          };
          reader.readAsDataURL(photoFile);
        }

        this.showMessage('Cerita berhasil ditambahkan!', 'success');
        this.resetForm();
        
        // Redirect to stories page after 2 seconds
        setTimeout(() => {
          window.location.hash = '#/stories';
        }, 2000);
      }
    } catch (error) {
      this.showMessage(error.message || 'Gagal menambahkan cerita. Silakan coba lagi.', 'error');
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Cerita';
    }
  }

  showMessage(message, type = 'info') {
    const messageElement = document.getElementById('form-message');
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'form-message';
      }, 3000);
    }
  }

  resetForm() {
    const form = document.getElementById('story-form');
    form.reset();
    
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('location-info').textContent =
      'Klik pada peta di bawah untuk memilih lokasi cerita';
    document.getElementById('location-info').classList.remove('location-selected');

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    this.selectedPosition = null;
    this.showMessage('');
  }
}

