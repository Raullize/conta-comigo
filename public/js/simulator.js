// Variáveis globais
let simulationData = null
let currentPage = 1
const itemsPerPage = 10

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  setupTooltips()
  setupSliders()
  setupMobileMenu()
  setupFormToggle()
  setupUserMenu()
  setupTabs()
  setupValidation()
  updateSliderFills()
  setupPeriodicCalculations()
}

// Event Listeners
function setupEventListeners() {
  // Form submission
  document.getElementById("simulationForm").addEventListener("submit", handleSimulation)

  // Clear button
  document.getElementById("clearBtn").addEventListener("click", clearForm)

  // Radio buttons for aporte type
  document.querySelectorAll('input[name="aporteType"]').forEach((radio) => {
    radio.addEventListener("change", toggleAporteType)
  })

  // Export buttons
  document.getElementById("exportPdfBtn")?.addEventListener("click", exportToPDF)
  document.getElementById("exportCsvBtn")?.addEventListener("click", exportToCSV)

  // Template buttons tirado

  // Summary toggle
  document.getElementById("toggleSummary")?.addEventListener("click", toggleSummary)

  // Table search
  document.getElementById("tableSearch")?.addEventListener("input", filterTable)

  // Pagination
  document.getElementById("prevPage")?.addEventListener("click", () => changePage(-1))
  document.getElementById("nextPage")?.addEventListener("click", () => changePage(1))

  // Real-time validation
  setupRealTimeValidation()
}

// Setup Periodic Calculations
function setupPeriodicCalculations() {
  const valorAporteInput = document.getElementById("valorAporte")
  const frequenciaSelect = document.getElementById("frequencia")
  const prazoSlider = document.getElementById("prazoInvestimento")

  // Update calculations when values change
  valorAporteInput?.addEventListener("input", updatePeriodicPreview)
  frequenciaSelect?.addEventListener("change", updatePeriodicPreview)
  prazoSlider?.addEventListener("input", updatePeriodicPreview)
}

function updatePeriodicPreview() {
  const valorAporte = Number.parseFloat(document.getElementById("valorAporte").value) || 0
  const frequencia = document.getElementById("frequencia").value
  const prazoAnos = Number.parseInt(document.getElementById("prazoInvestimento").value) || 5

  // Update preview values
  document.getElementById("previewValorAporte").textContent = formatCurrency(valorAporte)

  const frequenciaTexts = {
    mensal: "Mensal (12x/ano)",
    bimestral: "Bimestral (6x/ano)",
    trimestral: "Trimestral (4x/ano)",
    semestral: "Semestral (2x/ano)",
    anual: "Anual (1x/ano)",
  }

  document.getElementById("previewFrequencia").textContent = frequenciaTexts[frequencia] || "-"

  // Calculate totals
  const frequenciaMultipliers = {
    mensal: 12,
    bimestral: 6,
    trimestral: 4,
    semestral: 2,
    anual: 1,
  }

  const aportesPorAno = frequenciaMultipliers[frequencia] || 0
  const totalPorAno = valorAporte * aportesPorAno
  const totalNoPeriodo = totalPorAno * prazoAnos

  document.getElementById("previewTotalAno").textContent = formatCurrency(totalPorAno)
  document.getElementById("previewTotalPeriodo").textContent = formatCurrency(totalNoPeriodo)
}

// Mobile Menu
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const sidebar = document.getElementById("sidebar")
  const mobileOverlay = document.getElementById("mobileOverlay")

  mobileMenuBtn?.addEventListener("click", toggleMobileMenu)
  mobileOverlay?.addEventListener("click", closeMobileMenu)

  function toggleMobileMenu() {
    sidebar.classList.toggle("open")
    mobileOverlay.classList.toggle("show")
    document.body.style.overflow = sidebar.classList.contains("open") ? "hidden" : ""
  }

  function closeMobileMenu() {
    sidebar.classList.remove("open")
    mobileOverlay.classList.remove("show")
    document.body.style.overflow = ""
  }
}

// User Menu
function setupUserMenu() {
  const userMenu = document.getElementById("userMenu")
  const userMenuBtn = document.getElementById("userMenuBtn")

  userMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation()
    userMenu.classList.toggle("open")
  })

  document.addEventListener("click", (e) => {
    if (!userMenu?.contains(e.target)) {
      userMenu?.classList.remove("open")
    }
  })

  // Logout functionality
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout)
}

