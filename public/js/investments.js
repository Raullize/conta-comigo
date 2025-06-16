// Dados dos investimentos (simulando uma base de dados, futuramente isso deve ser substituído por uma API real)
let investments = [
  {
    id: 1,
    name: "PETR4",
    type: "acoes",
    investedAmount: 10000,
    currentValue: 12500,
    applicationDate: "2023-01-15",
    institution: "XP Investimentos",
  },
  {
    id: 2,
    name: "Tesouro IPCA+ 2029",
    type: "renda-fixa",
    investedAmount: 25000,
    currentValue: 26800,
    applicationDate: "2022-06-10",
    institution: "Tesouro Direto",
  },
  {
    id: 3,
    name: "HASH11",
    type: "fiis",
    investedAmount: 15000,
    currentValue: 14200,
    applicationDate: "2023-03-20",
    institution: "Inter",
  },
  {
    id: 4,
    name: "Bitcoin",
    type: "cripto",
    investedAmount: 5000,
    currentValue: 7800,
    applicationDate: "2023-05-01",
    institution: "Binance",
  },
  {
    id: 5,
    name: "Fundo Multimercado XP",
    type: "fundos",
    investedAmount: 20000,
    currentValue: 21500,
    applicationDate: "2022-12-05",
    institution: "XP Investimentos",
  },
]

let currentEditingId = null
let filteredInvestments = [...investments]

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadInvestments()
  updateSummary()
  setupCurrencyMask()
  setupMobileMenu()
  setupUserMenu()
})

// Carregar e exibir investimentos
function loadInvestments() {
  const grid = document.getElementById("investmentsGrid")
  const emptyState = document.getElementById("emptyState")
  const container = document.querySelector(".investments-container")

  if (filteredInvestments.length === 0) {
    container.style.display = "none"
    emptyState.style.display = "block"
    return
  }

  container.style.display = "block"
  emptyState.style.display = "none"

  grid.innerHTML = filteredInvestments
    .map((investment) => {
      const returnValue = investment.currentValue - investment.investedAmount
      const returnPercent = ((returnValue / investment.investedAmount) * 100).toFixed(2)
      const isPositive = returnValue >= 0
      const cardClass = isPositive ? "positive" : "negative"

      return `
        <div class="investment-card ${cardClass}">
            <div class="investment-header">
                <div class="investment-info">
                    <h3>${investment.name}</h3>
                    <span class="investment-type">${getTypeLabel(investment.type)}</span>
                </div>
                <div class="investment-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); deleteInvestment(${investment.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="investment-values">
                <div class="value-item">
                    <div class="value-label">Valor Investido</div>
                    <div class="value-amount">${formatCurrency(investment.investedAmount)}</div>
                </div>
                <div class="value-item">
                    <div class="value-label">Valor Atual</div>
                    <div class="value-amount">${formatCurrency(investment.currentValue)}</div>
                </div>
            </div>
            
            <div class="investment-return">
                <span class="return-label">Rentabilidade</span>
                <span class="return-value ${isPositive ? "positive" : "negative"}">
                    <i class="fas fa-${isPositive ? "arrow-up" : "arrow-down"}"></i>
                    ${isPositive ? "+" : ""}${returnPercent}%
                </span>
            </div>
            
            <div class="investment-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(investment.applicationDate)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-building"></i>
                    <span>${investment.institution || "N/A"}</span>
                </div>
            </div>
        </div>
      `
    })
    .join("")
}

