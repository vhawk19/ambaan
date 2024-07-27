// utils.js
const ROWS_PER_PAGE = 5 // This should match the value in queryBlocks.js
const MAX_VISIBLE_PAGES = 5 // Maximum number of page numbers to show

export function displayTable(
  data,
  outputElement,
  exportButton,
  blockId,
  currentPage
) {
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  const pageData = data.slice(startIndex, endIndex)

  if (pageData.length === 0) {
    outputElement.innerHTML = '<p>No data to display on this page.</p>'
    return
  }

  const headers = Object.keys(pageData[0])
  let tableHtml = "<table class='result-table'><thead><tr>"
  headers.forEach((header) => {
    tableHtml += `<th>${header}</th>`
  })
  tableHtml += '</tr></thead><tbody>'

  pageData.forEach((row) => {
    tableHtml += '<tr>'
    headers.forEach((header) => {
      tableHtml += `<td>${row[header] !== null ? row[header] : ''}</td>`
    })
    tableHtml += '</tr>'
  })

  tableHtml += '</tbody></table>'
  outputElement.innerHTML = tableHtml
  exportButton.style.display = 'inline-block'

  // Add pagination
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE)
  const paginationElement = document.getElementById(`${blockId}-pagination`)
  paginationElement.innerHTML = createPaginationHTML(
    blockId,
    currentPage,
    totalPages
  )

  console.log(
    `Displaying page ${currentPage} of ${totalPages}. Showing ${pageData.length} rows.`
  )
}

function createPaginationHTML(blockId, currentPage, totalPages) {
  let paginationHtml = ''

  // Previous button
  if (currentPage > 1) {
    paginationHtml += `<button onclick="changePage('${blockId}', ${
      currentPage - 1
    }, ${totalPages})">Previous</button>`
  }

  // Page numbers
  const startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2))
  const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1)

  for (let i = startPage; i <= endPage; i++) {
    paginationHtml += `<button onclick="changePage('${blockId}', ${i}, ${totalPages})" ${
      i === currentPage ? 'class="active"' : ''
    }>${i}</button>`
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHtml += `<button onclick="changePage('${blockId}', ${
      currentPage + 1
    }, ${totalPages})">Next</button>`
  }

  // Last page button
  if (currentPage < totalPages) {
    paginationHtml += `<button onclick="changePage('${blockId}', ${totalPages}, ${totalPages})">Last</button>`
  }

  return paginationHtml
}

export function changePage(blockId, newPage, totalPages) {
  const outputElement = document.getElementById(`${blockId}-output`)
  const exportButton = document.getElementById(`${blockId}-export`)
  const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')

  displayTable(data, outputElement, exportButton, blockId, newPage)
}

export function exportCSV(data) {
  if (!data || data.length === 0) {
    alert('No data to export.')
    return
  }

  const headers = Object.keys(data[0])
  let csvContent = headers.join(',') + '\n'

  data.forEach((row) => {
    const values = headers.map((header) => {
      const cell = row[header] === null ? '' : row[header]
      return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
    })
    csvContent += values.join(',') + '\n'
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'query_result.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