function handleLogout() {
  if (confirm("Tem certeza que deseja sair?")) {
    showToast("Logout realizado com sucesso!", "success")
    // Aqui você implementaria a lógica de logout
  }
}

// Tooltips
function setupTooltips() {
  const tooltip = document.getElementById("tooltip")
  const tooltipBtns = document.querySelectorAll(".tooltip-btn")

  tooltipBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", showTooltip)
    btn.addEventListener("mouseleave", hideTooltip)
    btn.addEventListener("mousemove", moveTooltip)
  })

  function showTooltip(e) {
    const text = e.target.closest(".tooltip-btn").dataset.tooltip
    tooltip.textContent = text
    tooltip.classList.add("show")
    moveTooltip(e)
  }

  function hideTooltip() {
    tooltip.classList.remove("show")
  }

  function moveTooltip(e) {
    const rect = tooltip.getBoundingClientRect()
    const x = e.pageX - rect.width / 2
    const y = e.pageY - rect.height - 15

    tooltip.style.left = Math.max(10, Math.min(x, window.innerWidth - rect.width - 10)) + "px"
    tooltip.style.top = Math.max(10, y) + "px"
  }
}

// Sliders
function setupSliders() {
  const taxaRetornoSlider = document.getElementById("taxaRetorno")
  const prazoInvestimentoSlider = document.getElementById("prazoInvestimento")
  const taxaRetornoValue = document.getElementById("taxaRetornoValue")
  const prazoInvestimentoValue = document.getElementById("prazoInvestimentoValue")

  taxaRetornoSlider?.addEventListener("input", function () {
    taxaRetornoValue.textContent = Number.parseFloat(this.value).toFixed(1)
    updateSliderFill(this)
  })

  prazoInvestimentoSlider?.addEventListener("input", function () {
    prazoInvestimentoValue.textContent = this.value
    updateSliderFill(this)
    updatePeriodicPreview() // Update periodic preview when period changes
  })
}

function updateSliderFills() {
  document.querySelectorAll(".slider").forEach(updateSliderFill)
}

function updateSliderFill(slider) {
  const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100
  const fill = slider.parentElement.querySelector(".slider-fill")
  if (fill) {
    fill.style.width = percent + "%"
  }
}

// Form Toggle
function setupFormToggle() {
  toggleAporteType()
}

function toggleAporteType() {
  const aporteType = document.querySelector('input[name="aporteType"]:checked')?.value
  const aporteUnico = document.getElementById("aporteUnico")
  const aportePeriodico = document.getElementById("aportePeriodico")

  if (aporteType === "unico") {
    aporteUnico.style.display = "block"
    aportePeriodico.style.display = "none"
  } else {
    aporteUnico.style.display = "none"
    aportePeriodico.style.display = "block"
    updatePeriodicPreview() // Update preview when switching to periodic
  }
}

// Tabs
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tabName = e.target.dataset.tab
      if (tabName) {
        switchTab(tabName)
      }
    })
  })
}

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  document.querySelectorAll(".analysis-tabs .tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

  // Add active class to selected tab and content
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active")
  document.getElementById(`${tabName}Tab`)?.classList.add("active")
}

// Validation
function setupValidation() {
  const form = document.getElementById("simulationForm")
  const inputs = form.querySelectorAll("input, select")

  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input))
    input.addEventListener("input", () => clearFieldError(input))
  })
}

function setupRealTimeValidation() {
  const numericInputs = document.querySelectorAll('input[type="number"]')

  numericInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const value = Number.parseFloat(e.target.value)
      const min = Number.parseFloat(e.target.min)
      const max = Number.parseFloat(e.target.max)

      if (value < min || value > max) {
        e.target.classList.add("error")
      } else {
        e.target.classList.remove("error")
      }
    })
  })
}

