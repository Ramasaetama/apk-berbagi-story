const STORAGE_KEY = 'dicoding_stories';

export function getLocalStories() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading local stories:', error);
    return [];
  }
}

export function addLocalStory(story) {
  try {
    const stories = getLocalStories();
    stories.push({
      ...story,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    return stories;
  } catch (error) {
    console.error('Error saving local story:', error);
    return [];
  }
}

export function clearLocalStories() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing local stories:', error);
  }
}

