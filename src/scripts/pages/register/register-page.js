import CONFIG from '../../config.js';
import DicodingStoryAPI from '../../data/api.js';

export default class RegisterPage {
  constructor() {
    this.api = new DicodingStoryAPI();
  }

  async render() {
    return `
      <section class="container register-section">
        <div class="register-container">
          <header class="register-header">
            <h1>Daftar ke Berbagi Story</h1>
            <p>Buat akun untuk mulai berbagi cerita</p>
          </header>

          <form id="register-form" class="register-form" aria-label="Form registrasi">
            <div class="form-group">
              <label for="name">Nama Lengkap *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Nama lengkap"
                required
                aria-required="true"
              >
              <span class="error-message" id="name-error" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="nama@email.com"
                required
                aria-required="true"
                aria-describedby="email-help"
              >
              <span id="email-help" class="help-text">Masukkan email yang valid</span>
              <span class="error-message" id="email-error" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="password">Password *</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Minimal 6 karakter"
                required
                aria-required="true"
                minlength="6"
              >
              <span class="help-text">Minimal 6 karakter</span>
              <span class="error-message" id="password-error" aria-live="polite"></span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit" aria-label="Daftar">
                Daftar
              </button>
            </div>

            <div id="register-message" class="form-message" aria-live="polite"></div>
          </form>

          <div class="register-footer">
            <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupFormHandler();
  }

  setupFormHandler() {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegister();
    });
  }

  async handleRegister() {
    const form = document.getElementById('register-form');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageElement = document.getElementById('register-message');

    // Validate inputs
    if (!name) {
      messageElement.textContent = 'Nama lengkap harus diisi.';
      messageElement.className = 'form-message error';
      return;
    }

    if (!email) {
      messageElement.textContent = 'Email harus diisi.';
      messageElement.className = 'form-message error';
      return;
    }

    if (!password || password.length < 6) {
      messageElement.textContent = 'Password minimal 6 karakter.';
      messageElement.className = 'form-message error';
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';

    try {
      const data = await this.api.register(name, email, password);

      if (data.error === false) {
        messageElement.textContent = 'Registrasi berhasil! Silakan masuk.';
        messageElement.className = 'form-message success';

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);
      } else {
        throw new Error(data.message || 'Registrasi gagal');
      }
    } catch (error) {
      messageElement.textContent = error.message || 'Registrasi gagal. Silakan coba lagi.';
      messageElement.className = 'form-message error';
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Daftar';
    }
  }
}

