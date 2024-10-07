import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabaseUrl = 'https://lauaziguiohgnbidupoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdWF6aWd1aW9oZ25iaWR1cG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNzU1MzAsImV4cCI6MjA0MzY1MTUzMH0.MqT20CxX2kyo5mbIm2ijLc7p-LM4Xi2Tc-BIDi4W1ac';
const supabase = createClient(supabaseUrl, supabaseKey);


window.addEventListener('DOMContentLoaded', function() {
    // Set default value for "Rendimento Bruto"
    const rendimentoBrutoInput = document.getElementById('rendimentoBruto');
    rendimentoBrutoInput.value = 2000;

    // Update the number of dependents in real-time (UI only)
    document.getElementById('dependentes').addEventListener('input', function() {
        document.getElementById('numDependentes').textContent = this.value;
    });

    // Initial calculation to show default results
    calcularSalarioLiquido();
    toggleMensalAnualResults();

    // Add event listener for the simulation button to trigger calculation
    document.getElementById('simular').addEventListener('click', function() {
        calcularSalarioLiquido();  // Perform calculation
        toggleMensalAnualResults();  // Show/hide relevant results
        saveSimulationResult();  // Save result to Supabase
    });

    // Function to save the simulation result
    async function saveSimulationResult() {
        const rendimentoBruto = parseFloat(document.getElementById('rendimentoBruto').value);
        const localizacao = document.getElementById('localizacao').value;
        const estadoCivil = document.getElementById('estadoCivil').value;
        const dependentes = parseInt(document.getElementById('dependentes').value);
        const tipoTrabalhador = document.getElementById('tipoTrabalhador').value;
        const periodo = document.querySelector('input[name="periodo"]:checked').value === 'mensal';

        // Insert into the Supabase table
        const { data, error } = await supabase
            .from('salarioPortuguesSimulador')
            .insert([
                {
                    rendimentoBruto: rendimentoBruto,
                    localizacao: localizacao,
                    estadoCivil: estadoCivil,
                    dependentes: dependentes,
                    tipoTrabalhador: tipoTrabalhador,
                    periodo: periodo,
                }
            ]);

        if (error) {
            console.error('Error saving simulation:', error);
        } else {
            console.log('Simulation saved:', data);
        }
    }
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

// Updated IRS tables for Não Casado sem Dependentes ou Casado 2 Titulares
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

// Updated IRS tables for Não Casado com Dependentes
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

// Updated IRS tables for Casado Único Titular
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




// Função para calcular o IRS
function calcularIRS(rendimentoMensal, estadoCivil, dependentes) {
    let tabelaIRS;

    // Choose the correct IRS table based on marital status and dependents
    if (estadoCivil === 'naoCasado' && dependentes === 0) {
        tabelaIRS = tabelasIRS_NaoCasado;
    } else if (estadoCivil === 'naoCasado' && dependentes > 0) {
        tabelaIRS = tabelasIRS_NaoCasadoComDependentes;
    } else if (estadoCivil === 'casado1') {
        tabelaIRS = tabelasIRS_CasadoUnicoTitular;
    } else {
        // Default to the non-dependent table for now if no match found
        tabelaIRS = tabelasIRS_NaoCasado;
    }

    let irs = 0;
    for (let faixa of tabelaIRS) {
        if (rendimentoMensal <= faixa.limiteSuperior) {
            let taxaMarginal = faixa.taxaMarginal;
            let parcelaAbater = typeof faixa.parcelaAbater === 'function' ? faixa.parcelaAbater(rendimentoMensal) : faixa.parcelaAbater;
            let parcelaDependente = faixa.parcelaDependente * dependentes;

            irs = rendimentoMensal * taxaMarginal - parcelaAbater - parcelaDependente;

            // Ensure IRS is non-negative
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
    const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
    const periodo = document.querySelector('input[name="periodo"]:checked').value; // Get Mensal/Anual
    const rendimentoBrutoInput = parseFloat(document.getElementById('rendimentoBruto').value);

    if (isNaN(rendimentoBrutoInput) || rendimentoBrutoInput <= 0) {
        alert('Por favor, insira um valor de rendimento bruto válido.');
        return;
    }

    // Calculate monthly income
    let rendimentoMensal = periodo === 'anual' ? rendimentoBrutoInput / 14 : rendimentoBrutoInput;

    // Calculate IRS based on the current tax system (applied on 75% of income for simplified independent workers)
    const tipoTrabalhador = document.getElementById('tipoTrabalhador').value;
    let rendimentoTributavel = tipoTrabalhador === 'independenteSimplificado' ? rendimentoMensal * 0.75 : rendimentoMensal;

    // Calculate IRS
    let irsMensal = calcularIRS(rendimentoTributavel, estadoCivil, dependentes);

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
        <h4>Simulação Anual - Iniciativa Liberal</h4>
        <div class="graficos">
            <canvas id="graficoAnualLiberal" width="720" height="48"></canvas>
        </div>
        <p>
        <span class="dot dot-salario-liquido-il"></span>
        <span class="icon"><img src="./icons/Iniciativa_Liberal_Icon 1.svg" alt="Iniciativa_Liberal_Icon 1"></span>
        <span class="label">Salário Líquido - IL (${salarioLiquidoLiberalPercent}%):</span> 
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
        <h4>Simulação Mensal - Iniciativa Liberal</h4>
        <div class="graficos">
            <canvas id="graficoMensalLiberal" width="720" height="48"></canvas>
        </div>
        <p>
        <span class="dot dot-salario-liquido-il"></span>
        <span class="icon"><img src="./icons/Iniciativa_Liberal_Icon 1.svg" alt="Iniciativa_Liberal_Icon 1"></span>
        <span class="label">Salário Líquido - IL (${salarioLiquidoLiberalPercent}%):</span> 
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