// IndexedDB Collection for TanStack DB
//
// This module provides IndexedDB-backed collections for TanStack DB,
// enabling persistent local storage with cross-tab synchronization.

// Main factory function and types
export {
  // Database creation
  createIndexedDB,
  type CreateIndexedDBOptions,
  type IndexedDBInstance,
  // Collection options
  indexedDBCollectionOptions,
  type IndexedDBCollectionConfig,
  type IndexedDBCollectionUtils,
  type DatabaseInfo,
  // Configuration errors
  DatabaseRequiredError,
  ObjectStoreNotFoundError,
  NameRequiredError,
  GetKeyRequiredError,
} from './indexeddb'

// Low-level IndexedDB wrapper utilities
export {
  openDatabase,
  createObjectStore,
  executeTransaction,
  getAll,
  getAllKeys,
  getByKey,
  put,
  deleteByKey,
  clear,
  deleteDatabase,
} from './wrapper'

// Error classes
export {
  IndexedDBError,
  IndexedDBNotSupportedError,
  IndexedDBConnectionError,
  IndexedDBTransactionError,
  IndexedDBOperationError,
} from './errors'
