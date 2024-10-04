window.addEventListener('DOMContentLoaded', function() {
    // Set default value for "Rendimento Bruto" and default selection
    const rendimentoBrutoInput = document.getElementById('rendimentoBruto');
    rendimentoBrutoInput.value = 2000; // Set default value

    // Atualizar o número de dependentes em tempo real
    document.getElementById('dependentes').addEventListener('input', function() {
        document.getElementById('numDependentes').textContent = this.value;
    });

    // Event listeners for automatic recalculation when relevant inputs change
    document.getElementById('rendimentoBruto').addEventListener('input', calcularSalarioLiquido);
    document.getElementById('localizacao').addEventListener('change', calcularSalarioLiquido);
    document.getElementById('estadoCivil').addEventListener('change', calcularSalarioLiquido);
    document.getElementById('dependentes').addEventListener('input', calcularSalarioLiquido);
    document.getElementById('tipoTrabalhador').addEventListener('change', calcularSalarioLiquido);
    document.querySelectorAll('input[name="periodo"]').forEach(radio => {
        radio.addEventListener('change', function() {
            calcularSalarioLiquido();
            toggleMensalAnualResults(); // Show/Hide results based on the selected period
        });
    });

    // Initial calculation to show default results
    calcularSalarioLiquido();
    toggleMensalAnualResults();

    // Call this after loading DOM to replace icons
    feather.replace();

});

// Função para alternar visibilidade dos resultados "Mensal" e "Anual"
function toggleMensalAnualResults() {
    const selectedPeriod = document.querySelector('input[name="periodo"]:checked').value;
    const secaoAnual = document.querySelector('.resultado.anual');
    const secaoMensal = document.querySelector('.resultado.mensal');

    if (selectedPeriod === 'mensal') {
        if (secaoMensal) secaoMensal.style.display = 'block';
        if (secaoAnual) secaoAnual.style.display = 'none';
    } else if (selectedPeriod === 'anual') {
        if (secaoMensal) secaoMensal.style.display = 'none';
        if (secaoAnual) secaoAnual.style.display = 'block';
    }
}


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

// Minimum wage Portugal 2025
const SALARIO_MINIMO_NACIONAL = 870 * 14;

// Função para calcular o salário líquido
function calcularSalarioLiquido() {
    const localizacao = document.getElementById('localizacao').value;
    const estadoCivil = document.getElementById('estadoCivil').value;
    const dependentes = parseInt(document.getElementById('dependentes').value);
    const periodo = document.querySelector('input[name="periodo"]:checked').value; // Get Mensal/Anual
    const rendimentoBrutoInput = parseFloat(document.getElementById('rendimentoBruto').value);
    const tipoTrabalhador = document.getElementById('tipoTrabalhador').value;

    if (isNaN(rendimentoBrutoInput) || rendimentoBrutoInput <= 0) {
        alert('Por favor, insira um valor de rendimento bruto válido.');
        return;
    }

    // Calculate monthly income
    let rendimentoMensal = periodo === 'anual' ? rendimentoBrutoInput / 14 : rendimentoBrutoInput;

    // Calculate IRS based on the current tax system (applied on 75% of income for simplified independent workers)
    let rendimentoTributavel = tipoTrabalhador === 'independenteSimplificado' ? rendimentoMensal * 0.75 : rendimentoMensal;
    let irsMensal = calcularIRS(rendimentoTributavel);

    // Calculate Social Security
    let segurancaSocialMensal;
    if (tipoTrabalhador === 'porContaOutrem') {
        segurancaSocialMensal = rendimentoMensal * 0.11;  // 11% for employees
    } else if (tipoTrabalhador === 'independenteSimplificado') {
        segurancaSocialMensal = rendimentoMensal * 0.70 * 0.214;  // 21.4% on 70% of gross income for independent workers
        const contribuicaoMinima = 480.43 * 0.70 * 0.214;  // Minimum contribution for 2024
        if (segurancaSocialMensal < contribuicaoMinima) {
            segurancaSocialMensal = contribuicaoMinima;
        }
    } else if (tipoTrabalhador === 'independenteContabilidade') {
        segurancaSocialMensal = rendimentoMensal * 0.214;  // 21.4% for independent workers with organized accounting
    } else {
        segurancaSocialMensal = 0;
    }

    // Calculate monthly net salary
    let salarioLiquidoMensal = rendimentoMensal - irsMensal - segurancaSocialMensal;

    // Calculate annual values (14 months)
    let rendimentoBrutoAnual = rendimentoMensal * 14;
    let irsAnual = irsMensal * 14;
    let segurancaSocialAnual = segurancaSocialMensal * 14;
    let salarioLiquidoAnual = salarioLiquidoMensal * 14;

    // Calculate net salary with Iniciativa Liberal's IRS
    let salarioLiquidoLiberalAnual = calcularIniciativaLiberal(rendimentoBrutoAnual, segurancaSocialAnual);
    let salarioLiquidoLiberalMensal = salarioLiquidoLiberalAnual / 14;

    // Display the results
    exibirResultados(rendimentoBrutoAnual, irsAnual, segurancaSocialAnual, salarioLiquidoAnual, salarioLiquidoLiberalAnual);
}




