// visualization.js
import Chart from 'chart.js/auto'

export function createVisualization(container, data, chartType, xAxis, yAxis) {
  if (container.chart) {
    container.chart.destroy()
  }

  if (chartType === 'counter') {
    createCounter(container, data, yAxis)
  } else {
    createChart(container, data, chartType, xAxis, yAxis)
  }
}
function createCounter(container, data, yAxis) {
  container.innerHTML = ''
  const counterDiv = document.createElement('div')
  counterDiv.className = 'counter'
  const value = data.reduce(
    (sum, item) => sum + parseFloat(item[yAxis] || 0),
    0
  )
  counterDiv.textContent = value.toLocaleString()
  container.appendChild(counterDiv)
}
function createChart(container, data, chartType, xAxis, yAxis) {
  const ctx = document.createElement('canvas')
  container.innerHTML = ''
  container.appendChild(ctx)

  const xValues = data.map((item) => item[xAxis])
  const yValues = data.map((item) => parseFloat(item[yAxis]))

  let chartConfig = {
    type: chartType,
    data: {
      labels: xValues,
      datasets: [
        {
          label: yAxis,
          data: yValues,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  }

  // Adjustments for specific chart types
  if (chartType === 'pie') {
    chartConfig.data.datasets[0].backgroundColor = xValues.map(
      () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, 0.6)`
    )
    delete chartConfig.options.scales
  } else if (chartType === 'scatter') {
    chartConfig.data.datasets[0].data = data.map((item) => ({
      x: parseFloat(item[xAxis]),
      y: parseFloat(item[yAxis]),
    }))
    chartConfig.data.labels = null
  }

  container.chart = new Chart(ctx, chartConfig)
}
