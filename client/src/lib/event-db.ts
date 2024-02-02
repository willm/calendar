import {RemoteCalendar, SerialisedEvent} from './model';
const eventStoreName = 'events';
const dbName = 'calendar';
const calendarStoreName = 'calendar';
const timestampIndex = 'timestamp-idx';

export async function connect(): Promise<EventStore> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(dbName, 1);

    openRequest.onupgradeneeded = function () {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(eventStoreName)) {
        const store = db.createObjectStore(eventStoreName, {keyPath: 'uid'});
        store.createIndex(timestampIndex, 'timestamp');
      }
      if (!db.objectStoreNames.contains(calendarStoreName)) {
        db.createObjectStore(calendarStoreName, {keyPath: 'uid'});
      }
    };

    openRequest.onerror = function () {
      reject(openRequest.error);
    };

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      resolve(new IndexedDBEventStore(db));
    };
  });
}

export interface EventStore {
  getCalendars: () => Promise<RemoteCalendar[]>;
  saveCalendar: (calendar: RemoteCalendar) => Promise<void>;
  saveEvent: (event: SerialisedEvent) => Promise<void>;
  getEventsBetween: (start: number, end: number) => Promise<SerialisedEvent[]>;
}

class IndexedDBEventStore implements EventStore {
  #db: IDBDatabase;
  constructor(db: IDBDatabase) {
    this.#db = db;
  }

  async #save<T>(storeName: string, entity: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(storeName, 'readwrite');
      const entities = transaction.objectStore(storeName);
      const request = entities.put(entity);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(new Error('Failed to save entity'));
      };
    });
  }

  async getCalendars(): Promise<RemoteCalendar[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(calendarStoreName);
      const calendars = transaction.objectStore(calendarStoreName);
      const request = calendars.getAll();
      request.onsuccess = function () {
        resolve(request.result || []);
      };
      request.onerror = function () {
        reject(new Error('query failed'));
      };
    });
  }

  async saveCalendar(calendar: RemoteCalendar): Promise<void> {
    return this.#save(calendarStoreName, calendar);
  }

  async saveEvent(event: SerialisedEvent): Promise<void> {
    return this.#save(eventStoreName, event);
  }

  async getEventsBetween(
    start: number,
    end: number
  ): Promise<SerialisedEvent[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(eventStoreName);
      const events = transaction.objectStore(eventStoreName);
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