function validateField(field) {
  const value = field.value.trim()
  const fieldName = field.id
  let isValid = true
  let errorMessage = ""

  // Required field validation
  if (field.hasAttribute("required") && !value) {
    isValid = false
    errorMessage = "Este campo é obrigatório"
  }

  // Specific field validations
  switch (fieldName) {
    case "valorInicial":
    case "valorAporte":
      if (value && Number.parseFloat(value) <= 0) {
        isValid = false
        errorMessage = "O valor deve ser maior que zero"
      }
      break
    case "cotacao":
      if (value && Number.parseFloat(value) <= 0) {
        isValid = false
        errorMessage = "A cotação deve ser maior que zero"
      }
      break
    case "taxaAdm":
      if (value && (Number.parseFloat(value) < 0 || Number.parseFloat(value) > 10)) {
        isValid = false
        errorMessage = "Taxa deve estar entre 0% e 10%"
      }
      break
  }

  showFieldError(field, isValid ? "" : errorMessage)
  return isValid
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(field.id + "Error")
  if (errorElement) {
    errorElement.textContent = message
    errorElement.classList.toggle("show", !!message)
  }
  field.classList.toggle("error", !!message)
}

function clearFieldError(field) {
  showFieldError(field, "")
}

// Simulation Handler
async function handleSimulation(e) {
  e.preventDefault()

  const formData = getFormData()
  if (!validateForm(formData)) {
    return
  }

  showLoading()

  // Simular delay de processamento
  setTimeout(() => {
    const results = calculateInvestment(formData)
    displayResults(results)
    hideLoading()
    showToast("Simulação concluída com sucesso!", "success")
  }, 2000)
}

function getFormData() {
  const aporteType = document.querySelector('input[name="aporteType"]:checked')?.value

  return {
    classeAtivo: document.getElementById("classeAtivo").value,
    aporteType: aporteType,
    valorInicial: Number.parseFloat(document.getElementById("valorInicial").value) || 0,
    valorAporte: Number.parseFloat(document.getElementById("valorAporte").value) || 0,
    frequencia: document.getElementById("frequencia").value,
    dataInicial: document.getElementById("dataInicial").value,
    cotacao: Number.parseFloat(document.getElementById("cotacao").value) || 0,
    taxaRetorno: Number.parseFloat(document.getElementById("taxaRetorno").value),
    prazoInvestimento: Number.parseInt(document.getElementById("prazoInvestimento").value),
    taxaAdm: Number.parseFloat(document.getElementById("taxaAdm").value) || 0,
    corretagem: Number.parseFloat(document.getElementById("corretagem").value) || 0,
    impostoRenda: Number.parseFloat(document.getElementById("impostoRenda").value) || 0,
    inflacao: Number.parseFloat(document.getElementById("inflacao").value) || 4.0,
  }
}

function validateForm(data) {
  let isValid = true
  const errors = []

  if (!data.classeAtivo) {
    errors.push("Por favor, selecione uma classe de ativo.")
    isValid = false
  }

  if (data.aporteType === "unico" && data.valorInicial <= 0) {
    errors.push("Por favor, informe um valor inicial válido.")
    isValid = false
  }

  if (data.aporteType === "periodico") {
    if (data.valorAporte <= 0) {
      errors.push("Por favor, informe um valor de aporte válido.")
      isValid = false
    }
    if (!data.frequencia) {
      errors.push("Por favor, selecione a frequência dos aportes.")
      isValid = false
    }
  }

  if (!isValid) {
    showToast(errors.join(" "), "error")
  }

  return isValid
}