// Função para calcular o salário líquido com a Iniciativa Liberal
function calcularIniciativaLiberal(rendimentoAnual, segurancaSocialAnual) {
    let irsLiberal = calcularIRSLiberal(rendimentoAnual);

    return rendimentoAnual - irsLiberal - segurancaSocialAnual;
}

// Função para calcular o IRS com a Iniciativa Liberal (apenas o valor do IRS)
function calcularIRSLiberal(rendimentoAnual) {
    const SALARIO_MINIMO_NACIONAL_ANUAL = 870 * 14; // Minimum wage: €870 per month * 14 months
    let rendimentoTributavel = rendimentoAnual - SALARIO_MINIMO_NACIONAL_ANUAL; // Tax only applied to income above the minimum wage
    let irsLiberal = 0;

    if (rendimentoTributavel <= 0) {
        // No tax if income is less than or equal to the minimum wage
        irsLiberal = 0;
    } else if (rendimentoTributavel <= 30000) {
        // Apply 15% to income above the minimum wage and below €30,000
        irsLiberal = rendimentoTributavel * 0.15;
    } else {
        // Apply 15% to the first €30,000 and 28% to the rest
        irsLiberal = (30000 * 0.15) + ((rendimentoTributavel - 30000) * 0.28);
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

    // Calculate the differences (extras)
    const extraAnual = salarioLiquidoLiberalAnual - salarioLiquidoAnual;
    const extraMensal = salarioLiquidoLiberalMensal - salarioLiquidoMensal;

    // Calculate the percentages
    const irsPercent = (irsAnual / rendimentoBrutoAnual * 100).toFixed(2);
    const segurancaSocialPercent = (segurancaSocialAnual / rendimentoBrutoAnual * 100).toFixed(2);
    const salarioLiquidoPercent = (salarioLiquidoAnual / rendimentoBrutoAnual * 100).toFixed(2);
    const salarioLiquidoLiberalPercent = (salarioLiquidoLiberalAnual / rendimentoBrutoAnual * 100).toFixed(2); // Added percentage for Iniciativa Liberal

    document.getElementById('resultados').innerHTML = '';  // Clear previous results

    const container = document.createElement('div');
    container.className = 'resultados-container';

    // Annual Section
    const secaoAnual = document.createElement('div');
    secaoAnual.className = 'resultado anual';
    secaoAnual.innerHTML = `
    <div class="resultados-texto">
        <h2>Simulação Anual</h2>
        <div class="graficos">
            <canvas id="graficoAnual" width="720" height="60"></canvas>
        </div>
        <p>
        <span class="dot dot-salario-bruto"></span>
        <span class="icon"><img src="./icons/Briefcase.svg" alt="Briefcase"></span>
        <span class="label">Salário Bruto:</span>
        <span class="valor">€${formatNumber(rendimentoBrutoAnual)}</span></p>
        <p>
        <span class="dot dot-irs"></span>
        <span class="icon"><img src="./icons/Archive.svg" alt="Archive"></span>
        <span class="label">IRS (${irsPercent}%):</span>
        <span class="valor">€${formatNumber(irsAnual)}</span>
        </p>
        <p><span class="dot dot-segurança-social"></span>
        <span class="icon"><img src="./icons/Shield.svg" alt="Shield"></span>
        <span class="label">Segurança Social (${segurancaSocialPercent}%):</span>
        <span class="valor">€${formatNumber(segurancaSocialAnual)}</span>
        </p>
        <p>
        <span class="dot dot-salario-liquido"></span>
        <span class="icon"><img src="./icons/Check circle.svg" alt="Check Circle"></span>
        <span class="label">Salário Líquido (${salarioLiquidoPercent}%):</span>
        <span class="valor">€${formatNumber(salarioLiquidoAnual)}</span>
        </p>

        <!-- Iniciativa Liberal - Anual Section -->
        <h4>Simulação Anual - IL</h4>
        <div class="graficos">
            <canvas id="graficoAnualLiberal" width="720" height="48"></canvas>
        </div>
        <p>
        <span class="dot dot-salario-liquido-il"></span>
        <span class="icon"><img src="./icons/Iniciativa_Liberal_Icon 1.svg" alt="Iniciativa_Liberal_Icon 1"></span>
        <span class="label">Salário Líquido - Iniciativa Liberal (${salarioLiquidoLiberalPercent}%):</span> 
        <span class="valor" style="background-color: #62ad50; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;">€${formatNumber(salarioLiquidoLiberalAnual)} (+€${formatNumber(extraAnual)})</span>
        </p>
    </div>
    `;

    // Monthly Section
    const secaoMensal = document.createElement('div');
    secaoMensal.className = 'resultado mensal';
    secaoMensal.innerHTML = `
    <div class="resultados-texto">
        <h2>Simulação Mensal</h2>
        <div class="graficos">
            <canvas id="graficoMensal" width="720" height="60"></canvas>
        </div>
        <p>
        <span class="dot dot-salario-bruto"></span>
        <span class="icon"><img src="./icons/Briefcase.svg" alt="Briefcase"></span>
        <span class="label">Salário Bruto:</span>
        <span class="valor">€${formatNumber(rendimentoBrutoMensal)}</span>
        </p>
        <p><span class="dot dot-irs"></span>
        <span class="icon"><img src="./icons/Archive.svg" alt="Archive"></span>
        <span class="label">IRS (${irsPercent}%):</span>
        <span class="valor">€${formatNumber(irsMensal)}</span>
        </p>
        <p>
        <span class="dot dot-segurança-social"></span>
        <span class="icon"><img src="./icons/Shield.svg" alt="Shield"></span>
        <span class="label">Segurança Social (${segurancaSocialPercent}%):</span>
        <span class="valor">€${formatNumber(segurancaSocialMensal)}</span>
        </p>
        <p>
        <span class="dot dot-salario-liquido"></span>
        <span class="icon"><img src="./icons/Check circle.svg" alt="Check Circle"></span>
        <span class="label">Salário Líquido (${salarioLiquidoPercent}%):</span>
        <span class="valor">€${formatNumber(salarioLiquidoMensal)}</span
        </p>

        <!-- Iniciativa Liberal - Mensal Section -->
        <h4>Simulação Mensal - IL</h4>
        <div class="graficos">
            <canvas id="graficoMensalLiberal" width="720" height="48"></canvas>
        </div>
        <p>
        <span class="dot dot-salario-liquido-il"></span>
        <span class="icon"><img src="./icons/Iniciativa_Liberal_Icon 1.svg" alt="Iniciativa_Liberal_Icon 1"></span>
        <span class="label">Salário Líquido - Iniciativa Liberal (${salarioLiquidoLiberalPercent}%):</span> 
        <span class="valor" style="background-color: #62ad50; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;">€${formatNumber(salarioLiquidoLiberalMensal)} (+€${formatNumber(extraMensal)})</span></p>
    </div>
    `;

    container.appendChild(secaoAnual);
    container.appendChild(secaoMensal);

    document.getElementById('resultados').appendChild(container);

    // Generate the charts
    gerarGrafico('graficoAnual', rendimentoBrutoAnual, irsAnual, segurancaSocialAnual);
    gerarGrafico('graficoAnualLiberal', rendimentoBrutoAnual, calcularIRSLiberal(rendimentoBrutoAnual), segurancaSocialAnual);
    gerarGrafico('graficoMensal', rendimentoBrutoMensal, irsMensal, segurancaSocialMensal);
    gerarGrafico('graficoMensalLiberal', rendimentoBrutoMensal, calcularIRSLiberal(rendimentoBrutoMensal * 14) / 14, segurancaSocialMensal);

    // Toggle visibility of Mensal/Anual based on selected period
    toggleMensalAnualResults();
}


// Função para gerar gráficos
function gerarGrafico(canvasId, salarioBruto, irs, segurancaSocial, titulo, isIniciativaLiberal = false) {
    const canvasElement = document.getElementById(canvasId);

    // Set fixed heights for the canvases
    if (!isIniciativaLiberal) {
        canvasElement.style.height = '60px';  // Non-Iniciativa Liberal charts (Distribuição)
    } else {
        canvasElement.style.height = '48px';   // Iniciativa Liberal charts
    }

    const ctx = canvasElement.getContext('2d');
    const salarioLiquido = salarioBruto - irs - segurancaSocial;

    const totalSum = irs + segurancaSocial + salarioLiquido;

    const backgroundColors = isIniciativaLiberal
        ? ['#db3d2d', '#ff6b6b', '#51aaee']
        : ['#db3d2d', '#ff6b6b', '#26538e'];

    // Fixed font sizes for chart titles (in pixels)
    const titleStyles = isIniciativaLiberal
        ? { color: '#51aaee', fontSize: 20 }  // Fixed font size for Iniciativa Liberal charts
        : { color: '#26538e', fontSize: 24 };  // Fixed font size for regular charts

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'Salário Líquido',
                    data: [salarioLiquido],
                    backgroundColor: backgroundColors[2],
                    borderRadius: {
                        topLeft: 4,
                        bottomLeft: 4,
                        topRight: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false // Ensure borders are applied everywhere
                },
                {
                    label: 'IRS',
                    data: [irs],
                    backgroundColor: backgroundColors[0],
                    borderRadius: 4,
                },
                {
                    label: 'Segurança Social',
                    data: [segurancaSocial],
                    backgroundColor: backgroundColors[1],
                    borderRadius: 4,
                }
            ]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: true,
                    max: totalSum,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toLocaleString();
                        },
                        display: true,
                    },
                    grid: {
                        display: false,
                        drawBorder: false,
                        drawTicks: false,
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        display: false,
                    },
                    grid: {
                        display: false,
                        drawBorder: false,
                        drawTicks: false,
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            const percentage = ((value / totalSum) * 100).toFixed(2);
                            const label = tooltipItem.dataset.label;
                            return `${label}: €${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: titulo,
                    position: 'top',
                    color: titleStyles.color,
                    font: {
                        size: titleStyles.fontSize,  // Fixed font size for titles
                        family: "'Raleway', sans-serif",
                        weight: 'bold',
                        lineHeight: 1.2,  // Line height multiplier instead of responsive scaling
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 1,
            categoryPercentage: 1,
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
// document.getElementById('simular').addEventListener('click', calcularSalarioLiquido);