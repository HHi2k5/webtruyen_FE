const HISTORY_KEY = 'webtruyen_reading_history';

export const saveToHistory = (story, chapter) => {
  if (!story || !chapter) return;
  
  const history = getHistory();
  const newEntry = {
    storyId: story.id,
    title: story.title,
    coverUrl: story.coverUrl,
    chapterNumber: chapter.chapter_number,
    lastReadAt: new Date().getTime()
  };

  // Remove existing entry for this story if it exists
  const filteredHistory = history.filter(item => item.storyId !== story.id);
  
  // Add new entry to the top
  const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10); // Keep last 10
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const getHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    return [];
  }
};
