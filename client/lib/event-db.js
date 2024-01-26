const storeName = 'calendar';
const timestampIndex = 'timestamp-idx';

export async function connect() {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('calendar-store', 1);

    openRequest.onupgradeneeded = function () {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {keyPath: 'uid'});
        store.createIndex(timestampIndex, 'timestamp');
      }
    };

    openRequest.onerror = function () {
      reject(openRequest.error);
    };

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      resolve(new EventDb(db));
    };
  });
}

class EventDb {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async saveEvent(event) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(storeName, 'readwrite');
      const events = transaction.objectStore(storeName);
      const request = events.put(event);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(new Error('Failed to save events'));
      };
    });
  }

  async getEventsBetween(start, end) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(storeName);
      const events = transaction.objectStore(storeName);
      const index = events.index(timestampIndex);
      const request = index.getAll(IDBKeyRange.bound(start, end));
      request.onsuccess = function () {
        resolve(request.result || []);
      };
      request.onerror = function () {
        reject(new Error('query failed'));
      };
    });
  }
}
