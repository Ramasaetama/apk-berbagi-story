import { openDB } from 'idb';

const DB_NAME = 'berbagi-story-db';
const DB_VERSION = 1;
const FAVORITE_STORE = 'favorite-stories';
const OFFLINE_STORE = 'offline-stories';

class IndexedDBHelper {
  constructor() {
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create favorite stories store
        if (!db.objectStoreNames.contains(FAVORITE_STORE)) {
          const favoriteStore = db.createObjectStore(FAVORITE_STORE, { 
            keyPath: 'id' 
          });
          favoriteStore.createIndex('name', 'name', { unique: false });
          favoriteStore.createIndex('createdAt', 'createdAt', { unique: false });
          favoriteStore.createIndex('savedAt', 'savedAt', { unique: false });
        }

        // Create offline stories store
        if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
          const offlineStore = db.createObjectStore(OFFLINE_STORE, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          offlineStore.createIndex('createdAt', 'createdAt', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
        }
      },
    });
  }

  // Favorite Stories Operations
  async addFavoriteStory(story) {
    const db = await this.dbPromise;
    const favoriteStory = {
      ...story,
      savedAt: new Date().toISOString(),
    };
    return db.add(FAVORITE_STORE, favoriteStory);
  }

  async getAllFavoriteStories() {
    const db = await this.dbPromise;
    return db.getAll(FAVORITE_STORE);
  }

  async getFavoriteStoryById(id) {
    const db = await this.dbPromise;
    return db.get(FAVORITE_STORE, id);
  }

  async deleteFavoriteStory(id) {
    const db = await this.dbPromise;
    return db.delete(FAVORITE_STORE, id);
  }

  async isFavorite(id) {
    const db = await this.dbPromise;
    const story = await db.get(FAVORITE_STORE, id);
    return !!story;
  }

  async searchFavoriteStories(query) {
    const db = await this.dbPromise;
    const allStories = await db.getAll(FAVORITE_STORE);
    
    if (!query || query.trim() === '') {
      return allStories;
    }

    const searchTerm = query.toLowerCase();
    return allStories.filter(story => {
      return (
        story.name?.toLowerCase().includes(searchTerm) ||
        story.description?.toLowerCase().includes(searchTerm)
      );
    });
  }

  async sortFavoriteStories(sortBy = 'savedAt', order = 'desc') {
    const db = await this.dbPromise;
    const allStories = await db.getAll(FAVORITE_STORE);
    
    return allStories.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  async filterFavoriteStories(filterFn) {
    const db = await this.dbPromise;
    const allStories = await db.getAll(FAVORITE_STORE);
    return allStories.filter(filterFn);
  }

  // Offline Stories Operations (for background sync)
  async addOfflineStory(storyData) {
    const db = await this.dbPromise;
    const offlineStory = {
      ...storyData,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    return db.add(OFFLINE_STORE, offlineStory);
  }

  async getAllOfflineStories() {
    const db = await this.dbPromise;
    return db.getAll(OFFLINE_STORE);
  }

  async getUnsyncedStories() {
    const db = await this.dbPromise;
    const allStories = await db.getAll(OFFLINE_STORE);
    return allStories.filter(story => !story.synced);
  }

  async markStorySynced(id) {
    const db = await this.dbPromise;
    const story = await db.get(OFFLINE_STORE, id);
    if (story) {
      story.synced = true;
      story.syncedAt = new Date().toISOString();
      return db.put(OFFLINE_STORE, story);
    }
  }

  async deleteOfflineStory(id) {
    const db = await this.dbPromise;
    return db.delete(OFFLINE_STORE, id);
  }

  async clearSyncedStories() {
    const db = await this.dbPromise;
    const tx = db.transaction(OFFLINE_STORE, 'readwrite');
    const store = tx.objectStore(OFFLINE_STORE);
    const allStories = await store.getAll();
    
    const deletePromises = allStories
      .filter(story => story.synced)
      .map(story => store.delete(story.id));
    
    await Promise.all(deletePromises);
    return tx.done;
  }

  // Utility methods
  async clearAllData() {
    const db = await this.dbPromise;
    const tx = db.transaction([FAVORITE_STORE, OFFLINE_STORE], 'readwrite');
    await Promise.all([
      tx.objectStore(FAVORITE_STORE).clear(),
      tx.objectStore(OFFLINE_STORE).clear(),
    ]);
    return tx.done;
  }

  async getStorageInfo() {
    const db = await this.dbPromise;
    const favorites = await db.count(FAVORITE_STORE);
    const offline = await db.count(OFFLINE_STORE);
    
    return {
      totalFavorites: favorites,
      totalOfflineStories: offline,
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
    };
  }
}

// Singleton instance
const dbHelper = new IndexedDBHelper();

export default dbHelper;
