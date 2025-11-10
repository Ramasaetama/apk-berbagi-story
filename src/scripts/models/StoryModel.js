/**
 * Story Model - Handles data operations without DOM manipulation
 */
import DicodingStoryAPI from '../data/api.js';
import { getLocalStories, addLocalStory } from '../utils/localStorage.js';

class StoryModel {
  constructor() {
    this.api = new DicodingStoryAPI();
    this.stories = [];
    this.loading = false;
    this.error = null;
  }

  async fetchStories(page = 1, size = 50, location = 0) {
    this.loading = true;
    this.error = null;
    
    try {
      const data = await this.api.fetchAllStories(page, size, location);
      
      if (data && data.error === false && data.listStory) {
        this.stories = data.listStory;
        return { success: true, stories: this.stories };
      } else {
        // Fallback to local stories
        const localStories = getLocalStories();
        this.stories = localStories;
        return { 
          success: true, 
          stories: this.stories, 
          isLocal: true,
          message: 'Menampilkan cerita lokal' 
        };
      }
    } catch (error) {
      this.error = error.message;
      
      // Try local stories as fallback
      const localStories = getLocalStories();
      this.stories = localStories;
      
      return {
        success: localStories.length > 0,
        stories: this.stories,
        isLocal: true,
        error: error.message,
        isAuthError: error.message?.includes('401')
      };
    } finally {
      this.loading = false;
    }
  }

  async addStory(description, photo, lat = null, lon = null) {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.api.addStory(description, photo, lat, lon);
      
      if (result.error === false) {
        // Save to local storage as backup
        if (photo) {
          const reader = new FileReader();
          reader.onload = (e) => {
            addLocalStory({
              name: 'User',
              description: description,
              photoUrl: e.target.result,
              lat: lat,
              lon: lon,
            });
          };
          reader.readAsDataURL(photo);
        }

        return { success: true, message: 'Cerita berhasil ditambahkan!' };
      } else {
        throw new Error(result.message || 'Gagal menambahkan cerita');
      }
    } catch (error) {
      this.error = error.message;
      return { success: false, error: error.message };
    } finally {
      this.loading = false;
    }
  }

  getStoriesWithLocation() {
    const storiesWithLocation = this.stories.filter(story => {
      const hasLat = story.lat !== null && story.lat !== undefined && story.lat !== '';
      const hasLon = story.lon !== null && story.lon !== undefined && story.lon !== '';
      return hasLat && hasLon;
    });
    
    console.log('Total stories:', this.stories.length);
    console.log('Stories with location:', storiesWithLocation.length);
    console.log('Stories data:', this.stories.map(s => ({ 
      id: s.id, 
      name: s.name, 
      lat: s.lat, 
      lon: s.lon,
      hasLocation: s.lat && s.lon 
    })));
    
    return storiesWithLocation;
  }

  getStoryById(id) {
    return this.stories.find(story => story.id === id);
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  getStories() {
    return this.stories;
  }
}

export default StoryModel;