// Investment Calculation
function calculateInvestment(params) {
  const monthlyData = []
  const initialValue = params.aporteType === "unico" ? params.valorInicial : params.valorAporte
  const monthlyReturn = params.taxaRetorno / 100 / 12
  const months = params.prazoInvestimento * 12
  const monthlyInflation = params.inflacao / 100 / 12

  // Frequency multipliers for periodic contributions
  const frequencyMultipliers = {
    mensal: 1,
    bimestral: 2,
    trimestral: 3,
    semestral: 6,
    anual: 12,
  }

  const contributionFrequency = frequencyMultipliers[params.frequencia] || 1

  let currentValue = params.aporteType === "unico" ? initialValue : 0
  let totalInvested = params.aporteType === "unico" ? initialValue : 0
  let totalTaxes = 0

  for (let i = 0; i <= months; i++) {
    // Add periodic contributions
    if (params.aporteType === "periodico" && i > 0 && i % contributionFrequency === 0) {
      currentValue += params.valorAporte
      totalInvested += params.valorAporte
    }

    if (i > 0) {
      // Apply return
      const monthlyGain = currentValue * monthlyReturn
      currentValue += monthlyGain

      // Calculate taxes
      const monthlyTax = monthlyGain * (params.impostoRenda / 100)
      totalTaxes += monthlyTax
    }

    // Calculate real value (adjusted for inflation)
    const realValue = currentValue / Math.pow(1 + monthlyInflation, i)

    // Simulate drawdown
    const drawdown = (Math.random() - 0.5) * 10

    const aporteValue =
      params.aporteType === "periodico" && i > 0 && i % contributionFrequency === 0
        ? params.valorAporte
        : i === 0 && params.aporteType === "unico"
          ? initialValue
          : 0

    monthlyData.push({
      periodo: i,
      aporte: aporteValue,
      saldo: currentValue,
      saldoReal: realValue,
      rendimento: i > 0 ? currentValue - totalInvested : 0,
      drawdown: drawdown,
      totalInvestido: totalInvested,
    })
  }

  const valorFuturo = currentValue
  const totalGanho = valorFuturo - totalInvested
  const rentabilidadeLiquida = ((valorFuturo - totalTaxes - totalInvested) / totalInvested) * 100
  const drawdownMaximo = Math.max(...monthlyData.map((d) => Math.abs(d.drawdown)))
  const valorReal = monthlyData[monthlyData.length - 1].saldoReal

  // Calculate additional metrics
 

  // Calculate scenarios
  const optimisticValue = valorFuturo * 1.2
  const realisticValue = valorFuturo
  const pessimisticValue = valorFuturo * 0.8

  // Calculate multiplier and time to double
  const multiplicadorCapital = valorFuturo / totalInvested
  const tempoDobrar = Math.log(2) / Math.log(1 + params.taxaRetorno / 100)

  return {
    monthlyData,
    valorFuturo,
    cagr: params.taxaRetorno,
    drawdownMaximo,
    rentabilidadeLiquida,
    totalInvestido: totalInvested,
    totalTaxes,
    valorReal,

    optimisticValue,
    realisticValue,
    pessimisticValue,
    multiplicadorCapital,
    tempoDobrar,
    totalGanho,
    params,
  }
}

