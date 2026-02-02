/**
 * Simulador Salário Líquido Portugal 2024/2025
 * Complete rewrite with all features
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============================================
// Configuration & Constants
// ============================================

const CONFIG = {
  SALARIO_MINIMO_2024: 820,
  SALARIO_MINIMO_2025: 870,
  SS_TAXA_EMPREGADO: 0.11,
  SS_TAXA_EMPREGADOR: 0.2375,
  SS_TAXA_INDEPENDENTE: 0.214,
  DIAS_TRABALHO_MES: 22,
  SUBSIDIO_ALIMENTACAO_ISENTO_DINHEIRO: 6.00,
  SUBSIDIO_ALIMENTACAO_ISENTO_CARTAO: 10.20,
  IRS_JOVEM_LIMITE_ANUAL: 28737.50, // 50 x IAS
  VIATURA_TAXA_MENSAL: 0.0075, // 0.75% do valor por mês
  DEBOUNCE_DELAY: 300,
};

// Supabase initialization
const supabaseUrl = 'https://lauaziguiohgnbidupoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdWF6aWd1aW9oZ25iaWR1cG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNzU1MzAsImV4cCI6MjA0MzY1MTUzMH0.MqT20CxX2kyo5mbIm2ijLc7p-LM4Xi2Tc-BIDi4W1ac';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// IRS Tables 2024/2025
// ============================================

// IRS tables for Não Casado sem Dependentes ou Casado 2 Titulares
const tabelasIRS_NaoCasado = [
  { limiteSuperior: 820, taxaMarginal: 0.00, parcelaAbater: 0.00, parcelaDependente: 0.00 },
  { limiteSuperior: 935, taxaMarginal: 0.13, parcelaAbater: (R) => 0.13 * 2.6 * (1135.39 - R), parcelaDependente: 21.43 },
  { limiteSuperior: 989, taxaMarginal: 0.165, parcelaAbater: (R) => 0.165 * 1.35 * (1386.11 - R), parcelaDependente: 21.43 },
  { limiteSuperior: 1125, taxaMarginal: 0.165, parcelaAbater: 88.39, parcelaDependente: 21.43 },
  { limiteSuperior: 1175, taxaMarginal: 0.22, parcelaAbater: 150.26, parcelaDependente: 21.43 },
  { limiteSuperior: 1769, taxaMarginal: 0.25, parcelaAbater: 185.5, parcelaDependente: 21.43 },
  { limiteSuperior: 2057, taxaMarginal: 0.32, parcelaAbater: 309.36, parcelaDependente: 21.43 },
  { limiteSuperior: 2408, taxaMarginal: 0.355, parcelaAbater: 381.35, parcelaDependente: 21.43 },
  { limiteSuperior: 3201, taxaMarginal: 0.3872, parcelaAbater: 458.76, parcelaDependente: 21.43 },
  { limiteSuperior: 5492, taxaMarginal: 0.405, parcelaAbater: 501.49, parcelaDependente: 21.43 },
  { limiteSuperior: 20021, taxaMarginal: 0.4495, parcelaAbater: 770.33, parcelaDependente: 21.43 },
  { limiteSuperior: Infinity, taxaMarginal: 0.4717, parcelaAbater: 1215.80, parcelaDependente: 21.43 }
];

// IRS tables for Não Casado com Dependentes
const tabelasIRS_NaoCasadoComDependentes = [
  { limiteSuperior: 820, taxaMarginal: 0.00, parcelaAbater: 0.00, parcelaDependente: 34.29 },
  { limiteSuperior: 935, taxaMarginal: 0.13, parcelaAbater: (R) => 0.13 * 2.6 * (1135.39 - R), parcelaDependente: 34.29 },
  { limiteSuperior: 989, taxaMarginal: 0.165, parcelaAbater: (R) => 0.165 * 1.35 * (1386.11 - R), parcelaDependente: 34.29 },
  { limiteSuperior: 1125, taxaMarginal: 0.165, parcelaAbater: 88.39, parcelaDependente: 34.29 },
  { limiteSuperior: 1175, taxaMarginal: 0.22, parcelaAbater: 150.26, parcelaDependente: 34.29 },
  { limiteSuperior: 1769, taxaMarginal: 0.25, parcelaAbater: 185.5, parcelaDependente: 34.29 },
  { limiteSuperior: 2057, taxaMarginal: 0.32, parcelaAbater: 309.36, parcelaDependente: 34.29 },
  { limiteSuperior: 2408, taxaMarginal: 0.355, parcelaAbater: 381.35, parcelaDependente: 34.29 },
  { limiteSuperior: 3201, taxaMarginal: 0.3872, parcelaAbater: 458.76, parcelaDependente: 34.29 },
  { limiteSuperior: 5492, taxaMarginal: 0.405, parcelaAbater: 501.49, parcelaDependente: 34.29 },
  { limiteSuperior: 20021, taxaMarginal: 0.4495, parcelaAbater: 770.33, parcelaDependente: 34.29 },
  { limiteSuperior: Infinity, taxaMarginal: 0.4717, parcelaAbater: 1215.80, parcelaDependente: 34.29 }
];

// IRS tables for Casado Único Titular
const tabelasIRS_CasadoUnicoTitular = [
  { limiteSuperior: 904, taxaMarginal: 0.00, parcelaAbater: 0.00, parcelaDependente: 42.86 },
  { limiteSuperior: 935, taxaMarginal: 0.13, parcelaAbater: (R) => 0.13 * 2.6 * (1251.62 - R), parcelaDependente: 42.86 },
  { limiteSuperior: 989, taxaMarginal: 0.13, parcelaAbater: (R) => 0.13 * 1.35 * (1545.09 - R), parcelaDependente: 42.86 },
  { limiteSuperior: 1070, taxaMarginal: 0.13, parcelaAbater: 97.54, parcelaDependente: 42.86 },
  { limiteSuperior: 1394, taxaMarginal: 0.132, parcelaAbater: 99.68, parcelaDependente: 42.86 },
  { limiteSuperior: 1912, taxaMarginal: 0.165, parcelaAbater: 145.69, parcelaDependente: 42.86 },
  { limiteSuperior: 2178, taxaMarginal: 0.18, parcelaAbater: 216.11, parcelaDependente: 42.86 },
  { limiteSuperior: 2671, taxaMarginal: 0.232, parcelaAbater: 291.09, parcelaDependente: 42.86 },
  { limiteSuperior: 3284, taxaMarginal: 0.2594, parcelaAbater: 458.76, parcelaDependente: 42.86 },
  { limiteSuperior: 5906, taxaMarginal: 0.3272, parcelaAbater: 510.04, parcelaDependente: 42.86 },
  { limiteSuperior: 20064, taxaMarginal: 0.3872, parcelaAbater: 981.97, parcelaDependente: 42.86 },
  { limiteSuperior: Infinity, taxaMarginal: 0.4717, parcelaAbater: 2678.40, parcelaDependente: 42.86 }
];

// Historical IRS data for comparison
const historicalData = {
  2020: { minWage: 635, ssRate: 0.11, avgEffectiveRate: 0.22 },
  2021: { minWage: 665, ssRate: 0.11, avgEffectiveRate: 0.21 },
  2022: { minWage: 705, ssRate: 0.11, avgEffectiveRate: 0.20 },
  2023: { minWage: 760, ssRate: 0.11, avgEffectiveRate: 0.19 },
  2024: { minWage: 820, ssRate: 0.11, avgEffectiveRate: 0.18 },
  2025: { minWage: 870, ssRate: 0.11, avgEffectiveRate: 0.17 },
};

// Tax brackets for visualization
const taxBrackets = [
  { min: 0, max: 7703, rate: 0.1325 },
  { min: 7703, max: 11623, rate: 0.18 },
  { min: 11623, max: 16472, rate: 0.23 },
  { min: 16472, max: 21321, rate: 0.26 },
  { min: 21321, max: 27146, rate: 0.3275 },
  { min: 27146, max: 39791, rate: 0.37 },
  { min: 39791, max: 51997, rate: 0.435 },
  { min: 51997, max: 81199, rate: 0.45 },
  { min: 81199, max: Infinity, rate: 0.48 },
];

// ============================================
// State Management
// ============================================

const state = {
  currentResults: null,
  savedSimulations: [],
  chartInstances: {},
  isReverseMode: false,
  showILComparison: true,
  showEmployerCost: false,
};

// ============================================
// Utility Functions
// ============================================

function formatNumber(value) {
  return value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseInputValue(input) {
  if (!input || !input.value) return 0;
  const value = input.value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(value) || 0;
}

function formatInputValue(input, value) {
  if (value === 0 || isNaN(value)) {
    input.value = '';
    return;
  }
  input.value = formatNumber(value);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateProgressIndicator(step) {
  document.querySelectorAll('.progress-step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index + 1 < step) el.classList.add('completed');
    if (index + 1 === step) el.classList.add('active');
  });
}

// ============================================
// URL Parameters
// ============================================

function getURLParameters() {
  const params = new URLSearchParams(window.location.search);
  return {
    gross: params.get('gross'),
    period: params.get('period'),
    location: params.get('location'),
    maritalStatus: params.get('maritalStatus'),
    dependents: params.get('dependents'),
    workerType: params.get('workerType'),
    foodAllowance: params.get('foodAllowance'),
  };
}

function setURLParameters(data) {
  const params = new URLSearchParams();
  if (data.gross) params.set('gross', data.gross);
  if (data.period) params.set('period', data.period);
  if (data.location) params.set('location', data.location);
  if (data.maritalStatus) params.set('maritalStatus', data.maritalStatus);
  if (data.dependents) params.set('dependents', data.dependents);
  if (data.workerType) params.set('workerType', data.workerType);
  if (data.foodAllowance) params.set('foodAllowance', data.foodAllowance);

  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
  return newURL;
}

function loadFromURLParameters() {
  const params = getURLParameters();

  if (params.gross) {
    const input = document.getElementById('rendimentoBruto');
    input.value = formatNumber(parseFloat(params.gross));
  }
  if (params.period) {
    document.getElementById(params.period).checked = true;
  }
  if (params.location) {
    document.getElementById('localizacao').value = params.location;
  }
  if (params.maritalStatus) {
    document.getElementById('estadoCivil').value = params.maritalStatus;
  }
  if (params.dependents) {
    const slider = document.getElementById('dependentes');
    slider.value = params.dependents;
    document.getElementById('numDependentes').textContent = params.dependents;
    updateRangeSlider(slider);
  }
  if (params.workerType) {
    document.getElementById('tipoTrabalhador').value = params.workerType;
  }
  if (params.foodAllowance) {
    document.getElementById('subsidioAlimentacao').value = formatNumber(parseFloat(params.foodAllowance));
  }
}

// ============================================
// Local Storage
// ============================================

function loadSavedSimulations() {
  try {
    const saved = localStorage.getItem('savedSimulations');
    state.savedSimulations = saved ? JSON.parse(saved) : [];
    renderSavedSimulations();
  } catch (e) {
    state.savedSimulations = [];
  }
}

function saveSavedSimulations() {
  localStorage.setItem('savedSimulations', JSON.stringify(state.savedSimulations));
}

function saveCurrentSimulation() {
  if (!state.currentResults) {
    showToast('Faça primeiro uma simulação', 'error');
    return;
  }

  const name = prompt('Nome da simulação:', `Simulação ${state.savedSimulations.length + 1}`);
  if (!name) return;

  const simulation = {
    id: Date.now(),
    name,
    date: new Date().toLocaleDateString('pt-PT'),
    data: { ...getFormData() },
    results: { ...state.currentResults },
  };

  state.savedSimulations.push(simulation);
  saveSavedSimulations();
  renderSavedSimulations();
  showToast('Simulação guardada!', 'success');
}

function loadSimulation(id) {
  const simulation = state.savedSimulations.find(s => s.id === id);
  if (!simulation) return;

  // Restore form data
  const data = simulation.data;
  document.getElementById('rendimentoBruto').value = formatNumber(data.rendimentoBruto);
  document.getElementById('localizacao').value = data.localizacao;
  document.getElementById('estadoCivil').value = data.estadoCivil;
  document.getElementById('dependentes').value = data.dependentes;
  document.getElementById('numDependentes').textContent = data.dependentes;
  document.getElementById(data.periodo).checked = true;
  document.getElementById('tipoTrabalhador').value = data.tipoTrabalhador;

  updateRangeSlider(document.getElementById('dependentes'));
  calcularSalarioLiquido();
  showToast('Simulação carregada!', 'success');
}

function deleteSimulation(id) {
  state.savedSimulations = state.savedSimulations.filter(s => s.id !== id);
  saveSavedSimulations();
  renderSavedSimulations();
  showToast('Simulação eliminada', 'info');
}

function renderSavedSimulations() {
  const container = document.getElementById('savedSimulations');
  const saveBtn = document.getElementById('saveSimulation');

  if (state.savedSimulations.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhuma simulação guardada. Clique em "Guardar" após calcular para guardar uma simulação.</p>';
    return;
  }

  container.innerHTML = state.savedSimulations.map(sim => `
    <div class="saved-simulation-item" data-id="${sim.id}">
      <div class="saved-simulation-info">
        <strong>${sim.name}</strong>
        <small>€${formatNumber(sim.data.rendimentoBruto)} ${sim.data.periodo === 'mensal' ? '/mês' : '/ano'} - ${sim.date}</small>
      </div>
      <div class="saved-simulation-actions">
        <button type="button" class="load-sim" data-id="${sim.id}" title="Carregar">
          <span class="material-symbols-outlined">open_in_new</span>
        </button>
        <button type="button" class="delete-sim" data-id="${sim.id}" title="Eliminar">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  `).join('');

  // Event listeners
  container.querySelectorAll('.load-sim').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSimulation(parseInt(btn.dataset.id));
    });
  });

  container.querySelectorAll('.delete-sim').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Eliminar esta simulação?')) {
        deleteSimulation(parseInt(btn.dataset.id));
      }
    });
  });
}

// ============================================
// Theme Management
// ============================================

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// ============================================
// Form Handling
// ============================================

function getFormData() {
  return {
    rendimentoBruto: parseInputValue(document.getElementById('rendimentoBruto')),
    localizacao: document.getElementById('localizacao').value,
    estadoCivil: document.getElementById('estadoCivil').value,
    dependentes: parseInt(document.getElementById('dependentes').value) || 0,
    periodo: document.querySelector('input[name="periodo"]:checked').value,
    tipoTrabalhador: document.getElementById('tipoTrabalhador').value,
    coeficiente: parseFloat(document.getElementById('coeficiente')?.value) || 0.75,
    primeiroAno: document.getElementById('primeiroAno')?.checked || false,
    partTime: parseInt(document.getElementById('partTime').value) / 100,
    duodecimos: document.getElementById('duodecimos').checked,
    irsJovem: document.getElementById('irsJovem').checked,
    irsJovemAno: parseInt(document.getElementById('irsJovemAno')?.value) || 1,
    deficiencia: document.getElementById('deficiencia').checked,
    subsidioAlimentacao: parseInputValue(document.getElementById('subsidioAlimentacao')),
    tipoSubsidio: document.querySelector('input[name="tipoSubsidio"]:checked').value,
    seguroSaude: parseInputValue(document.getElementById('seguroSaude')),
    viaturaEmpresa: document.getElementById('viaturaEmpresa').checked,
    valorViatura: parseInputValue(document.getElementById('valorViatura')),
    subsidioTeletrabalho: parseInputValue(document.getElementById('subsidioTeletrabalho')),
    outrosBeneficios: parseInputValue(document.getElementById('outrosBeneficios')),
    calculatorMode: document.querySelector('input[name="calculatorMode"]:checked').value,
  };
}

function validateForm(data) {
  const errors = [];
  const errorEl = document.getElementById('rendimento-error');

  if (!data.rendimentoBruto || data.rendimentoBruto <= 0) {
    errors.push('Insira um valor de rendimento válido');
    errorEl.textContent = 'Insira um valor de rendimento válido';
    document.getElementById('rendimentoBruto').classList.add('error');
  } else {
    errorEl.textContent = '';
    document.getElementById('rendimentoBruto').classList.remove('error');
  }

  return errors.length === 0;
}

function updateRangeSlider(slider) {
  const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.setProperty('--range-percent', value + '%');
}

// ============================================
// IRS Calculation Functions
// ============================================

function calcularIRS(rendimentoMensal, estadoCivil, dependentes, localizacao = 'continental') {
  let tabelaIRS;

  if (estadoCivil === 'naoCasado' && dependentes === 0) {
    tabelaIRS = tabelasIRS_NaoCasado;
  } else if (estadoCivil === 'naoCasado' && dependentes > 0) {
    tabelaIRS = tabelasIRS_NaoCasadoComDependentes;
  } else if (estadoCivil === 'casado1') {
    tabelaIRS = tabelasIRS_CasadoUnicoTitular;
  } else {
    tabelaIRS = tabelasIRS_NaoCasado;
  }

  let irs = 0;
  for (let faixa of tabelaIRS) {
    if (rendimentoMensal <= faixa.limiteSuperior) {
      let taxaMarginal = faixa.taxaMarginal;
      let parcelaAbater = typeof faixa.parcelaAbater === 'function'
        ? faixa.parcelaAbater(rendimentoMensal)
        : faixa.parcelaAbater;
      let parcelaDependente = faixa.parcelaDependente * dependentes;

      irs = rendimentoMensal * taxaMarginal - parcelaAbater - parcelaDependente;

      // Regional reductions
      if (localizacao === 'acores') {
        irs *= 0.70; // 30% reduction for Azores
      } else if (localizacao === 'madeira') {
        irs *= 0.80; // 20% reduction for Madeira
      }

      if (irs < 0) irs = 0;
      break;
    }
  }

  return irs;
}

function calcularIRSJovem(irsNormal, ano, rendimentoAnual) {
  // IRS Jovem exemption percentages
  const exemptions = {
    1: 1.00,   // 100% exemption year 1
    2: 0.75,   // 75% exemption year 2
    3: 0.50,   // 50% exemption years 3-4
    5: 0.25,   // 25% exemption year 5
  };

  const exemptionRate = exemptions[ano] || 0;
  const maxExemptIncome = CONFIG.IRS_JOVEM_LIMITE_ANUAL;

  // Calculate exemption
  const exemptAmount = Math.min(rendimentoAnual, maxExemptIncome);
  const exemptionValue = (irsNormal * exemptAmount / rendimentoAnual) * exemptionRate;

  return Math.max(0, irsNormal - exemptionValue);
}

function calcularIRSDeficiencia(irs, rendimentoAnual) {
  // People with disability >=60% have additional deductions
  // Simplified: 15% reduction on IRS
  return irs * 0.85;
}

function calcularIRSLiberal(rendimentoAnual) {
  const SALARIO_MINIMO_ANUAL = CONFIG.SALARIO_MINIMO_2025 * 14;
  let rendimentoTributavel = rendimentoAnual - SALARIO_MINIMO_ANUAL;

  if (rendimentoTributavel <= 0) {
    return 0;
  } else if (rendimentoTributavel <= 30000) {
    return rendimentoTributavel * 0.15;
  } else {
    return (30000 * 0.15) + ((rendimentoTributavel - 30000) * 0.28);
  }
}

// ============================================
// Segurança Social Calculation
// ============================================

function calcularSegurancaSocial(rendimentoMensal, tipoTrabalhador, coeficiente = 0.75, primeiroAno = false) {
  if (primeiroAno && tipoTrabalhador.includes('independente')) {
    return 0; // First year exemption for self-employed
  }

  switch (tipoTrabalhador) {
    case 'porContaOutrem':
      return rendimentoMensal * CONFIG.SS_TAXA_EMPREGADO;

    case 'independenteSimplificado':
      const baseSimplificado = rendimentoMensal * 0.70;
      let ssSimplificado = baseSimplificado * CONFIG.SS_TAXA_INDEPENDENTE;
      const minContribuicao = 480.43 * 0.70 * CONFIG.SS_TAXA_INDEPENDENTE;
      return Math.max(ssSimplificado, minContribuicao);

    case 'independenteContabilidade':
      return rendimentoMensal * CONFIG.SS_TAXA_INDEPENDENTE;

    default:
      return 0;
  }
}

function calcularCustoEmpregador(salarioBrutoMensal, subsidioAlimentacaoMensal = 0) {
  const ssEmpregador = salarioBrutoMensal * CONFIG.SS_TAXA_EMPREGADOR;
  const seguroTrabalho = salarioBrutoMensal * 0.01; // ~1% work accident insurance
  return salarioBrutoMensal + ssEmpregador + seguroTrabalho + subsidioAlimentacaoMensal;
}

// ============================================
// Benefits Calculation
// ============================================

function calcularSubsidioAlimentacao(valorDiario, tipo, diasTrabalhados = CONFIG.DIAS_TRABALHO_MES) {
  const limite = tipo === 'cartao'
    ? CONFIG.SUBSIDIO_ALIMENTACAO_ISENTO_CARTAO
    : CONFIG.SUBSIDIO_ALIMENTACAO_ISENTO_DINHEIRO;

  const valorMensal = valorDiario * diasTrabalhados;
  const valorIsento = Math.min(valorDiario, limite) * diasTrabalhados;
  const valorTributavel = Math.max(0, valorMensal - valorIsento);

  return {
    total: valorMensal,
    isento: valorIsento,
    tributavel: valorTributavel
  };
}

function calcularBeneficioViatura(valorViatura) {
  // 0.75% of acquisition value per month
  return valorViatura * CONFIG.VIATURA_TAXA_MENSAL;
}

// ============================================
// Main Calculation Function
// ============================================

function calcularSalarioLiquido() {
  const data = getFormData();

  if (!validateForm(data)) {
    return;
  }

  // Check if reverse mode
  if (data.calculatorMode === 'reverse') {
    return calcularSalarioBruto(data);
  }

  // Calculate monthly income
  let rendimentoMensal = data.periodo === 'anual'
    ? data.rendimentoBruto / 14
    : data.rendimentoBruto;

  // Apply part-time percentage
  rendimentoMensal *= data.partTime;

  // Calculate taxable benefits
  const subsidioAlim = calcularSubsidioAlimentacao(data.subsidioAlimentacao, data.tipoSubsidio);
  const beneficioViatura = data.viaturaEmpresa ? calcularBeneficioViatura(data.valorViatura) : 0;
  const rendimentoEspecie = beneficioViatura + data.outrosBeneficios;

  // Total taxable income
  let rendimentoTributavel = rendimentoMensal + subsidioAlim.tributavel + rendimentoEspecie;

  // For simplified regime, apply coefficient
  if (data.tipoTrabalhador === 'independenteSimplificado') {
    rendimentoTributavel = rendimentoTributavel * data.coeficiente;
  }

  // Calculate IRS
  let irsMensal = calcularIRS(rendimentoTributavel, data.estadoCivil, data.dependentes, data.localizacao);

  // Apply IRS Jovem if applicable
  if (data.irsJovem) {
    const irsAnual = irsMensal * 14;
    const irsJovemAnual = calcularIRSJovem(irsAnual, data.irsJovemAno, rendimentoTributavel * 14);
    irsMensal = irsJovemAnual / 14;
  }

  // Apply disability benefits if applicable
  if (data.deficiencia) {
    irsMensal = calcularIRSDeficiencia(irsMensal, rendimentoTributavel);
  }

  // Calculate Social Security
  const segurancaSocialMensal = calcularSegurancaSocial(
    rendimentoMensal,
    data.tipoTrabalhador,
    data.coeficiente,
    data.primeiroAno
  );

  // Calculate net salary
  let salarioLiquidoMensal = rendimentoMensal - irsMensal - segurancaSocialMensal;

  // Add non-taxable benefits
  salarioLiquidoMensal += subsidioAlim.isento;
  salarioLiquidoMensal += data.subsidioTeletrabalho; // Assume exempt

  // Annual values
  const meses = data.duodecimos ? 12 : 14;
  const rendimentoBrutoAnual = rendimentoMensal * 14;
  const irsAnual = irsMensal * 14;
  const segurancaSocialAnual = segurancaSocialMensal * 14;
  const salarioLiquidoAnual = salarioLiquidoMensal * meses + (data.duodecimos ? rendimentoMensal * 2 - irsMensal * 2 - segurancaSocialMensal * 2 : 0);

  // IL calculation
  const irsLiberalAnual = calcularIRSLiberal(rendimentoBrutoAnual);
  const salarioLiquidoLiberalAnual = rendimentoBrutoAnual - irsLiberalAnual - segurancaSocialAnual + subsidioAlim.isento * 14 + data.subsidioTeletrabalho * 14;

  // Employer cost
  const custoEmpregadorMensal = calcularCustoEmpregador(rendimentoMensal, subsidioAlim.total);
  const custoEmpregadorAnual = custoEmpregadorMensal * 14;

  // Store results
  state.currentResults = {
    rendimentoBrutoMensal: rendimentoMensal,
    rendimentoBrutoAnual,
    irsMensal,
    irsAnual,
    segurancaSocialMensal,
    segurancaSocialAnual,
    salarioLiquidoMensal,
    salarioLiquidoAnual,
    salarioLiquidoLiberalAnual,
    salarioLiquidoLiberalMensal: salarioLiquidoLiberalAnual / 14,
    custoEmpregadorMensal,
    custoEmpregadorAnual,
    subsidioAlimentacao: subsidioAlim,
    extraAnual: salarioLiquidoLiberalAnual - salarioLiquidoAnual,
    extraMensal: (salarioLiquidoLiberalAnual - salarioLiquidoAnual) / 14,
    irsPercent: (irsAnual / rendimentoBrutoAnual * 100).toFixed(2),
    ssPercent: (segurancaSocialAnual / rendimentoBrutoAnual * 100).toFixed(2),
    liquidoPercent: (salarioLiquidoAnual / rendimentoBrutoAnual * 100).toFixed(2),
    liquidoILPercent: (salarioLiquidoLiberalAnual / rendimentoBrutoAnual * 100).toFixed(2),
  };

  // Update URL
  setURLParameters({
    gross: data.rendimentoBruto,
    period: data.periodo,
    location: data.localizacao,
    maritalStatus: data.estadoCivil,
    dependents: data.dependentes,
    workerType: data.tipoTrabalhador,
    foodAllowance: data.subsidioAlimentacao,
  });

  // Show results
  exibirResultados(state.currentResults);

  // Update progress
  updateProgressIndicator(4);

  // Show controls
  document.getElementById('resultsControls').style.display = 'block';
  document.getElementById('saveSimulation').style.display = 'inline-flex';

  // Update tax bracket visualization
  updateBracketVisualization(rendimentoBrutoAnual);

  // Save to Supabase
  saveSimulationToSupabase(data);

  return state.currentResults;
}

// ============================================
// Reverse Calculator (Net to Gross)
// ============================================

function calcularSalarioBruto(data) {
  const targetNet = data.periodo === 'anual'
    ? data.rendimentoBruto / 14
    : data.rendimentoBruto;

  // Binary search for gross salary
  let low = targetNet;
  let high = targetNet * 2;
  let iterations = 0;
  const maxIterations = 50;
  const tolerance = 0.01;

  while (iterations < maxIterations) {
    const mid = (low + high) / 2;

    // Calculate net for this gross
    const irs = calcularIRS(mid, data.estadoCivil, data.dependentes, data.localizacao);
    const ss = calcularSegurancaSocial(mid, data.tipoTrabalhador);
    const netCalc = mid - irs - ss;

    if (Math.abs(netCalc - targetNet) < tolerance) {
      // Found it
      const rendimentoBrutoMensal = mid;
      const rendimentoBrutoAnual = mid * 14;

      state.currentResults = {
        rendimentoBrutoMensal,
        rendimentoBrutoAnual,
        irsMensal: irs,
        irsAnual: irs * 14,
        segurancaSocialMensal: ss,
        segurancaSocialAnual: ss * 14,
        salarioLiquidoMensal: targetNet,
        salarioLiquidoAnual: targetNet * 14,
        isReverse: true,
      };

      exibirResultadosReverso(state.currentResults);
      updateProgressIndicator(4);
      document.getElementById('resultsControls').style.display = 'block';
      return state.currentResults;
    }

    if (netCalc < targetNet) {
      low = mid;
    } else {
      high = mid;
    }

    iterations++;
  }

  showToast('Não foi possível calcular o salário bruto', 'error');
  return null;
}

function exibirResultadosReverso(results) {
  const container = document.getElementById('resultados');
  container.innerHTML = `
    <div class="resultados-container">
      <div class="period-toggle">
        <button type="button" class="active" data-period="mensal">Mensal</button>
        <button type="button" data-period="anual">Anual</button>
      </div>
      <div class="resultado mensal active">
        <div class="resultados-texto">
          <h2>Cálculo Inverso - Mensal</h2>
          <p>
            <span class="dot dot-salario-liquido"></span>
            <span class="label">Salário Líquido Pretendido:</span>
            <span class="valor">€${formatNumber(results.salarioLiquidoMensal)}</span>
          </p>
          <p>
            <span class="dot dot-salario-bruto"></span>
            <span class="label"><strong>Salário Bruto Necessário:</strong></span>
            <span class="valor highlight">€${formatNumber(results.rendimentoBrutoMensal)}</span>
          </p>
          <p>
            <span class="dot dot-irs"></span>
            <span class="label">IRS estimado:</span>
            <span class="valor">€${formatNumber(results.irsMensal)}</span>
          </p>
          <p>
            <span class="dot dot-segurança-social"></span>
            <span class="label">Segurança Social:</span>
            <span class="valor">€${formatNumber(results.segurancaSocialMensal)}</span>
          </p>
        </div>
      </div>
      <div class="resultado anual">
        <div class="resultados-texto">
          <h2>Cálculo Inverso - Anual</h2>
          <p>
            <span class="dot dot-salario-liquido"></span>
            <span class="label">Salário Líquido Pretendido:</span>
            <span class="valor">€${formatNumber(results.salarioLiquidoAnual)}</span>
          </p>
          <p>
            <span class="dot dot-salario-bruto"></span>
            <span class="label"><strong>Salário Bruto Necessário:</strong></span>
            <span class="valor highlight">€${formatNumber(results.rendimentoBrutoAnual)}</span>
          </p>
          <p>
            <span class="dot dot-irs"></span>
            <span class="label">IRS estimado:</span>
            <span class="valor">€${formatNumber(results.irsAnual)}</span>
          </p>
          <p>
            <span class="dot dot-segurança-social"></span>
            <span class="label">Segurança Social:</span>
            <span class="valor">€${formatNumber(results.segurancaSocialAnual)}</span>
          </p>
        </div>
      </div>
    </div>
  `;

  setupPeriodToggle();
}

// ============================================
// Display Results
// ============================================

function exibirResultados(results) {
  const container = document.getElementById('resultados');
  const showIL = state.showILComparison;
  const showEmployer = state.showEmployerCost;

  container.innerHTML = `
    <div class="resultados-container">
      <div class="period-toggle">
        <button type="button" class="active" data-period="mensal">Mensal</button>
        <button type="button" data-period="anual">Anual (14 meses)</button>
      </div>

      <!-- Mensal Results -->
      <div class="resultado mensal active">
        <div class="resultados-texto">
          <h2>Simulação Mensal</h2>
          <div class="graficos">
            <canvas id="graficoMensal" width="720" height="60"></canvas>
          </div>
          <p>
            <span class="dot dot-salario-bruto"></span>
            <span class="icon"><img src="./icons/Briefcase.svg" alt="Briefcase"></span>
            <span class="label">Salário Bruto:</span>
            <span class="valor">€${formatNumber(results.rendimentoBrutoMensal)}</span>
          </p>
          <p>
            <span class="dot dot-irs"></span>
            <span class="icon"><img src="./icons/Archive.svg" alt="Archive"></span>
            <span class="label">IRS (${results.irsPercent}%):</span>
            <span class="valor">€${formatNumber(results.irsMensal)}</span>
          </p>
          <p>
            <span class="dot dot-segurança-social"></span>
            <span class="icon"><img src="./icons/Shield.svg" alt="Shield"></span>
            <span class="label">Segurança Social (${results.ssPercent}%):</span>
            <span class="valor">€${formatNumber(results.segurancaSocialMensal)}</span>
          </p>
          <p>
            <span class="dot dot-salario-liquido"></span>
            <span class="icon"><img src="./icons/Check circle.svg" alt="Check Circle"></span>
            <span class="label">Salário Líquido (${results.liquidoPercent}%):</span>
            <span class="valor">€${formatNumber(results.salarioLiquidoMensal)}</span>
          </p>

          ${showIL ? `
          <div class="il-section" id="ilSectionMensal">
            <h4>
              <img src="./icons/Iniciativa_Liberal_Icon 1.svg" alt="IL" style="height:24px;">
              Simulação Mensal - Iniciativa Liberal
            </h4>
            <div class="graficos">
              <canvas id="graficoMensalLiberal" width="720" height="48"></canvas>
            </div>
            <p>
              <span class="dot dot-salario-liquido-il"></span>
              <span class="label">Salário Líquido - IL (${results.liquidoILPercent}%):</span>
              <span class="valor highlight">€${formatNumber(results.salarioLiquidoLiberalMensal)} (+€${formatNumber(results.extraMensal)})</span>
            </p>
          </div>
          ` : ''}

          ${showEmployer ? `
          <div class="employer-section">
            <h4>Custo para a Empresa</h4>
            <p>
              <span class="dot dot-employer"></span>
              <span class="label">Custo Total Mensal:</span>
              <span class="valor">€${formatNumber(results.custoEmpregadorMensal)}</span>
            </p>
            <small>Inclui: Salário bruto + SS Empregador (23,75%) + Seguro Trabalho (~1%)</small>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Anual Results -->
      <div class="resultado anual">
        <div class="resultados-texto">
          <h2>Simulação Anual (14 meses)</h2>
          <div class="graficos">
            <canvas id="graficoAnual" width="720" height="60"></canvas>
          </div>
          <p>
            <span class="dot dot-salario-bruto"></span>
            <span class="icon"><img src="./icons/Briefcase.svg" alt="Briefcase"></span>
            <span class="label">Salário Bruto:</span>
            <span class="valor">€${formatNumber(results.rendimentoBrutoAnual)}</span>
          </p>
          <p>
            <span class="dot dot-irs"></span>
            <span class="icon"><img src="./icons/Archive.svg" alt="Archive"></span>
            <span class="label">IRS (${results.irsPercent}%):</span>
            <span class="valor">€${formatNumber(results.irsAnual)}</span>
          </p>
          <p>
            <span class="dot dot-segurança-social"></span>
            <span class="icon"><img src="./icons/Shield.svg" alt="Shield"></span>
            <span class="label">Segurança Social (${results.ssPercent}%):</span>
            <span class="valor">€${formatNumber(results.segurancaSocialAnual)}</span>
          </p>
          <p>
            <span class="dot dot-salario-liquido"></span>
            <span class="icon"><img src="./icons/Check circle.svg" alt="Check Circle"></span>
            <span class="label">Salário Líquido (${results.liquidoPercent}%):</span>
            <span class="valor">€${formatNumber(results.salarioLiquidoAnual)}</span>
          </p>

          ${showIL ? `
          <div class="il-section" id="ilSectionAnual">
            <h4>
              <img src="./icons/Iniciativa_Liberal_Icon 1.svg" alt="IL" style="height:24px;">
              Simulação Anual - Iniciativa Liberal
            </h4>
            <div class="graficos">
              <canvas id="graficoAnualLiberal" width="720" height="48"></canvas>
            </div>
            <p>
              <span class="dot dot-salario-liquido-il"></span>
              <span class="label">Salário Líquido - IL (${results.liquidoILPercent}%):</span>
              <span class="valor highlight">€${formatNumber(results.salarioLiquidoLiberalAnual)} (+€${formatNumber(results.extraAnual)})</span>
            </p>
          </div>
          ` : ''}

          ${showEmployer ? `
          <div class="employer-section">
            <h4>Custo para a Empresa</h4>
            <p>
              <span class="dot dot-employer"></span>
              <span class="label">Custo Total Anual:</span>
              <span class="valor">€${formatNumber(results.custoEmpregadorAnual)}</span>
            </p>
            <small>Inclui: Salário bruto + SS Empregador (23,75%) + Seguro Trabalho (~1%)</small>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Setup period toggle
  setupPeriodToggle();

  // Generate charts with animation
  setTimeout(() => {
    gerarGrafico('graficoMensal', results.rendimentoBrutoMensal, results.irsMensal, results.segurancaSocialMensal, false);
    gerarGrafico('graficoAnual', results.rendimentoBrutoAnual, results.irsAnual, results.segurancaSocialAnual, false);

    if (showIL) {
      const irsLiberalMensal = calcularIRSLiberal(results.rendimentoBrutoAnual) / 14;
      const irsLiberalAnual = calcularIRSLiberal(results.rendimentoBrutoAnual);
      gerarGrafico('graficoMensalLiberal', results.rendimentoBrutoMensal, irsLiberalMensal, results.segurancaSocialMensal, true);
      gerarGrafico('graficoAnualLiberal', results.rendimentoBrutoAnual, irsLiberalAnual, results.segurancaSocialAnual, true);
    }
  }, 100);

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupPeriodToggle() {
  const buttons = document.querySelectorAll('.period-toggle button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const period = btn.dataset.period;
      document.querySelectorAll('.resultado').forEach(r => {
        r.classList.remove('active');
        if (r.classList.contains(period)) {
          r.classList.add('active');
        }
      });
    });
  });
}

// ============================================
// Chart Generation
// ============================================

function gerarGrafico(canvasId, salarioBruto, irs, segurancaSocial, isIL = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const salarioLiquido = salarioBruto - irs - segurancaSocial;
  const totalSum = irs + segurancaSocial + salarioLiquido;

  // Destroy existing chart if any
  if (state.chartInstances[canvasId]) {
    state.chartInstances[canvasId].destroy();
  }

  const backgroundColors = isIL
    ? ['#51aaee', '#db3d2d', '#ff6b6b']
    : ['#26538e', '#db3d2d', '#ff6b6b'];

  state.chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [''],
      datasets: [
        {
          label: 'Salário Líquido',
          data: [salarioLiquido],
          backgroundColor: backgroundColors[0],
          borderRadius: { topLeft: 4, bottomLeft: 4, topRight: 0, bottomRight: 0 },
          borderSkipped: false
        },
        {
          label: 'IRS',
          data: [irs],
          backgroundColor: backgroundColors[1],
          borderRadius: 4,
        },
        {
          label: 'Segurança Social',
          data: [segurancaSocial],
          backgroundColor: backgroundColors[2],
          borderRadius: { topLeft: 0, bottomLeft: 0, topRight: 4, bottomRight: 4 },
        }
      ]
    },
    options: {
      indexAxis: 'y',
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      scales: {
        x: {
          stacked: true,
          max: totalSum,
          ticks: {
            callback: (value) => '€' + value.toLocaleString(),
            display: false,
          },
          grid: { display: false, drawBorder: false },
        },
        y: {
          stacked: true,
          ticks: { display: false },
          grid: { display: false, drawBorder: false },
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const value = tooltipItem.raw;
              const percentage = ((value / totalSum) * 100).toFixed(1);
              return `${tooltipItem.dataset.label}: €${formatNumber(value)} (${percentage}%)`;
            }
          }
        },
        legend: { display: false },
      },
      responsive: true,
      maintainAspectRatio: false,
      barPercentage: 1,
      categoryPercentage: 1,
    }
  });
}

// ============================================
// Tax Bracket Visualization
// ============================================

function updateBracketVisualization(rendimentoAnual) {
  const container = document.getElementById('bracketVisualization');
  if (!container) return;

  const maxIncome = 100000;
  const colors = [
    '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
    '#FFC107', '#FF9800', '#FF5722', '#F44336', '#D32F2F'
  ];

  let html = '';
  taxBrackets.forEach((bracket, index) => {
    const width = Math.min((bracket.max - bracket.min) / maxIncome * 100, 100);
    const isActive = rendimentoAnual > bracket.min && rendimentoAnual <= (bracket.max === Infinity ? rendimentoAnual + 1 : bracket.max);

    html += `
      <div class="bracket-bar">
        <span class="bracket-range">€${formatNumber(bracket.min)} - ${bracket.max === Infinity ? '+' : '€' + formatNumber(bracket.max)}</span>
        <div class="bracket-fill ${isActive ? 'active' : ''}"
             style="width: ${Math.max(width, 5)}%; background-color: ${colors[index]};">
        </div>
        <span class="bracket-rate">${(bracket.rate * 100).toFixed(2)}%</span>
      </div>
    `;
  });

  container.innerHTML = html;

  // Update explanation
  const explanation = document.getElementById('bracketExplanation');
  if (explanation && rendimentoAnual > 0) {
    const activeBracket = taxBrackets.find(b => rendimentoAnual <= b.max);
    if (activeBracket) {
      explanation.innerHTML = `
        <p>Com um rendimento anual de <strong>€${formatNumber(rendimentoAnual)}</strong>,
        encontra-se no escalão de <strong>${(activeBracket.rate * 100).toFixed(2)}%</strong>.
        Lembre-se que esta taxa aplica-se apenas à porção do rendimento dentro deste escalão.</p>
      `;
    }
  }
}

// ============================================
// Job Comparison
// ============================================

function compareJobs() {
  const job1Salary = parseInputValue(document.getElementById('job1Salary'));
  const job1Food = parseInputValue(document.getElementById('job1Food'));
  const job2Salary = parseInputValue(document.getElementById('job2Salary'));
  const job2Food = parseInputValue(document.getElementById('job2Food'));

  if (!job1Salary || !job2Salary) {
    showToast('Preencha os salários de ambas as ofertas', 'error');
    return;
  }

  // Get current form settings for calculations
  const data = getFormData();

  // Calculate Job 1
  const irs1 = calcularIRS(job1Salary, data.estadoCivil, data.dependentes, data.localizacao);
  const ss1 = calcularSegurancaSocial(job1Salary, 'porContaOutrem');
  const food1 = calcularSubsidioAlimentacao(job1Food, 'cartao');
  const net1 = job1Salary - irs1 - ss1 + food1.isento;

  // Calculate Job 2
  const irs2 = calcularIRS(job2Salary, data.estadoCivil, data.dependentes, data.localizacao);
  const ss2 = calcularSegurancaSocial(job2Salary, 'porContaOutrem');
  const food2 = calcularSubsidioAlimentacao(job2Food, 'cartao');
  const net2 = job2Salary - irs2 - ss2 + food2.isento;

  // Update results
  const result1 = document.querySelector('#job1Result .comparison-value');
  const result2 = document.querySelector('#job2Result .comparison-value');

  result1.textContent = `€${formatNumber(net1)}`;
  result2.textContent = `€${formatNumber(net2)}`;

  // Highlight winner
  document.getElementById('job1Result').classList.remove('winner');
  document.getElementById('job2Result').classList.remove('winner');

  if (net1 > net2) {
    document.getElementById('job1Result').classList.add('winner');
  } else if (net2 > net1) {
    document.getElementById('job2Result').classList.add('winner');
  }

  // Show summary
  const summary = document.getElementById('comparisonSummary');
  const diff = Math.abs(net1 - net2);
  const winner = net1 > net2 ? 'Oferta 1' : 'Oferta 2';

  summary.style.display = 'block';
  summary.innerHTML = `
    <h4>Resultado da Comparação</h4>
    <p>A <strong>${winner}</strong> oferece um rendimento líquido mensal superior em <strong>€${formatNumber(diff)}</strong>.</p>
    <p>Diferença anual: <strong>€${formatNumber(diff * 14)}</strong></p>
  `;
}

// ============================================
// Historical Comparison
// ============================================

function compareHistorical() {
  const salary = parseInputValue(document.getElementById('historicalSalary'));
  if (!salary) {
    showToast('Insira um salário para comparar', 'error');
    return;
  }

  const data = getFormData();
  const years = Object.keys(historicalData).sort();
  const netSalaries = [];

  years.forEach(year => {
    const yearData = historicalData[year];
    // Simplified calculation for historical data
    const ss = salary * yearData.ssRate;
    const estimatedIRS = salary * yearData.avgEffectiveRate;
    const net = salary - ss - estimatedIRS;
    netSalaries.push(net);
  });

  // Show chart
  const chartContainer = document.getElementById('historicalChart');
  chartContainer.style.display = 'block';

  const canvas = document.getElementById('historicalCanvas');
  const ctx = canvas.getContext('2d');

  // Destroy existing chart
  if (state.chartInstances['historicalCanvas']) {
    state.chartInstances['historicalCanvas'].destroy();
  }

  state.chartInstances['historicalCanvas'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Salário Líquido Estimado',
        data: netSalaries,
        borderColor: '#26538e',
        backgroundColor: 'rgba(38, 83, 142, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: (context) => `€${formatNumber(context.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => '€' + formatNumber(value)
          }
        }
      }
    }
  });
}

// ============================================
// Share & Export Functions
// ============================================

function shareLink() {
  const data = getFormData();
  const url = setURLParameters({
    gross: data.rendimentoBruto,
    period: data.periodo,
    location: data.localizacao,
    maritalStatus: data.estadoCivil,
    dependents: data.dependentes,
    workerType: data.tipoTrabalhador,
    foodAllowance: data.subsidioAlimentacao,
  });

  const fullURL = window.location.origin + url;

  navigator.clipboard.writeText(fullURL).then(() => {
    showToast('Link copiado para a área de transferência!', 'success');
  }).catch(() => {
    showToast('Não foi possível copiar o link', 'error');
  });
}

async function shareImage() {
  const resultsEl = document.querySelector('.resultados-container');
  if (!resultsEl) {
    showToast('Faça primeiro uma simulação', 'error');
    return;
  }

  try {
    const canvas = await html2canvas(resultsEl, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = 'simulacao-salario.png';
    link.href = canvas.toDataURL();
    link.click();

    showToast('Imagem guardada!', 'success');
  } catch (e) {
    showToast('Erro ao gerar imagem', 'error');
  }
}

function exportPDF() {
  // For PDF, we'll use the browser's print functionality
  window.print();
}

function emailResults() {
  if (!state.currentResults) {
    showToast('Faça primeiro uma simulação', 'error');
    return;
  }

  const r = state.currentResults;
  const subject = encodeURIComponent('Simulação Salário Líquido Portugal');
  const body = encodeURIComponent(`
Simulação de Salário Líquido

Salário Bruto Mensal: €${formatNumber(r.rendimentoBrutoMensal)}
IRS: €${formatNumber(r.irsMensal)} (${r.irsPercent}%)
Segurança Social: €${formatNumber(r.segurancaSocialMensal)} (${r.ssPercent}%)
Salário Líquido Mensal: €${formatNumber(r.salarioLiquidoMensal)}

Valores Anuais (14 meses):
Salário Bruto: €${formatNumber(r.rendimentoBrutoAnual)}
Salário Líquido: €${formatNumber(r.salarioLiquidoAnual)}

Simulado em: ${window.location.href}
  `.trim());

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// ============================================
// Quick Actions (What-if Scenarios)
// ============================================

function handleQuickAction(action) {
  const input = document.getElementById('rendimentoBruto');
  const currentValue = parseInputValue(input);
  const dependentSlider = document.getElementById('dependentes');

  switch (action) {
    case 'raise10':
      if (currentValue > 0) {
        input.value = formatNumber(currentValue * 1.10);
        calcularSalarioLiquido();
      }
      break;
    case 'raise20':
      if (currentValue > 0) {
        input.value = formatNumber(currentValue * 1.20);
        calcularSalarioLiquido();
      }
      break;
    case 'addDependent':
      const newValue = Math.min(parseInt(dependentSlider.value) + 1, 10);
      dependentSlider.value = newValue;
      document.getElementById('numDependentes').textContent = newValue;
      updateRangeSlider(dependentSlider);
      calcularSalarioLiquido();
      break;
    case 'minWage':
      input.value = formatNumber(CONFIG.SALARIO_MINIMO_2025);
      document.getElementById('mensal').checked = true;
      calcularSalarioLiquido();
      break;
  }
}

// ============================================
// Supabase Integration
// ============================================

async function saveSimulationToSupabase(data) {
  try {
    const { error } = await supabase
      .from('salarioPortuguesSimulador')
      .insert([{
        rendimentoBruto: data.rendimentoBruto,
        localizacao: data.localizacao,
        estadoCivil: data.estadoCivil,
        dependentes: data.dependentes,
        tipoTrabalhador: data.tipoTrabalhador,
        periodo: data.periodo === 'mensal',
      }]);

    if (error) console.error('Error saving to Supabase:', error);
  } catch (e) {
    console.error('Supabase error:', e);
  }
}

// ============================================
// Mobile Bottom Sheet
// ============================================

function initMobileBottomSheet() {
  const sheet = document.getElementById('mobileResultsSheet');
  if (!sheet) return;

  let startY = 0;
  let currentY = 0;

  sheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  });

  sheet.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      sheet.style.transform = `translateY(${diff}px)`;
    }
  });

  sheet.addEventListener('touchend', () => {
    const diff = currentY - startY;
    if (diff > 100) {
      sheet.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
    } else {
      sheet.style.transform = '';
    }
  });
}

function showMobileResults() {
  const sheet = document.getElementById('mobileResultsSheet');
  if (sheet && window.innerWidth <= 768) {
    const content = document.querySelector('.resultados-container');
    if (content) {
      sheet.querySelector('.sheet-content').innerHTML = content.outerHTML;
      sheet.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
    }
  }
}

// ============================================
// Event Listeners & Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();

  // Load saved simulations
  loadSavedSimulations();

  // Load URL parameters
  loadFromURLParameters();

  // Set default value
  const rendimentoInput = document.getElementById('rendimentoBruto');
  if (!rendimentoInput.value) {
    rendimentoInput.value = formatNumber(1500);
  }

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Form submission
  document.getElementById('salaryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    calcularSalarioLiquido();
  });

  // Real-time calculation (debounced)
  const debouncedCalculate = debounce(() => {
    if (parseInputValue(document.getElementById('rendimentoBruto')) > 0) {
      calcularSalarioLiquido();
    }
  }, CONFIG.DEBOUNCE_DELAY);

  // Input listeners for real-time calculation
  const inputsToWatch = [
    'rendimentoBruto', 'localizacao', 'estadoCivil', 'tipoTrabalhador',
    'subsidioAlimentacao', 'seguroSaude', 'valorViatura',
    'subsidioTeletrabalho', 'outrosBeneficios'
  ];

  inputsToWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', debouncedCalculate);
      el.addEventListener('change', debouncedCalculate);
    }
  });

  // Radio buttons
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', debouncedCalculate);
  });

  // Checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Handle conditional displays
      if (checkbox.id === 'irsJovem') {
        document.getElementById('irsJovemOptions').style.display = checkbox.checked ? 'block' : 'none';
      }
      if (checkbox.id === 'viaturaEmpresa') {
        document.getElementById('viaturaOptions').style.display = checkbox.checked ? 'block' : 'none';
      }
      debouncedCalculate();
    });
  });

  // Range sliders
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', function() {
      updateRangeSlider(this);

      if (this.id === 'dependentes') {
        document.getElementById('numDependentes').textContent = this.value;
        this.setAttribute('aria-valuenow', this.value);
      }
      if (this.id === 'partTime') {
        document.getElementById('partTimeValue').textContent = this.value + '%';
      }

      debouncedCalculate();
    });

    // Initialize slider visual
    updateRangeSlider(slider);
  });

  // Worker type change
  document.getElementById('tipoTrabalhador').addEventListener('change', function() {
    const selfEmployedOptions = document.getElementById('selfEmployedOptions');
    selfEmployedOptions.style.display = this.value.includes('independente') ? 'block' : 'none';
  });

  // Calculator mode change
  document.querySelectorAll('input[name="calculatorMode"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const label = document.getElementById('rendimentoLabel');
      label.textContent = this.value === 'reverse' ? 'Rendimento Líquido Pretendido' : 'Rendimento Bruto';
    });
  });

  // Quick actions
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
  });

  // IL comparison toggle
  document.getElementById('showILComparison')?.addEventListener('change', function() {
    state.showILComparison = this.checked;
    if (state.currentResults) exibirResultados(state.currentResults);
  });

  // Employer cost toggle
  document.getElementById('showEmployerCost')?.addEventListener('change', function() {
    state.showEmployerCost = this.checked;
    if (state.currentResults) exibirResultados(state.currentResults);
  });

  // Share buttons
  document.getElementById('shareLink')?.addEventListener('click', shareLink);
  document.getElementById('shareImage')?.addEventListener('click', shareImage);
  document.getElementById('exportPDF')?.addEventListener('click', exportPDF);
  document.getElementById('emailResults')?.addEventListener('click', emailResults);

  // Save simulation
  document.getElementById('saveSimulation')?.addEventListener('click', saveCurrentSimulation);

  // Job comparison
  document.getElementById('compareJobs')?.addEventListener('click', compareJobs);

  // Historical comparison
  document.getElementById('compareHistorical')?.addEventListener('click', compareHistorical);

  // Format currency inputs on blur
  document.querySelectorAll('.input-with-currency input').forEach(input => {
    input.addEventListener('blur', function() {
      const value = parseInputValue(this);
      if (value > 0) {
        this.value = formatNumber(value);
      }
    });

    input.addEventListener('focus', function() {
      const value = parseInputValue(this);
      if (value > 0) {
        this.value = value.toString().replace('.', ',');
      }
    });
  });

  // Progress indicator based on scroll/focus
  document.querySelectorAll('.form-card').forEach(card => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const step = parseInt(card.dataset.section);
          updateProgressIndicator(step);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(card);
  });

  // Mobile bottom sheet
  initMobileBottomSheet();

  // Author avatar
  fetchAuthorAvatar();

  // Initial calculation
  calcularSalarioLiquido();

  // Initialize bracket visualization
  updateBracketVisualization(0);
});

async function fetchAuthorAvatar() {
  try {
    const response = await fetch('https://unavatar.io/x/mbatalhamusic');
    if (response.ok) {
      document.getElementById('authorAvatar').src = response.url;
    }
  } catch (e) {
    console.error('Error fetching avatar:', e);
  }
}

// Export for testing
export {
  calcularIRS,
  calcularIRSLiberal,
  calcularSegurancaSocial,
  calcularSalarioLiquido,
  formatNumber,
};
