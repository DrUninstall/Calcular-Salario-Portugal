window.addEventListener('DOMContentLoaded', function() {
// Atualizar o número de dependentes em tempo real
document.getElementById('dependentes').addEventListener('input', function() {
    document.getElementById('numDependentes').textContent = this.value;
});

// Tabelas de IRS atualizadas
const tabelasIRS = [
    {
        limiteSuperior: 820.00,
        taxaMarginal: 0.00,
        parcelaAbater: 0.00
    },
    {
        limiteSuperior: 935.00,
        taxaMarginal: 0.1325,
        parcelaAbater: function(R) {
            return 0.1325 * 2.6 * (1135.39 - R);
        }
    },
    {
        limiteSuperior: 1001.00,
        taxaMarginal: 0.18,
        parcelaAbater: function(R) {
            return 0.18 * 1.4 * (1385.20 - R);
        }
    },
    {
        limiteSuperior: 1123.00,
        taxaMarginal: 0.18,
        parcelaAbater: 96.82
    },
    {
        limiteSuperior: 1765.00,
        taxaMarginal: 0.26,
        parcelaAbater: 186.66
    },
    {
        limiteSuperior: 2057.00,
        taxaMarginal: 0.3275,
        parcelaAbater: 305.80
    },
    {
        limiteSuperior: 2664.00,
        taxaMarginal: 0.37,
        parcelaAbater: 393.23
    },
    {
        limiteSuperior: 3193.00,
        taxaMarginal: 0.3872,
        parcelaAbater: 439.05
    },
    {
        limiteSuperior: 4173.00,
        taxaMarginal: 0.4005,
        parcelaAbater: 481.52
    },
    {
        limiteSuperior: 5470.00,
        taxaMarginal: 0.41,
        parcelaAbater: 521.17
    },
    {
        limiteSuperior: 6540.00,
        taxaMarginal: 0.4270,
        parcelaAbater: 614.16
    },
    {
        limiteSuperior: 20067.00,
        taxaMarginal: 0.4495,
        parcelaAbater: 761.31
    },
    {
        limiteSuperior: Infinity,
        taxaMarginal: 0.4717,
        parcelaAbater: 1206.80
    }
];

// Função para calcular o IRS
function calcularIRS(rendimentoMensal) {
    let irs = 0;

    for (let faixa of tabelasIRS) {
        if (rendimentoMensal <= faixa.limiteSuperior) {
            let taxaMarginal = faixa.taxaMarginal;
            let parcelaAbater = 0;

            if (typeof faixa.parcelaAbater === 'function') {
                parcelaAbater = faixa.parcelaAbater(rendimentoMensal);
            } else {
                parcelaAbater = faixa.parcelaAbater;
            }

            irs = rendimentoMensal * taxaMarginal - parcelaAbater;

            // Garantir que o IRS não seja negativo
            if (irs < 0) irs = 0;

            break;
        }
    }

    return irs;
}

// Função para calcular o salário líquido
function calcularSalarioLiquido() {
    // Obter os valores dos inputs
    const localizacao = document.getElementById('localizacao').value;
    const estadoCivil = document.getElementById('estadoCivil').value;
    const dependentes = parseInt(document.getElementById('dependentes').value);
    const periodo = document.querySelector('input[name="periodo"]:checked').value;
    const rendimentoBrutoInput = parseFloat(document.getElementById('rendimentoBruto').value);
    const tipoTrabalhador = document.getElementById('tipoTrabalhador').value;

    if (isNaN(rendimentoBrutoInput) || rendimentoBrutoInput <= 0) {
        alert('Por favor, insira um valor de rendimento bruto válido.');
        return;
    }

    // Calcular o rendimento mensal
    let rendimentoMensal = periodo === 'anual' ? rendimentoBrutoInput / 14 : rendimentoBrutoInput;

    // Calcular o IRS mensal (aplicado sobre 75% do rendimento para regime simplificado)
    let rendimentoTributavel = tipoTrabalhador === 'independenteSimplificado' ? rendimentoMensal * 0.75 : rendimentoMensal;
    let irsMensal = calcularIRS(rendimentoTributavel);

    // Calcular Segurança Social (21.4% sobre 70% do rendimento bruto para independentes)
    let segurancaSocialMensal;
    if (tipoTrabalhador === 'porContaOutrem') {
        segurancaSocialMensal = rendimentoMensal * 0.11;  // 11% para empregados
    } else if (tipoTrabalhador === 'independenteSimplificado') {
        segurancaSocialMensal = rendimentoMensal * 0.70 * 0.214;  // 21.4% sobre 70% do rendimento para independentes simplificados
        // Garantir que o valor não seja menor que a contribuição mínima (€72.04)
        const contribuicaoMinima = 480.43 * 0.70 * 0.214;  // Minimo para 2024
        if (segurancaSocialMensal < contribuicaoMinima) {
            segurancaSocialMensal = contribuicaoMinima;
        }
    } else if (tipoTrabalhador === 'independenteContabilidade') {
        segurancaSocialMensal = rendimentoMensal * 0.214;  // 21.4% para independentes com contabilidade organizada
    } else {
        segurancaSocialMensal = 0;
    }

    // Salário Líquido Mensal
    let salarioLiquidoMensal = rendimentoMensal - irsMensal - segurancaSocialMensal;

    // Calcular valores anuais (14 meses)
    let rendimentoBrutoAnual = rendimentoMensal * 14;
    let irsAnual = irsMensal * 14;
    let segurancaSocialAnual = segurancaSocialMensal * 14;
    let salarioLiquidoAnual = salarioLiquidoMensal * 14;

    // Salário Líquido com a Iniciativa Liberal
    let salarioLiquidoLiberalAnual = calcularIniciativaLiberal(rendimentoBrutoAnual, segurancaSocialAnual);
    let salarioLiquidoLiberalMensal = salarioLiquidoLiberalAnual / 14;

    // Exibir os resultados
    exibirResultados(rendimentoBrutoAnual, irsAnual, segurancaSocialAnual, salarioLiquidoAnual, salarioLiquidoLiberalAnual);
}



// Função para calcular o salário líquido com a Iniciativa Liberal
function calcularIniciativaLiberal(rendimentoAnual, segurancaSocialAnual) {
    let irsLiberal = calcularIRSLiberal(rendimentoAnual);

    return rendimentoAnual - irsLiberal - segurancaSocialAnual;
}

// Função para calcular o IRS com a Iniciativa Liberal (apenas o valor do IRS)
function calcularIRSLiberal(rendimentoAnual) {
    let irsLiberal = 0;

    if (rendimentoAnual <= 30000) {
        irsLiberal = rendimentoAnual * 0.15;
    } else {
        irsLiberal = (30000 * 0.15) + ((rendimentoAnual - 30000) * 0.28);
    }

    return irsLiberal;
}

// Função para formatar números com pontos e vírgulas
function formatNumber(value) {
    return value.toLocaleString('pt-PT', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    .replace(/\s/g, '.'); //Substituir espaço por ponto
}

// Função para exibir os resultados e gerar os gráficos
function exibirResultados(rendimentoBrutoAnual, irsAnual, segurancaSocialAnual, salarioLiquidoAnual, salarioLiquidoLiberalAnual) {
    const rendimentoBrutoMensal = rendimentoBrutoAnual / 14;
    const irsMensal = irsAnual / 14;
    const segurancaSocialMensal = segurancaSocialAnual / 14;
    const salarioLiquidoMensal = salarioLiquidoAnual / 14;
    const salarioLiquidoLiberalMensal = salarioLiquidoLiberalAnual / 14;

    // Limpar resultados anteriores
    document.getElementById('resultados').innerHTML = '';

    // Criar containers para Anual e Mensal
    const container = document.createElement('div');
    container.className = 'resultados-container';

    // Seção Anual
    const secaoAnual = document.createElement('div');
    secaoAnual.className = 'resultado';

    secaoAnual.innerHTML = `
      <div class="resultados-texto">
          <h3>Anual</h3>
          <p>Rendimento Tributável: <span class="valor">€${formatNumber(rendimentoBrutoAnual)}</span></p>
          <p>Salário Bruto: <span class="valor">€${formatNumber(rendimentoBrutoAnual)}</span></p>
          <p><span class="dot dot-irs"></span>IRS: <span class="valor">€${formatNumber(irsAnual)}</span></p>
          <p><span class="dot dot-segurança-social"></span>Segurança Social: <span class="valor">€${formatNumber(segurancaSocialAnual)}</span></p>
          <p><span class="dot dot-salario-liquido"></span><strong>Salário Líquido: <span class="valor">€${formatNumber(salarioLiquidoAnual)}</span></strong></p>
          <p><span class="dot dot-salario-liquido-il"></span><strong>Salário Líquido com a Iniciativa Liberal: <span class="valor">€${formatNumber(salarioLiquidoLiberalAnual)}</span></strong></p>
      </div>
      <div class="graficos">
          <canvas id="graficoAnual" width="256" height="256"></canvas>
          <canvas id="graficoAnualLiberal" width="256" height="256"></canvas>
      </div>
    `;

    // Seção Mensal
    const secaoMensal = document.createElement('div');
    secaoMensal.className = 'resultado';

    secaoMensal.innerHTML = `
      <div class="resultados-texto">
          <h3>Mensal</h3>
          <p>Rendimento Tributável: <span class="valor">€${formatNumber(rendimentoBrutoMensal)}</span></p>
          <p>Salário Bruto: <span class="valor">€${formatNumber(rendimentoBrutoMensal)}</span></p>
          <p><span class="dot dot-irs"></span>IRS: <span class="valor">€${formatNumber(irsMensal)}</span></p>
          <p><span class="dot dot-segurança-social"></span>Segurança Social: <span class="valor">€${formatNumber(segurancaSocialMensal)}</span></p>
          <p><span class="dot dot-salario-liquido"></span><strong>Salário Líquido: <span class="valor">€${formatNumber(salarioLiquidoMensal)}</span></strong></p>
          <p><span class="dot dot-salario-liquido-il"></span><strong>Salário Líquido com a Iniciativa Liberal: <span class="valor">€${formatNumber(salarioLiquidoLiberalMensal)}</span></strong></p>
      </div>
      <div class="graficos">
          <canvas id="graficoMensal" width="256" height="256"></canvas>
          <canvas id="graficoMensalLiberal" width="256" height="256"></canvas>
      </div>
    `;

    // Adicionar seções ao container
    container.appendChild(secaoAnual);
    container.appendChild(secaoMensal);

    // Adicionar container ao DOM
    document.getElementById('resultados').appendChild(container);

    // Gerar gráficos
    gerarGrafico('graficoAnual', rendimentoBrutoAnual, irsAnual, segurancaSocialAnual, 'Distribuição Anual');
    gerarGrafico('graficoAnualLiberal', rendimentoBrutoAnual, calcularIRSLiberal(rendimentoBrutoAnual), segurancaSocialAnual, 'Anual com Iniciativa Liberal', true);

    gerarGrafico('graficoMensal', rendimentoBrutoMensal, irsMensal, segurancaSocialMensal, 'Distribuição Mensal');
    gerarGrafico('graficoMensalLiberal', rendimentoBrutoMensal, calcularIRSLiberal(rendimentoBrutoMensal * 14) / 14, segurancaSocialMensal, 'Mensal com Iniciativa Liberal', true);
}

// Função para gerar gráficos
function gerarGrafico(canvasId, salarioBruto, irs, segurancaSocial, titulo, isIniciativaLiberal = false) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const salarioLiquido = salarioBruto - irs - segurancaSocial;

    const backgroundColors = isIniciativaLiberal
        ? ['#db3d2d', '#ff6b6b', '#51aaee'] // Iniciativa Liberal: IRS (vermelho escuro), Segurança Social (vermelho claro), Salário Líquido (azul claro)
        : ['#db3d2d', '#ff6b6b', '#26538e']; // Gráfico Normal: IRS (vermelho escuro), Segurança Social (vermelho claro), Salário Líquido (azul escuro)

    new Chart(ctx, {
        type: 'pie',
        data:{
            labels: ['IRS', 'Segurança Social', 'Salário Líquido'],
            datasets: [{
                data: [irs, segurancaSocial, salarioLiquido],
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            responsive: false, // Desabilitar responsividade
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        },
    });
}


// Adicionar evento ao botão de simulação
document.getElementById('simular').addEventListener('click', calcularSalarioLiquido);
});