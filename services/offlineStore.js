import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@heno_motita_offline_queue';

export const getPendingQueue = async () => {
  try {
    const json = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
};

export const savePendingInspection = async (inspectionItem) => {
  try {
    const queue = await getPendingQueue();
    const newItem = {
      id: `LOCAL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...inspectionItem,
    };
    queue.push(newItem);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return newItem;
  } catch (error) {
    console.error('Error saving inspection to queue:', error);
    throw error;
  }
};

export const clearPendingQueue = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
};

export const removePendingItem = async (itemId) => {
  try {
    const queue = await getPendingQueue();
    const updated = queue.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing item from queue:', error);
  }
};
