import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'
import duckdb_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_eh,
    mainWorker: eh_worker,
  },
}

export class DuckDBService {
  private static instance: DuckDBService
  private db: duckdb.AsyncDuckDB | null = null
  private conn: duckdb.AsyncDuckDBConnection | null = null
  private isInitializing = false

  private constructor() {}

  static getInstance(): DuckDBService {
    if (!DuckDBService.instance) {
      DuckDBService.instance = new DuckDBService()
    }
    return DuckDBService.instance
  }

  async init(): Promise<void> {
    if (this.db || this.isInitializing) return

    this.isInitializing = true
    try {
      // Select bundle based on browser support
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
      
      const worker = new Worker(bundle.mainWorker!)
      const logger = new duckdb.ConsoleLogger()
      this.db = new duckdb.AsyncDuckDB(logger, worker)
      
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      this.conn = await this.db.connect()
      
      console.log('DuckDB initialized successfully')
    } catch (error) {
      console.error('DuckDB initialization failed:', error)
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  async loadCSV(file: File, tableName: string = 'raw_data'): Promise<void> {
    if (!this.db || !this.conn) await this.init()

    try {
      await this.db!.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true)
      
      // Drop table if exists
      await this.conn!.query(`DROP TABLE IF EXISTS ${tableName}`)
      
      // Create table from CSV
      await this.conn!.query(`
        CREATE TABLE ${tableName} AS 
        SELECT * FROM read_csv_auto('${file.name}', header=true)
      `)
      
      console.log(`Loaded CSV into DuckDB table: ${tableName}`)
    } catch (error) {
      console.error('Failed to load CSV into DuckDB:', error)
      throw error
    }
  }

  async query(sql: string): Promise<any[]> {
    if (!this.conn) await this.init()
    
    try {
      const result = await this.conn!.query(sql)
      return result.toArray().map(row => row.toJSON())
    } catch (error) {
      console.error('DuckDB query failed:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.conn) {
      await this.conn.close()
      this.conn = null
    }
    if (this.db) {
      await this.db.terminate()
      this.db = null
    }
  }
}

export const duckDBService = DuckDBService.getInstance()