function calculateVolatility(data) {
  if (data.length < 2) return 0

  const returns = []
  for (let i = 1; i < data.length; i++) {
    const returnRate = (data[i].saldo - data[i - 1].saldo) / data[i - 1].saldo
    returns.push(returnRate)
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length

  return Math.sqrt(variance * 12) * 100 // Annualized volatility
}

function calculateSharpeRatio(expectedReturn, volatility) {
  const riskFreeRate = 10.75 // CDI approximation
  return volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0
}

function calculateVaR(data, confidence = 0.95) {
  const values = data.map((d) => d.saldo).sort((a, b) => a - b)
  const index = Math.floor((1 - confidence) * values.length)
  return values[index] || 0
}

// Display Results
function displayResults(data) {
  simulationData = data

  // Update indicators
  updateIndicators(data)

  // Update summary
  updateSummary(data)

  // Update table
  updateTable(data.monthlyData)

  // Update metrics

  // Update scenarios
  updateScenarios(data)

  // Show results
  document.getElementById("emptyState").style.display = "none"
  document.getElementById("resultsContent").style.display = "block"
  document.getElementById("exportButtons").style.display = "flex"
}

function updateIndicators(data) {
  document.getElementById("valorFuturo").textContent = formatCurrency(data.valorFuturo)
  document.getElementById("cagr").textContent = formatPercent(data.cagr)
  document.getElementById("drawdownMaximo").textContent = formatPercent(data.drawdownMaximo)
  document.getElementById("rentabilidadeLiquida").textContent = formatPercent(data.rentabilidadeLiquida)
  document.getElementById("totalInvestido").textContent = formatCurrency(data.totalInvestido)
  document.getElementById("ganhoTotal").textContent = formatCurrency(data.totalGanho)

  // Update indicator changes
  const gainPercent = ((data.valorFuturo - data.totalInvestido) / data.totalInvestido) * 100
  document.getElementById("valorFuturoChange").textContent = `+${formatPercent(gainPercent)}`
  document.getElementById("ganhoChange").textContent = `+${formatPercent(gainPercent)}`

  // Update progress bars
  updateProgressBar("valorFuturoProgress", gainPercent, 100)
  updateProgressBar("cagrProgress", data.cagr, 30)
  updateProgressBar("drawdownProgress", data.drawdownMaximo, 30)
  updateProgressBar("rentabilidadeProgress", data.rentabilidadeLiquida, 50)

  // Update drawdown warning
  const drawdownIcon = document.getElementById("drawdownIcon")
  const drawdownBadge = document.getElementById("drawdownBadge")

  if (data.drawdownMaximo > 20) {
    drawdownIcon.style.color = "#ef4444"
    drawdownBadge.style.display = "inline-block"
    drawdownBadge.textContent = "Alto Risco"
  } else if (data.drawdownMaximo > 10) {
    drawdownIcon.style.color = "#f59e0b"
    drawdownBadge.style.display = "inline-block"
    drawdownBadge.textContent = "Risco Moderado"
  } else {
    drawdownIcon.style.color = "#10b981"
    drawdownBadge.style.display = "none"
  }
}

function updateProgressBar(id, value, max) {
  const progressBar = document.getElementById(id)
  if (progressBar) {
    const percentage = Math.min((value / max) * 100, 100)
    setTimeout(() => {
      progressBar.style.width = percentage + "%"
    }, 300)
  }
}

function updateSummary(data) {
  document.getElementById("valorReal").textContent = formatCurrency(data.valorReal)
  document.getElementById("totalImpostos").textContent = formatCurrency(data.totalTaxes)
  document.getElementById("multiplicadorCapital").textContent = data.multiplicadorCapital.toFixed(2) + "x"
  document.getElementById("tempoDobrar").textContent = data.tempoDobrar.toFixed(1) + " anos"

  // Update risk assessment
  const riskLevel = document.getElementById("riskLevel")
  const riskIndicator = riskLevel.querySelector(".risk-indicator")
  const riskText = riskLevel.querySelector(".risk-text")

  if (data.drawdownMaximo > 20) {
    riskIndicator.style.background = "#ef4444"
    riskText.textContent = "Alto"
  } else if (data.drawdownMaximo > 10) {
    riskIndicator.style.background = "#f59e0b"
    riskText.textContent = "Moderado"
  } else {
    riskIndicator.style.background = "#10b981"
    riskText.textContent = "Baixo"
  }
}



function updateScenarios(data) {
  document.getElementById("optimisticValue").textContent = formatCurrency(data.optimisticValue)
  document.getElementById("realisticValue").textContent = formatCurrency(data.realisticValue)
  document.getElementById("pessimisticValue").textContent = formatCurrency(data.pessimisticValue)
}

// Table Management
function updateTable(data) {
  const tbody = document.getElementById("resultsTableBody")
  tbody.innerHTML = ""

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayData = data.slice(startIndex, endIndex)

  displayData.forEach((row) => {
    const tr = document.createElement("tr")
    tr.classList.add("fade-in")

    const anos = Math.floor(row.periodo / 12)
    const meses = row.periodo % 12
    const periodo = `${anos}a ${meses}m`

    const drawdownClass = row.drawdown < 0 ? "negative" : "positive"
    const rendimentoClass = row.rendimento >= 0 ? "positive" : "negative"

    tr.innerHTML = `
      <td>${periodo}</td>
      <td>${formatCurrency(row.aporte)}</td>
      <td>${formatCurrency(row.saldo)}</td>
      <td>${formatCurrency(row.saldoReal)}</td>
      <td class="${rendimentoClass}">${formatCurrency(row.rendimento)}</td>
      <td class="${drawdownClass}">${formatPercent(row.drawdown)}</td>
    `

    tbody.appendChild(tr)
  })

  updatePagination(data.length)
}

function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const prevBtn = document.getElementById("prevPage")
  const nextBtn = document.getElementById("nextPage")
  const paginationInfo = document.querySelector(".pagination-info")

  prevBtn.disabled = currentPage === 1
  nextBtn.disabled = currentPage === totalPages

  paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`
}

function changePage(direction) {
  const totalPages = Math.ceil(simulationData.monthlyData.length / itemsPerPage)
  const newPage = currentPage + direction

  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage
    updateTable(simulationData.monthlyData)
  }
}

function filterTable() {
  const searchTerm = document.getElementById("tableSearch").value.toLowerCase()
  const rows = document.querySelectorAll("#resultsTableBody tr")

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(searchTerm) ? "" : "none"
  })
}

// Loading States
function showLoading() {
  const simulateBtn = document.getElementById("simulateBtn")
  const btnText = simulateBtn.querySelector(".btn-text")
  const btnLoading = simulateBtn.querySelector(".btn-loading")

  simulateBtn.disabled = true
  btnText.style.display = "none"
  btnLoading.style.display = "flex"

  document.getElementById("emptyState").style.display = "none"
  document.getElementById("resultsContent").style.display = "none"
  document.getElementById("loadingState").style.display = "block"
}

function hideLoading() {
  const simulateBtn = document.getElementById("simulateBtn")
  const btnText = simulateBtn.querySelector(".btn-text")
  const btnLoading = simulateBtn.querySelector(".btn-loading")

  simulateBtn.disabled = false
  btnText.style.display = "flex"
  btnLoading.style.display = "none"

  document.getElementById("loadingState").style.display = "none"
}

// Clear Form
function clearForm() {
  document.getElementById("simulationForm").reset()

  // Reset sliders
  document.getElementById("taxaRetorno").value = 8
  document.getElementById("prazoInvestimento").value = 5
  document.getElementById("taxaRetornoValue").textContent = "8.0"
  document.getElementById("prazoInvestimentoValue").textContent = "5"

  // Reset aporte type
  document.querySelector('input[name="aporteType"][value="unico"]').checked = true
  toggleAporteType()

  // Clear errors
  document.querySelectorAll(".field-error").forEach((error) => {
    error.classList.remove("show")
  })
  document.querySelectorAll(".form-input, .form-select").forEach((input) => {
    input.classList.remove("error")
  })

  // Update slider fills
  updateSliderFills()

  // Clear results
  simulationData = null
  currentPage = 1

  document.getElementById("resultsContent").style.display = "none"
  document.getElementById("emptyState").style.display = "block"
  document.getElementById("exportButtons").style.display = "none"

  showToast("Formulário limpo com sucesso!", "info")
}

// Template Management tirado 


function loadFormData(data) {
  // Load form data from template
  Object.keys(data).forEach((key) => {
    const element = document.getElementById(key)
    if (element) {
      if (element.type === "radio") {
        document.querySelector(`input[name="${element.name}"][value="${data[key]}"]`).checked = true
      } else if (element.type === "checkbox") {
        element.checked = data[key]
      } else {
        element.value = data[key]
      }
    }
  })

  // Update UI elements
  toggleAporteType()
  updateSliderFills()
  updatePeriodicPreview()
  document.getElementById("taxaRetornoValue").textContent = data.taxaRetorno?.toFixed(1) || "8.0"
  document.getElementById("prazoInvestimentoValue").textContent = data.prazoInvestimento || "5"
}

// Summary Toggle
function toggleSummary() {
  const content = document.getElementById("summaryContent")
  const btn = document.getElementById("toggleSummary")
  const icon = btn.querySelector("i")

  const isVisible = content.style.display !== "none"
  content.style.display = isVisible ? "none" : "block"
  icon.className = isVisible ? "fas fa-chevron-down" : "fas fa-chevron-up"
}

// Export Functions
function exportToPDF() {
  if (!simulationData) {
    showToast("Nenhuma simulação para exportar.", "warning")
    return
  }

  try {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 27, 66) // cc-dark-blue
    doc.text("Relatório de Simulação de Investimentos", 20, 30)

    // Company info
    doc.setFontSize(12)
    doc.setTextColor(54, 179, 126) // cc-green
    doc.text("ContaComigo - Simulador de Investimentos", 20, 45)

    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 55)

    // Results summary
    doc.setFontSize(14)
    doc.setTextColor(0, 27, 66)
    doc.text("Resumo dos Resultados", 20, 75)

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const results = [
      `Valor Futuro: ${formatCurrency(simulationData.valorFuturo)}`,
      `CAGR: ${formatPercent(simulationData.cagr)}`,
      `Drawdown Máximo: ${formatPercent(simulationData.drawdownMaximo)}`,
      `Rentabilidade Líquida: ${formatPercent(simulationData.rentabilidadeLiquida)}`,
      `Total Investido: ${formatCurrency(simulationData.totalInvestido)}`,
      `Valor Real (Inflação): ${formatCurrency(simulationData.valorReal)}`,
    ]

    results.forEach((result, index) => {
      doc.text(result, 20, 90 + index * 10)
    })

    // Parameters
    doc.setFontSize(14)
    doc.setTextColor(0, 27, 66)
    doc.text("Parâmetros Utilizados", 20, 170)

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const params = [
      `Classe de Ativo: ${simulationData.params.classeAtivo}`,
      `Tipo de Aporte: ${simulationData.params.aporteType}`,
      `Taxa de Retorno: ${formatPercent(simulationData.params.taxaRetorno)}`,
      `Prazo: ${simulationData.params.prazoInvestimento} anos`,
      `Inflação: ${formatPercent(simulationData.params.inflacao)}`,
    ]

    params.forEach((param, index) => {
      doc.text(param, 20, 185 + index * 10)
    })

    // Save the PDF
    doc.save(`simulacao-investimentos-${new Date().toISOString().split("T")[0]}.pdf`)
    showToast("PDF exportado com sucesso!", "success")
  } catch (error) {
    console.error("Erro ao exportar PDF:", error)
    showToast("Erro ao exportar PDF. Tente novamente.", "error")
  }
}

function exportToCSV() {
  if (!simulationData) {
    showToast("Nenhuma simulação para exportar.", "warning")
    return
  }

  try {
    let csv = "Período,Aporte,Saldo Nominal,Saldo Real,Rendimento,Drawdown\n"

    simulationData.monthlyData.forEach((row) => {
      const anos = Math.floor(row.periodo / 12)
      const meses = row.periodo % 12
      const periodo = `${anos}a ${meses}m`

      csv += `"${periodo}",${row.aporte.toFixed(2)},${row.saldo.toFixed(2)},${row.saldoReal.toFixed(2)},${row.rendimento.toFixed(2)},${row.drawdown.toFixed(2)}\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simulacao-investimentos-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    showToast("CSV exportado com sucesso!", "success")
  } catch (error) {
    console.error("Erro ao exportar CSV:", error)
    showToast("Erro ao exportar CSV. Tente novamente.", "error")
  }
}