// Atualizar resumo com estilo ContaComigo
function updateSummary() {
  const totalInvestido = investments.reduce((sum, inv) => sum + inv.investedAmount, 0)
  const valorAtual = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const ganhoPerda = valorAtual - totalInvestido
  const rentabilidadeTotal = totalInvestido > 0 ? ((ganhoPerda / totalInvestido) * 100).toFixed(2) : 0

  document.getElementById("totalInvestido").textContent = formatCurrency(totalInvestido)
  document.getElementById("valorAtual").textContent = formatCurrency(valorAtual)
  document.getElementById("ganhoPerda").textContent = formatCurrency(ganhoPerda)
  document.getElementById("rentabilidadeTotal").textContent = `${rentabilidadeTotal}%`

  // Aplicar classes de cor aos elementos de mudança
  const rentabilidadeChange = document.getElementById("rentabilidadeChange")
  const ganhoChange = document.getElementById("ganhoChange")

  if (ganhoPerda >= 0) {
    rentabilidadeChange.className = "summary-change positive"
    ganhoChange.className = "summary-change positive"
    rentabilidadeChange.innerHTML = '<i class="fas fa-trending-up"></i><span>Performance positiva</span>'
    ganhoChange.innerHTML = '<i class="fas fa-trophy"></i><span>Lucro obtido</span>'
  } else {
    rentabilidadeChange.className = "summary-change negative"
    ganhoChange.className = "summary-change negative"
    rentabilidadeChange.innerHTML = '<i class="fas fa-trending-down"></i><span>Performance negativa</span>'
    ganhoChange.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Prejuízo registrado</span>'
  }
}

// Filtrar investimentos
function filterInvestments() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const typeFilter = document.getElementById("typeFilter").value

  filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      investment.name.toLowerCase().includes(searchTerm) || investment.institution.toLowerCase().includes(searchTerm)

    const matchesType = !typeFilter || investment.type === typeFilter

    return matchesSearch && matchesType
  })

  loadInvestments()
}

// Ordenar investimentos
function sortInvestments() {
  const sortBy = document.getElementById("sortBy").value

  filteredInvestments.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "value":
        return b.currentValue - a.currentValue
      case "return":
        const returnA = ((a.currentValue - a.investedAmount) / a.investedAmount) * 100
        const returnB = ((b.currentValue - b.investedAmount) / b.investedAmount) * 100
        return returnB - returnA
      case "date":
        return new Date(b.applicationDate) - new Date(a.applicationDate)
      default:
        return 0
    }
  })

  loadInvestments()
}


// Salvar investimento
function saveInvestment(event) {
  event.preventDefault()

  const formData = {
    name: document.getElementById("investmentName").value,
    type: document.getElementById("investmentType").value,
    investedAmount: parseCurrency(document.getElementById("investedAmount").value),
    currentValue: parseCurrency(document.getElementById("currentValue").value),
    applicationDate: document.getElementById("applicationDate").value,
    institution: document.getElementById("institution").value,
  }

  if (currentEditingId) {
    // Editar existente
    const index = investments.findIndex((inv) => inv.id === currentEditingId)
    investments[index] = { ...investments[index], ...formData }
  } else {
    // Adicionar novo
    const newId = Math.max(...investments.map((inv) => inv.id), 0) + 1
    investments.push({ id: newId, ...formData })
  }

  closeModal()
  filterInvestments()
  updateSummary()
  showNotification(currentEditingId ? "Investimento atualizado!" : "Investimento adicionado!")
}

// Excluir investimento
function deleteInvestment(id) {
  const investment = investments.find((inv) => inv.id === id)
  if (!investment) return

  if (confirm(`Excluir "${investment.name}"?`)) {
    investments = investments.filter((inv) => inv.id !== id)
    filterInvestments()
    updateSummary()
    showNotification("Investimento excluído!")
  }
}

// Fechar modal
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active")
  currentEditingId = null
}

// Configurar máscara de moeda
function setupCurrencyMask() {
  const currencyInputs = ["investedAmount", "currentValue"]

  currencyInputs.forEach((inputId) => {
    const input = document.getElementById(inputId)
    if (input) {
      input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "")
        value = (value / 100).toFixed(2)
        e.target.value = formatCurrency(Number.parseFloat(value))
      })
    }
  })
}

// Funções utilitárias
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function parseCurrency(value) {
  return Number.parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

function getTypeLabel(type) {
  const labels = {
    acoes: "Ações",
    "renda-fixa": "Renda Fixa",
    fundos: "Fundos",
    fiis: "FIIs",
    cripto: "Criptomoedas",
  }
  return labels[type] || type
}

// Função de notificação estilo ContaComigo
function showNotification(message, type = "success") {
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

// Setup mobile menu (reutilizado do padrão)
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

// Setup user menu (reutilizado do padrão)
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
}

// Toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  sidebar.classList.toggle("collapsed")
}
