import Chart from 'chart.js/auto'

export function createVisualization(container, data, chartType, xAxis, yAxis) {
  console.log('Creating visualization:', {
    container,
    data,
    chartType,
    xAxis,
    yAxis,
  })

  // Clear the container first
  container.innerHTML = ''

  if (chartType === 'counter') {
    createCounter(container, data, yAxis)
  } else {
    createChart(container, data, chartType, xAxis, yAxis)
  }
}

function createCounter(container, data, yAxis) {
  // ... (keep existing counter creation code) ...
}

function createChart(container, data, chartType, xAxis, yAxis) {
  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  const xValues = data.map((item) => item[xAxis])
  const yValues = data.map((item) => parseFloat(item[yAxis]))

  console.log('Chart data:', { xValues, yValues, chartType })

  let chartConfig = {
    type: chartType,
    data: {
      labels: xValues,
      datasets: [
        {
          label: yAxis,
          data: yValues,
          backgroundColor:
            chartType === 'pie'
              ? xValues.map(
                  () =>
                    `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                )
              : 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

  if (chartType !== 'pie') {
    chartConfig.options.scales = {
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
    }
  }

  if (chartType === 'scatter') {
    chartConfig.data.datasets[0].data = data.map((item) => ({
      x: parseFloat(item[xAxis]),
      y: parseFloat(item[yAxis]),
    }))
    chartConfig.data.labels = null
  }

  console.log('Chart config:', chartConfig)
  new Chart(canvas, chartConfig)
}
