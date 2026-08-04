import { safeStorage } from './storage';

const QUEUE_STORAGE_KEY = '@heno_motita_offline_queue';

export const getPendingQueue = async () => {
  try {
    const json = await safeStorage.getItem(QUEUE_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
};

export const getPendingCount = async () => {
  try {
    const queue = await getPendingQueue();
    return queue.length;
  } catch (error) {
    return 0;
  }
};

export const savePendingInspection = async (inspectionItem) => {
  try {
    const queue = await getPendingQueue();
    const newItem = {
      id: `LOCAL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      syncAttempts: 0,
      ...inspectionItem,
    };
    queue.push(newItem);
    await safeStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return newItem;
  } catch (error) {
    console.error('Error saving inspection to queue:', error);
    throw error;
  }
};

export const updatePendingItem = async (itemId, updates) => {
  try {
    const queue = await getPendingQueue();
    const index = queue.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await safeStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Error updating item in queue:', error);
  }
};

export const clearPendingQueue = async () => {
  try {
    await safeStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
};

export const removePendingItem = async (itemId) => {
  try {
    const queue = await getPendingQueue();
    const updated = queue.filter((item) => item.id !== itemId);
    await safeStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing item from queue:', error);
  }
};
