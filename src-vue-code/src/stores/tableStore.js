import { defineStore } from 'pinia'
import { db } from '../duck'

export const useTableStore = defineStore('table', () => {
  async function showSchema(tableName) {
    try {
      const result = await db.query(`DESCRIBE ${tableName}`)
      return result.toArray()
    } catch (error) {
      console.error('Error fetching schema:', error)
      throw error
    }
  }

  async function renameTable(oldTableName, newTableName) {
    try {
      await db.query(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName}`)
      return `Table renamed from ${oldTableName} to ${newTableName}`
    } catch (error) {
      console.error('Error renaming table:', error)
      throw error
    }
  }

  return { showSchema, renameTable }
})
