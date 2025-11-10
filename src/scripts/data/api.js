import CONFIG from '../config.js';

class DicodingStoryAPI {
  constructor(baseURL = CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  async fetchAllStories(page = 1, size = 10, withLocation = 0) {
    try {
      const url = `${this.baseURL}/stories?page=${page}&size=${size}&location=${withLocation}`;
      console.log('Fetching stories from:', url);
      
      const token = localStorage.getItem('auth_token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using token for authentication');
      } else {
        console.log('No token found, using guest access');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch stories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched stories count:', data?.listStory?.length || 0);
      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  async fetchStoryById(id) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseURL}/stories/${id}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching story:', error);
      throw error;
    }
  }

  async addStory(description, photo, lat = null, lon = null) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      const token = localStorage.getItem('auth_token');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/stories`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add story');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
}

export default DicodingStoryAPI;
