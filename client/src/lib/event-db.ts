import {Event} from './model';
const storeName = 'calendar';
const timestampIndex = 'timestamp-idx';

export async function connect(): Promise<EventDb> {
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
  #db: IDBDatabase;
  constructor(db: IDBDatabase) {
    this.#db = db;
  }

  async saveEvent(event: Event): Promise<void> {
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

  async getEventsBetween(start: number, end: number): Promise<Event[]> {
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
