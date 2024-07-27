import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

export default defineNuxtPlugin({
    name: 'duck',
    enforce: 'pre', // or 'post'
    async setup (nuxtApp) {
        const MANUAL_BUNDLES = {
            mvp: {
                mainModule: duckdb_wasm,
                mainWorker: mvp_worker,
            },
            eh: {
                mainModule: duckdb_wasm_eh,
                mainWorker: eh_worker,
            },
        };
        // Select a bundle based on browser checks
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        // Instantiate the asynchronus version of DuckDB-wasm
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        const conn = await db.connect(); // Connect to db
        // return {conn, db}
    },
    hooks: {
      // You can directly register Nuxt app runtime hooks here
      'app:created'() {
        const nuxtApp = useNuxtApp()
        // do something in the hook
      }
    },
    env: {
      // Set this value to `false` if you don't want the plugin to run when rendering server-only or island components.
      islands: true
    }
  })
  