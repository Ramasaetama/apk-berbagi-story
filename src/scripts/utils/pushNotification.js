import CONFIG from '../config.js';

class PushNotificationHelper {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.registration = null;
    this.subscription = null;
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      
      // Check existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      // Update UI based on subscription state
      this.updateSubscriptionUI();
      
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    return permission === 'granted';
  }

  async subscribe() {
    try {
      if (!this.registration) {
        await this.init();
      }

      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        this.subscription = existingSubscription;
        return existingSubscription;
      }

      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Permission denied for push notifications');
        }
      }

      // Get VAPID public key from API
      const vapidPublicKey = await this.getVapidPublicKey();
      
      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('Push subscription successful:', subscription);
      this.subscription = subscription;

      // Send subscription to server (optional, for backend integration)
      await this.sendSubscriptionToServer(subscription);

      this.updateSubscriptionUI();
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe() {
    try {
      if (!this.subscription) {
        console.log('No active subscription to unsubscribe');
        return true;
      }

      // Unsubscribe from server first
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              endpoint: this.subscription.endpoint
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Server unsubscribe response:', data);
          }
        } catch (error) {
          console.error('Error unsubscribing from server:', error);
          // Continue with local unsubscribe even if server fails
        }
      }

      // Unsubscribe locally
      const successful = await this.subscription.unsubscribe();
      
      if (successful) {
        console.log('Successfully unsubscribed from push notifications');
        this.subscription = null;
        localStorage.removeItem('push_subscription');
        this.updateSubscriptionUI();
      }

      return successful;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  async getVapidPublicKey() {
    // VAPID public key dari dokumentasi Dicoding Story API
    // Endpoint /push/vapid tidak tersedia, jadi gunakan hardcoded value
    return 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  async sendSubscriptionToServer(subscription) {
    try {
      console.log('Sending subscription to server...');
      console.log('Subscription endpoint:', subscription.endpoint);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token, cannot subscribe to server');
        throw new Error('Authentication required to subscribe to notifications. Please login first.');
      }

      // Konversi keys ke base64 sesuai format API
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))));

      // Send subscription ke Dicoding Story API sesuai dokumentasi
      // Format: { endpoint, keys: { p256dh, auth } }
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: p256dh,
            auth: auth,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Subscribe error:', errorData);
        throw new Error(errorData.message || `Failed to subscribe: ${response.status}`);
      }

      const data = await response.json();
      console.log('Successfully subscribed to server notifications:', data);

      // Store subscription in localStorage as backup
      localStorage.setItem('push_subscription', JSON.stringify({
        endpoint: subscription.endpoint,
        subscribedAt: new Date().toISOString()
      }));
      
      return data;
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  isSubscribed() {
    return this.subscription !== null;
  }

  getSubscriptionState() {
    return {
      isSupported: this.isSupported,
      permission: Notification.permission,
      isSubscribed: this.isSubscribed(),
      subscription: this.subscription,
    };
  }

  updateSubscriptionUI() {
    const toggleButton = document.getElementById('push-notification-toggle');
    if (toggleButton) {
      const isSubscribed = this.isSubscribed();
      toggleButton.checked = isSubscribed;
      
      const label = document.querySelector('label[for="push-notification-toggle"]');
      if (label) {
        const span = label.querySelector('span') || label;
        span.textContent = isSubscribed 
          ? 'Notifikasi Push Aktif' 
          : 'Notifikasi Push Nonaktif';
      }
    }

    // Update any status indicators
    const statusElement = document.getElementById('notification-status');
    if (statusElement) {
      if (this.isSubscribed()) {
        statusElement.textContent = '✓ Notifikasi aktif';
        statusElement.className = 'notification-status active';
      } else {
        statusElement.textContent = '✗ Notifikasi nonaktif';
        statusElement.className = 'notification-status inactive';
      }
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test notification
  async sendTestNotification() {
    if (Notification.permission === 'granted' && this.registration) {
      this.registration.showNotification('Test Notifikasi', {
        body: 'Ini adalah notifikasi percobaan dari Berbagi Story',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
          url: './#/stories'
        }
      });
    }
  }
}

// Singleton instance
const pushNotificationHelper = new PushNotificationHelper();

export default pushNotificationHelper;