// Toast Notifications
function showToast(message, type = "info") {
  const toast = document.getElementById("toast")
  const icon = toast.querySelector(".toast-icon")
  const messageEl = toast.querySelector(".toast-message")
  const closeBtn = toast.querySelector(".toast-close")

  // Set message
  messageEl.textContent = message

  // Set type and icon
  toast.className = `toast ${type}`

  switch (type) {
    case "success":
      icon.className = "toast-icon fas fa-check-circle"
      break
    case "error":
      icon.className = "toast-icon fas fa-exclamation-circle"
      break
    case "warning":
      icon.className = "toast-icon fas fa-exclamation-triangle"
      break
    default:
      icon.className = "toast-icon fas fa-info-circle"
  }

  // Show toast
  toast.classList.add("show")

  // Auto hide after 5 seconds
  const autoHide = setTimeout(() => {
    hideToast()
  }, 5000)

  // Close button
  closeBtn.onclick = () => {
    clearTimeout(autoHide)
    hideToast()
  }

  function hideToast() {
    toast.classList.remove("show")
  }
}

// Utility Functions
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`
}

function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to simulate
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault()
    document.getElementById("simulateBtn").click()
  }

  // Escape to clear form
  if (e.key === "Escape") {
    // Close modals first
    const modals = document.querySelectorAll(".modal.show")
    if (modals.length > 0) {
      modals.forEach((modal) => modal.classList.remove("show"))
      document.body.style.overflow = ""
    } else {
      // Clear form if no modals open
      clearForm()
    }
  }

})

// Initialize date input with today's date
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dataInicial")
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0]
  }
})

// Performance monitoring
const performanceStart = performance.now()

window.addEventListener("load", () => {
  const loadTime = performance.now() - performanceStart
  console.log(`Página carregada em ${loadTime.toFixed(2)}ms`)
})

// Error handling
window.addEventListener("error", (e) => {
  console.error("Erro na aplicação:", e.error)
  showToast("Ocorreu um erro inesperado. Recarregue a página se o problema persistir.", "error")
})
