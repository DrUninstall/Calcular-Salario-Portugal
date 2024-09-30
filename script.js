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
    // Calculate the difference for annual and monthly values
    const salarioLiquidoDifferenceAnual = salarioLiquidoLiberalAnual - salarioLiquidoAnual;
    const salarioLiquidoDifferenceMensal = salarioLiquidoLiberalMensal - salarioLiquidoMensal;
    // Format the difference with "+" sign
    const formattedDifferenceAnual = `(+€${formatNumber(salarioLiquidoDifferenceAnual)})`;
    const formattedDifferenceMensal = `(+€${formatNumber(salarioLiquidoDifferenceMensal)})`;

    // Calculate percentages
    const irsPercent = (irsAnual / rendimentoBrutoAnual * 100).toFixed(2);
    const segurancaSocialPercent = (segurancaSocialAnual / rendimentoBrutoAnual * 100).toFixed(2);
    const salarioLiquidoPercent = (salarioLiquidoAnual / rendimentoBrutoAnual * 100).toFixed(2);
    const salarioLiquidoLiberalPercent = (salarioLiquidoLiberalAnual / rendimentoBrutoAnual * 100).toFixed(2);

    // Limpar resultados anteriores
    document.getElementById('resultados').innerHTML = '';

    // Criar containers para Anual e Mensal
    const container = document.createElement('div');
    container.className = 'resultados-container';

    const tipoTrabalhador = document.getElementById('tipoTrabalhador').value;

    // Seção Anual
    const secaoAnual = document.createElement('div');
    secaoAnual.className = 'resultado';

    secaoAnual.innerHTML = `
      <div class="resultados-texto">
          <h3>Anual</h3>
          <div class="graficos">
              <canvas id="graficoAnual" width="600" height="100"></canvas>
          </div>
          ${tipoTrabalhador !== 'porContaOutrem' ? 
          `<p><span class="label">Rendimento Tributável:</span> <span class="valor">€${formatNumber(rendimentoBrutoAnual)}</span></p>` : ''}
          <p><span class="label label-indent">Salário Bruto:</span> <span class="valor">€${formatNumber(rendimentoBrutoAnual)}</span></p>
          <p><span class="dot dot-irs"></span><span class="label">IRS (${irsPercent}%):</span> <span class="valor">€${formatNumber(irsAnual)}</span></p>
          <p><span class="dot dot-segurança-social"></span><span class="label">Segurança Social (${segurancaSocialPercent}%):</span> <span class="valor">€${formatNumber(segurancaSocialAnual)}</span></p>
          <p><span class="dot dot-salario-liquido"></span><span class="label">Salário Líquido (${salarioLiquidoPercent}%):</span> <span class="valor">€${formatNumber(salarioLiquidoAnual)}</span></p>
          <div class="graficos">
              <canvas id="graficoAnualLiberal" width="600" height="100"></canvas>
          </div>
          <p><span class="dot dot-salario-liquido-il"></span><span class="label">Salário Líquido com a Iniciativa Liberal (${salarioLiquidoLiberalPercent}%):</span> 
          <span class="valor">€${formatNumber(salarioLiquidoLiberalAnual)} ${formattedDifferenceAnual}</span></p>
      </div>
    `;

    // Seção Mensal
    const secaoMensal = document.createElement('div');
    const salarioLiquidoMensalDifference = salarioLiquidoLiberalAnual - salarioLiquidoAnual;
    secaoMensal.className = 'resultado';

    secaoMensal.innerHTML = `
      <div class="resultados-texto">
          <h3>Mensal</h3>
          <div class="graficos">
              <canvas id="graficoMensal" width="600" height="100"></canvas>
          </div>
          ${tipoTrabalhador !== 'porContaOutrem' ? 
          `<p><span class="label">Rendimento Tributável:</span> <span class="valor">€${formatNumber(rendimentoBrutoMensal)}</span></p>` : ''}
          <p><span class="label label-indent">Salário Bruto:</span> <span class="valor">€${formatNumber(rendimentoBrutoMensal)}</span></p>
          <p><span class="dot dot-irs"></span><span class="label">IRS (${irsPercent}%):</span> <span class="valor">€${formatNumber(irsMensal)}</span></p>
          <p><span class="dot dot-segurança-social"></span><span class="label">Segurança Social (${segurancaSocialPercent}%):</span> <span class="valor">€${formatNumber(segurancaSocialMensal)}</span></p>
          <p><span class="dot dot-salario-liquido"></span><span class="label">Salário Líquido (${salarioLiquidoPercent}%):</span> <span class="valor">€${formatNumber(salarioLiquidoMensal)}</span></p>
          <div class="graficos">
              <canvas id="graficoMensalLiberal" width="600" height="100"></canvas>
          </div>
          <p><span class="dot dot-salario-liquido-il"></span><span class="label">Salário Líquido com a Iniciativa Liberal (${salarioLiquidoLiberalPercent}%):</span> 
          <span class="valor">€${formatNumber(salarioLiquidoLiberalMensal)} ${formattedDifferenceMensal}</span></p>
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

    // Calculate the total sum of all values (IRS + Segurança Social + Salário Líquido)
    const totalSum = irs + segurancaSocial + salarioLiquido;

    const backgroundColors = isIniciativaLiberal
        ? ['#db3d2d', '#ff6b6b', '#51aaee'] // Iniciativa Liberal: IRS (dark red), Segurança Social (light red), Salário Líquido (light blue)
        : ['#db3d2d', '#ff6b6b', '#26538e']; // Normal: IRS (dark red), Segurança Social (light red), Salário Líquido (dark blue)

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''],  // Use an empty label to preserve the stacking behavior
            datasets: [
                {
                    label: 'Salário Líquido',
                    data: [salarioLiquido],
                    backgroundColor: backgroundColors[2],
                    borderRadius: 8,
                },
                {
                    label: 'IRS',
                    data: [irs],
                    backgroundColor: backgroundColors[0],
                    borderRadius: 8,
                },
                {
                    label: 'Segurança Social',
                    data: [segurancaSocial],
                    backgroundColor: backgroundColors[1],
                    borderRadius: 8,
                }
            ]
        },
        options: {
            indexAxis: 'y',  // Horizontal bar chart
            scales: {
                x: {
                    stacked: true,  // Stack the bars
                    max: totalSum,  // Set the far edge to the total sum of the values
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toLocaleString();  // Format x-axis labels as currency
                        },
                        display: true,  // Show x-axis ticks (currency values)
                    },
                    grid: {
                        display: false,  // Hide x-axis gridlines (reference lines)
                        drawBorder: false,  // Remove the x-axis edge border line
                        drawTicks: false,  // Remove the ticks on the x-axis
                    },
                },
                y: {
                    stacked: true,  // Stack the bars vertically (in a horizontal layout)
                    ticks: {
                        display: false,  // Hide y-axis labels
                    },
                    grid: {
                        display: false,  // Hide y-axis gridlines
                        drawBorder: false,  // Remove the y-axis edge border line
                        drawTicks: false,  // Remove the ticks on the y-axis
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            const percentage = ((value / totalSum) * 100).toFixed(2);  // Calculate percentage
                            const label = tooltipItem.dataset.label;
                            return `${label}: €${value.toLocaleString()} (${percentage}%)`;  // Display value with percentage
                        }
                    }
                },
                legend: {
                    display: false,  // Hide the legend if not needed
                },
                title: {
                    display: true,  // Show the title at the top
                    text: titulo,
                    position: 'top',  // Keep the title at the top
                }
            },
            responsive: true,
            maintainAspectRatio: false,  // Allow the chart to resize based on container
            barPercentage: 1,  // Make the bars take up the full width
            categoryPercentage: 1,  // Ensure no gaps between bars
        }
    });
}



// Fill dinâmico do slider / input range
const rangeSlider = document.querySelector('input[type="range"]');

document.getElementById('dependentes').addEventListener('input', function() {
    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.setProperty('--range-percent', value + '%');
    document.getElementById('numDependentes').textContent = this.value;  // Updating the number of dependents in real-time
});



// Adicionar evento ao botão de simulação
document.getElementById('simular').addEventListener('click', calcularSalarioLiquido);
});