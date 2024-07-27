import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_next from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

import { updateFileList } from "./dataCatalog.js";

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_next,
    mainWorker: eh_worker,
  },
};

export let db, conn;
export let importedFiles = [];

export async function initDB() {
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  conn = await db.connect();
}

export async function importFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file to import.");
    return;
  }

  const fileName = file.name;
  const fileExtension = fileName.split(".").pop().toLowerCase();
  const tableName = fileName.split(".")[0].replace(/\W/g, "_");

  try {
    const fileBuffer = await file.arrayBuffer();

    if (fileExtension === "csv") {
      await db.registerFileBuffer(fileName, new Uint8Array(fileBuffer));
      await conn.query(
        `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}', AUTO_DETECT=TRUE);`,
      );
    } else if (fileExtension === "parquet") {
      await db.registerFileBuffer(fileName, new Uint8Array(fileBuffer));
      await conn.query(
        `CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${fileName}');`,
      );
    } else {
      throw new Error(
        "Unsupported file format. Please use CSV or Parquet files.",
      );
    }

    importedFiles.push({ fileName, tableName });
    updateFileList();
    alert(`File "${fileName}" imported successfully as table "${tableName}".`);
  } catch (error) {
    console.error("Import error:", error);
    alert(`Error importing file: ${error.message}`);
  }
}
