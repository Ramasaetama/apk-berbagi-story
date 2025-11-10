/**
 * Add Story View - Handles DOM rendering for Add Story page
 */
class AddStoryView {
  constructor() {
    this.container = null;
  }

  render() {
    return `
      <div class="add-story-container">
        <header class="add-story-header">
          <h1><i class="fas fa-plus-circle"></i> Tambah Cerita Baru</h1>
          <p>Bagikan cerita menarik Anda dengan dunia</p>
        </header>
        
        <form id="story-form" class="story-form" aria-label="Form tambah cerita">
          <div class="form-group">
            <label for="description">
              <i class="fas fa-pencil-alt"></i> Deskripsi Cerita *
            </label>
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
            <label for="photo">
              <i class="fas fa-camera"></i> Foto Cerita *
            </label>
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
                <i class="fas fa-camera"></i> Ambil Foto dari Kamera
              </button>
            </div>
            <div id="photo-preview" class="photo-preview" aria-live="polite"></div>
            <span class="error-message" id="photo-error" aria-live="polite"></span>
          </div>

          <div class="form-group">
            <label for="location-info">
              <i class="fas fa-map-marker-alt"></i> Lokasi (Opsional)
            </label>
            <p id="location-info" class="location-info">
              Klik pada peta di bawah untuk memilih lokasi cerita
            </p>
            <span class="error-message" id="location-error" aria-live="polite"></span>
          </div>

          <div id="story-map" class="story-map" style="height: 400px;"></div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" aria-label="Kirim cerita">
              <i class="fas fa-paper-plane"></i> Kirim Cerita
            </button>
            <button type="button" class="btn-reset" id="reset-btn" aria-label="Reset form">
              <i class="fas fa-redo"></i> Reset
            </button>
          </div>

          <div id="form-message" class="form-message" aria-live="polite"></div>
        </form>
      </div>
    `;
  }

  showLoading(isSubmitting = false) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn && isSubmitting) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    }
  }

  hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Cerita';
    }
  }

  showMessage(message, type = 'info') {
    const messageElement = document.getElementById('form-message');
    if (!messageElement) return;

    const iconMap = {
      success: 'fas fa-check-circle',
      error: 'fas fa-times-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-triangle'
    };

    messageElement.innerHTML = `<i class="${iconMap[type]}"></i> ${message}`;
    messageElement.className = `form-message ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'form-message';
      }, 3000);
    }
  }

  showPhotoPreview(file) {
    const preview = document.getElementById('photo-preview');
    if (!preview) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `
        <div class="preview-container">
          <img src="${e.target.result}" alt="Preview foto cerita" style="max-width: 300px; border-radius: 8px;">
          <p class="preview-info"><i class="fas fa-check-circle"></i> Foto siap diunggah</p>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  updateLocationInfo(lat, lng) {
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
      locationInfo.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}
      `;
      locationInfo.classList.add('location-selected');
    }
  }

  resetLocationInfo() {
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
      locationInfo.innerHTML = 'Klik pada peta di bawah untuk memilih lokasi cerita';
      locationInfo.classList.remove('location-selected');
    }
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  resetForm() {
    const form = document.getElementById('story-form');
    if (form) {
      form.reset();
    }
    
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) {
      photoPreview.innerHTML = '';
    }
    
    this.resetLocationInfo();
    this.showMessage('');
  }

  getMapContainer() {
    return document.getElementById('story-map');
  }
}

export default AddStoryView;