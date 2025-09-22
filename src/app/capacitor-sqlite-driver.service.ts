import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

// Custom Capacitor SQLite driver for localforage
export const CapacitorSqliteDriverService = {
  _driver: 'capacitorSQLiteDriver',
  _initStorage: function(options: any) {
    console.log('CapacitorSQLiteDriver: _initStorage called with options:', options);

    // Initialize the SQLite connection
    const sqlite = new SQLiteConnection(CapacitorSQLite);

    return new Promise((resolve, reject) => {
      const dbName = options.name || 'localforage';
      const version = options.version || 1;
      const storeName = options.storeName || 'keyvaluepairs';

      console.log(`CapacitorSQLiteDriver: Opening database ${dbName} version ${version} with store: ${storeName}`);

      sqlite.createConnection(dbName, false, 'no-encryption', version, false)
        .then((db: SQLiteDBConnection) => {
          console.log('CapacitorSQLiteDriver: Database connection created successfully');

          // IMPORTANT: Open the database before executing any SQL
          return db.open().then(() => {
            console.log('CapacitorSQLiteDriver: Database opened successfully');

            // Create the key-value table if it doesn't exist - use storeName as table name
            const createTableSQL = `
              CREATE TABLE IF NOT EXISTS "${storeName}" (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT
              )
            `;

            return db.execute(createTableSQL).then(() => {
              console.log(`CapacitorSQLiteDriver: Table "${storeName}" created successfully`);

              // Store the database connection and table name for later use
              (this as any)._db = db;
              (this as any)._storeName = storeName;
              resolve(undefined);
            });
          });
        })
        .catch((error: any) => {
          console.error('CapacitorSQLiteDriver: Database initialization failed:', error);
          reject(error);
        });
    });
  },

  _support: function() {
    console.log('CapacitorSQLiteDriver: _support() called');

    // Check if we're in a Capacitor environment and SQLite is available
    return new Promise((resolve) => {
      try {
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
          // Test if CapacitorSQLite is available
          CapacitorSQLite.echo({ value: 'support-test' })
            .then(() => {
              console.log('CapacitorSQLiteDriver: Support check passed');
              resolve(true);
            })
            .catch((error) => {
              console.warn('CapacitorSQLiteDriver: Support check failed:', error);
              resolve(false);
            });
        } else {
          console.log('CapacitorSQLiteDriver: Not in Capacitor environment');
          resolve(false);
        }
      } catch (error) {
        console.warn('CapacitorSQLiteDriver: Support check error:', error);
        resolve(false);
      }
    });
  },

  getItem: function(key: string) {
    console.log(`CapacitorSQLiteDriver: getItem called for key: ${key}`);

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT value FROM "${storeName}" WHERE key = ?`;
      db.query(sql, [key])
        .then((result: any) => {
          if (result.values && result.values.length > 0) {
            const value = result.values[0].value;
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(value);
              resolve(parsed);
            } catch {
              // If not JSON, return as string
              resolve(value);
            }
          } else {
            resolve(null);
          }
        })
        .catch(reject);
    });
  },

  setItem: function(key: string, value: any) {
    console.log(`CapacitorSQLiteDriver: setItem called for key: ${key}`);

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // Serialize the value
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

      const sql = `INSERT OR REPLACE INTO "${storeName}" (key, value) VALUES (?, ?)`;
      db.run(sql, [key, serializedValue])
        .then(() => resolve(value))
        .catch(reject);
    });
  },

  removeItem: function(key: string) {
    console.log(`CapacitorSQLiteDriver: removeItem called for key: ${key}`);

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `DELETE FROM "${storeName}" WHERE key = ?`;
      db.run(sql, [key])
        .then(() => resolve(undefined))
        .catch(reject);
    });
  },

  clear: function() {
    console.log('CapacitorSQLiteDriver: clear called');

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `DELETE FROM "${storeName}"`;
      db.run(sql, [])
        .then(() => resolve(undefined))
        .catch(reject);
    });
  },

  length: function() {
    console.log('CapacitorSQLiteDriver: length called');

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT COUNT(*) as count FROM "${storeName}"`;
      db.query(sql, [])
        .then((result: any) => {
          const count = result.values && result.values.length > 0 ? result.values[0].count : 0;
          resolve(count);
        })
        .catch(reject);
    });
  },

  key: function(n: number) {
    console.log(`CapacitorSQLiteDriver: key called for index: ${n}`);

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT key FROM "${storeName}" LIMIT 1 OFFSET ?`;
      db.query(sql, [n])
        .then((result: any) => {
          if (result.values && result.values.length > 0) {
            resolve(result.values[0].key);
          } else {
            resolve(null);
          }
        })
        .catch(reject);
    });
  },

  keys: function() {
    console.log('CapacitorSQLiteDriver: keys called');

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT key FROM "${storeName}"`;
      db.query(sql, [])
        .then((result: any) => {
          const keys = result.values ? result.values.map((row: any) => row.key) : [];
          resolve(keys);
        })
        .catch(reject);
    });
  },

  iterate: function(iteratorCallback: (value: any, key: string, iterationNumber: number) => any) {
    console.log('CapacitorSQLiteDriver: iterate called');

    return new Promise((resolve, reject) => {
      const db = (this as any)._db;
      const storeName = (this as any)._storeName || 'keyvaluepairs';
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT key, value FROM "${storeName}"`;
      db.query(sql, [])
        .then((result: any) => {
          if (result.values) {
            let iterationNumber = 1;
            for (const row of result.values) {
              try {
                const value = JSON.parse(row.value);
                const callbackResult = iteratorCallback(value, row.key, iterationNumber);

                // If callback returns non-undefined, break iteration
                if (callbackResult !== undefined) {
                  resolve(callbackResult);
                  return;
                }
              } catch {
                // If not JSON, use as string
                const callbackResult = iteratorCallback(row.value, row.key, iterationNumber);
                if (callbackResult !== undefined) {
                  resolve(callbackResult);
                  return;
                }
              }
              iterationNumber++;
            }
          }
          resolve(undefined);
        })
        .catch(reject);
    });
  }
};
