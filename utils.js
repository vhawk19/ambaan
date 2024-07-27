// utils.js
export function displayTable(data, outputElement, exportButton) {
  outputElement.style.display = "block";
  if (data.length === 0) {
    outputElement.innerHTML = "This query returned no results.";
    exportButton.style.display = "none";
    return;
  }

  const headers = Object.keys(data[0]);
  let tableHtml = "<table><thead><tr>";
  headers.forEach((header) => {
    tableHtml += `<th>${header}</th>`;
  });
  tableHtml += "</tr></thead><tbody>";

  data.slice(0, 5).forEach((row) => {
    tableHtml += "<tr>";
    headers.forEach((header) => {
      tableHtml += `<td>${row[header]}</td>`;
    });
    tableHtml += "</tr>";
  });

  tableHtml += "</tbody></table>";
  if (data.length > 5) {
    tableHtml += `<p>Showing 5 of ${data.length} rows.</p>`;
  }
  outputElement.innerHTML = tableHtml;
  exportButton.style.display = "inline-block";
}

export function exportCSV(data) {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = Object.keys(data[0]);
  let csvContent = headers.join(",") + "\n";

  data.forEach((row) => {
    const values = headers.map((header) => {
      const cell = row[header] === null ? "" : row[header];
      return typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell;
    });
    csvContent += values.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "query_result.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
