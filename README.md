
# Ambaan
*just wants the average analyst to be happi*

## Contents
- [Project Overview](#project-overview)
- [How to Clone and Run](#how-to-clone-and-run)
- [What It Achieves](#what-it-achieves)
- [Why This Project](#why-this-project)
- [Features](#features)
- [License](#license)
- [Contributions](#contributions)


## Project Overview
Data analysis can get messy really quickly. Ambaan is a simple tool that allows you to import csv/parquet files, run sql queries on them, create simple visualisations and export them as pdfs. It is entirely client side and does not require a server. It uses duckdb-wasm to run sql queries on the browser.

## How to Clone and Run:
   ```bash
   git clone https://github.com/vhawk19/ambaan
   cd ambaan
   pnpm dev
   ```
## Goals
- To provide a simpe straightforward query interface for csv/parquer and other commonly used analytical data formats.
- Help you make transforms and reduction using sql.
- Create simple visualisations/charts and export them.
- Make it easy for folks to view and analyse while writing minimal code.
- No need for a server, it should be entirely client side.
- Simple and easy for anyone to clone and try.
## Anti Goals
- Create a full fledged BI tool/ETL tool.
- Create dashboards can be used for sharing [Not within the scope of this project]
- Support dynamic data.
- Scheduled refreshes.
## Why
- There is no easy way to query/transform csv files all locally using sql
- While there are existing tools allow you to do them over server, the few ones that do it entirely locally do not support simple dashboard visualisations/pdf exports.
- DuckDb is a fairly mature software that allows you to run complex sql on the browser using duckdb wasm, this enables us to work solely on the ux layer, and push all the heavy lifting to duck db.
## Features
- Import csv/parquet files or any remote data supported by duckdb-wasm
- Analyse the data
- Do simple transformations
- Create simple visualisations
- Export the visualisations as pdf
- Export the data as csv
## License
- The project is licensed under GPL-3.0. You can use it for free, modify it, and distribute it as long as you keep the license intact.
## Contributions
- Ambaan is a project, and contributions are welcome. Note that this a small project and the goal is to keep it simple and easy to use. 
- If you have a feature request, please open an issue. If you have a bug fix, please open a PR.
- If you have a feature you want to add, please open an issue and discuss it before opening a PR.
- Check out the [CONTRIBUTING.md](CONTRIBUTING.md) for more details