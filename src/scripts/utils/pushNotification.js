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

      const successful = await this.subscription.unsubscribe();
      
      if (successful) {
        console.log('Successfully unsubscribed from push notifications');
        this.subscription = null;
        this.updateSubscriptionUI();
      }

      return successful;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  async getVapidPublicKey() {
    try {
      // Get VAPID public key from Dicoding Story API
      // Note: Based on Dicoding documentation, the VAPID key should be available
      // For now, we'll use a placeholder. You need to get this from the API documentation
      
      // Try to fetch from API endpoint if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await fetch(`${CONFIG.BASE_URL}/push/vapid`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.publicKey;
          }
        } catch (error) {
          console.log('Could not fetch VAPID key from API:', error);
        }
      }

      // Fallback: Use the public VAPID key from Dicoding Story API documentation
      // You MUST replace this with the actual VAPID public key from the API docs
      return 'BL4vlMg7cgX4kwjkILQZEeCl7FPqLDL7c4i5kfQ5LkVwCCCTLcSCKfmXKvVkTJrQhQXz9UJ0KqF8NN8lFuUJwNI';
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      // Send subscription to your backend server if you have one
      // This is optional for the Dicoding submission
      console.log('Subscription endpoint:', subscription.endpoint);
      
      // For Dicoding Story API, you might need to send the subscription
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token, skipping server subscription');
        return;
      }

      // Store subscription in localStorage as backup
      localStorage.setItem('push_subscription', JSON.stringify(subscription));
      
    } catch (error) {
      console.error('Error sending subscription to server:', error);
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
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
          url: '/#/stories'
        }
      });
    }
  }
}

// Singleton instance
const pushNotificationHelper = new PushNotificationHelper();

export default pushNotificationHelper;
