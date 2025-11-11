import '../styles/styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';

import App from './pages/app';
import AuthModel from './models/AuthModel.js';
import pushNotificationHelper from './utils/pushNotification.js';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Get base path from current location
      const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) || '/';
      
      // Service worker path relative to base
      const swPath = `${basePath}sw.js`;
      
      console.log('Registering service worker from:', swPath);
      console.log('With scope:', basePath);
      
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: basePath
      });
      console.log('Service Worker registered successfully:', registration);

      // Initialize push notifications after service worker is ready
      await pushNotificationHelper.init();
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found, installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification(newWorker);
          }
        });
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

function showUpdateNotification(worker) {
  Swal.fire({
    title: 'Pembaruan Tersedia',
    text: 'Versi baru aplikasi telah tersedia. Muat ulang untuk menggunakan versi terbaru?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Muat Ulang',
    cancelButtonText: 'Nanti',
    confirmButtonColor: '#007bff'
  }).then((result) => {
    if (result.isConfirmed) {
      worker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button/banner
  showInstallPromotion();
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  
  Swal.fire({
    icon: 'success',
    title: 'Aplikasi Terinstal!',
    text: 'Berbagi Story telah berhasil diinstal di perangkat Anda',
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
});

function showInstallPromotion() {
  // Create install banner
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.className = 'install-banner';
  installBanner.innerHTML = `
    <div class="install-banner-content">
      <div class="install-banner-text">
        <i class="fas fa-download"></i>
        <span>Install aplikasi untuk pengalaman lebih baik!</span>
      </div>
      <div class="install-banner-actions">
        <button id="install-button" class="btn btn-primary btn-sm">
          <i class="fas fa-download"></i> Install
        </button>
        <button id="dismiss-install" class="btn btn-secondary btn-sm">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);

  // Install button click handler
  document.getElementById('install-button')?.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    deferredPrompt = null;
    installBanner.remove();
  });

  // Dismiss button click handler
  document.getElementById('dismiss-install')?.addEventListener('click', () => {
    installBanner.remove();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const authModel = new AuthModel();
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Initial page render
  await app.renderPage();
  
  const updateAuthLink = () => {
    const loginLink = document.querySelector('.login-link');
    if (!loginLink) return;

    const currentUser = authModel.getCurrentUser();
    
    if (currentUser.isLoggedIn) {
      loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Keluar';
      loginLink.onclick = async (e) => {
        e.preventDefault();
        
        const result = await Swal.fire({
          title: 'Konfirmasi Logout',
          text: 'Apakah Anda yakin ingin keluar?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Ya, Keluar',
          cancelButtonText: '<i class="fas fa-times"></i> Batal'
        });

        if (result.isConfirmed) {
          authModel.logout();
          updateAuthLink();
          location.hash = '#/login';
          await app.renderPage();
          
          await Swal.fire({
            icon: 'success',
            title: 'Logout Berhasil',
            text: 'Anda telah berhasil logout',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      };
      loginLink.setAttribute('href', '#/login');
    } else {
      loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
      loginLink.onclick = null;
      loginLink.setAttribute('href', '#/login');
    }
  };

  updateAuthLink();
  
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    updateAuthLink();
  });

  // Handle global errors with SweetAlert2
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: 'Aplikasi mengalami kesalahan yang tidak terduga. Silakan refresh halaman.',
      confirmButtonText: 'Refresh Halaman',
      confirmButtonColor: '#007bff'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  });

  // Check online/offline status
  window.addEventListener('online', () => {
    Swal.fire({
      icon: 'success',
      title: 'Kembali Online',
      text: 'Koneksi internet telah tersambung kembali',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });

    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('sync-stories');
      }).catch((error) => {
        console.error('Background sync registration failed:', error);
      });
    }
  });

  window.addEventListener('offline', () => {
    Swal.fire({
      icon: 'warning',
      title: 'Offline',
      text: 'Anda sedang offline. Beberapa fitur mungkin tidak tersedia.',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  });

  // Improve accessibility - ensure main content is focusable for skip link
  const mainContent = document.querySelector('#main-content');
  if (mainContent && !mainContent.hasAttribute('tabindex')) {
    mainContent.setAttribute('tabindex', '-1');
  }
});
