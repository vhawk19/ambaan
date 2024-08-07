import { defineStore } from 'pinia'
import { conn } from '../duck'

export const useTableStore = defineStore('table', () => {
  async function showSchema(tableName) {
    try {
      const result = await conn.query(`DESCRIBE ${tableName}`)
      console.log("res", result.toArray())
      // return result.toArray()
      const plainResult = result.toArray().map(row => {
        const plainRow = {}
        for (const key in row){
          plainRow[key] = row[key]
        }
        return plainRow
      })
      console.log(plainResult)
      return plainResult

    } catch (error) {
      console.error('Error fetching schema:', error)
      throw error
    }
  }

  async function renameTable(oldTableName, newTableName) {
    try {
      await conn.query(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName}`)
      return `Table renamed from ${oldTableName} to ${newTableName}`
    } catch (error) {
      console.error('Error renaming table:', error)
      throw error
    }
  }

  return { showSchema, renameTable }
})
