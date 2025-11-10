import CONFIG from '../../config.js';
import DicodingStoryAPI from '../../data/api.js';

export default class LoginPage {
  constructor() {
    this.api = new DicodingStoryAPI();
  }

  async render() {
    return `
      <section class="container login-section">
        <div class="login-container">
          <header class="login-header">
            <h1>Masuk ke Berbagi Story</h1>
            <p>Silakan masuk untuk dapat berbagi cerita</p>
          </header>

          <form id="login-form" class="login-form" aria-label="Form login">
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
              <span id="email-help" class="help-text">Masukkan email yang terdaftar</span>
              <span class="error-message" id="email-error" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="password">Password *</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Masukkan password"
                required
                aria-required="true"
              >
              <span class="error-message" id="password-error" aria-live="polite"></span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit" aria-label="Masuk">
                Masuk
              </button>
            </div>

            <div id="login-message" class="form-message" aria-live="polite"></div>
          </form>

          <div class="login-footer">
            <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupFormHandler();
  }

  setupFormHandler() {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  }

  async handleLogin() {
    const form = document.getElementById('login-form');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageElement = document.getElementById('login-message');

    // Validate inputs
    if (!email) {
      messageElement.textContent = 'Email harus diisi.';
      messageElement.className = 'form-message error';
      return;
    }

    if (!password) {
      messageElement.textContent = 'Password harus diisi.';
      messageElement.className = 'form-message error';
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';

    try {
      const data = await this.api.login(email, password);

      // Log full response untuk debugging
      console.log('🔍 Login Response:', JSON.stringify(data, null, 2));

      // Cek berbagai kemungkinan struktur response
      let token = null;
      let userName = null;

      // Format Dicoding Story API: { error: false, message: "success", loginResult: { token, ... } }
      if (data.loginResult && data.loginResult.token) {
        token = data.loginResult.token;
        userName = data.loginResult.name;
      }
      // Format alternatif: { error: false, data: { token, name } }
      else if (data.error === false && data.data && data.data.token) {
        token = data.data.token;
        userName = data.data.name;
      }
      // Format lain: { token, user }
      else if (data.token) {
        token = data.token;
        userName = data.user?.name || data.name;
      }
      // Format lain: langsung { token }
      else if (data.data?.token) {
        token = data.data.token;
        userName = data.data.name;
      }

      if (token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_name', userName || 'User');
        
        // Debug: Log token to console
        console.log('✅ Token berhasil disimpan:', token);
        console.log('📦 localStorage - auth_token:', localStorage.getItem('auth_token'));
        console.log('👤 User name:', userName);
        
        messageElement.textContent = 'Login berhasil! Token tersimpan di localStorage.';
        messageElement.className = 'form-message success';

        // Redirect to home page after 1 second
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      } else {
        console.error('❌ Token tidak ditemukan dalam response:', data);
        throw new Error(data.message || 'Token tidak ditemukan dalam response');
      }
    } catch (error) {
      messageElement.textContent = error.message || 'Login gagal. Silakan coba lagi.';
      messageElement.className = 'form-message error';
      console.error('❌ Login Error:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Masuk';
    }
  }
}

