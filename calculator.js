/**
 * This class to organize the input data for panel calculation
 * To Render the input data, you can use the following code:
 * 
 * const panelProperties = new PanelProperties();
 */
const form = document.getElementById('calculatorForm');
const methodInput = document.getElementById('method');
const gradeInput = document.getElementById('grade');
const layerCountInput = document.getElementById('layerCount');
const thicknessInput = document.getElementById('thickness');
const lengthInput = document.getElementById('length');
const effectiveWidthInput = document.getElementById('effectiveWidth');
const methodHelp = document.getElementById('methodHelp');
const alertContainer = document.getElementById('alert');
const layerPreview = document.getElementById('layerPreview');
const output = document.getElementById('output');

function formatNumber(value) {
    if (value === '-') return value;
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 6 });
}

function buildLayup() {
    return new CLTLayupType({
        grade: MaterialGrade.find(gradeInput.value),
        layerCount: Number(layerCountInput.value),
        thickness: Number(thicknessInput.value),
        length: Number(lengthInput.value),
        effectiveWidth: Number(effectiveWidthInput.value),
        method: methodInput.value,
    });
}

function renderAlert(message) {
    alertContainer.innerHTML = message ? `<div class="alert alert-danger border-0 rounded-4 shadow-sm">${message}</div>` : '';
}

function renderLayerPreview(layup) {
    const layers = new PanelProperties().getLayerProperties(layup, 0);

    layerPreview.innerHTML = `
        <div class="panel-card p-4">
            <div class="d-flex align-items-start justify-content-between gap-3 mb-4">
                <div>
                    <div class="eyebrow mb-1">Layup Preview</div>
                    <h2 class="h4 fw-bold mb-1">CLT Layup</h2>
                    <p class="text-muted-custom mb-0">${layup.layerCount} layers, ${formatNumber(layup.getTotalThickness())} mm total thickness.</p>
                </div>
                <span class="method-badge">${layup.grade.name}</span>
            </div>

            <div class="layer-stack mb-4">
                ${layers.map((layer) => `
                    <div class="layer-bar layer-${layer.angle}">
                        <span>T${layer.index} &middot; ${layer.angle}&deg;</span>
                        <span>${formatNumber(layer.thickness)} mm</span>
                    </div>
                `).join('')}
            </div>

            <div class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                    <thead><tr><th>Layer</th><th>Thickness</th><th>yi</th><th>Angle</th><th>Ei,XX</th><th>G</th></tr></thead>
                    <tbody>
                        ${layers.map((layer) => `
                            <tr>
                                <td class="fw-bold">T${layer.index}</td>
                                <td class="number-cell">${formatNumber(layer.thickness)} mm</td>
                                <td class="number-cell">${formatNumber(layer.y)} mm</td>
                                <td><span class="badge text-bg-light border">${layer.angle}&deg;</span></td>
                                <td class="number-cell">${formatNumber(layer.elasticModulus)} MPa</td>
                                <td class="number-cell">${formatNumber(layer.shearModulus)} MPa</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderOutput(result) {
    const gammaColumns = result.method === 'Gamma'
        ? '<th>Gamma</th><th>ai</th>'
        : '';
    const gammaValues = (layer) => result.method === 'Gamma'
        ? `<td class="number-cell">${formatNumber(layer.gamma ?? '-')}</td><td class="number-cell">${formatNumber(layer.a ?? '-')}</td>`
        : '';

    output.innerHTML = `
        <div class="metric-card p-4 mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div>
                    <div class="eyebrow mb-1">Result</div>
                    <h2 class="h4 fw-bold mb-0">Effective Flexural Stiffness</h2>
                </div>
                <span class="method-badge">${result.method}</span>
            </div>
            <div class="metric-value number-cell">${formatNumber(result.effectiveBendingStiffness)}</div>
            <div class="text-muted-custom mt-1">${result.units}</div>
        </div>

        <div class="panel-card p-4">
            <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div>
                    <div class="eyebrow mb-1">Calculation Detail</div>
                    <h2 class="h4 fw-bold mb-0">${result.method} Method</h2>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Layer</th><th>ti</th><th>yi</th><th>Angle</th><th>Ei,XX</th><th>hi</th>${gammaColumns}<th>beff ti3/12</th><th>beff ti hi2</th><th>EI</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.layers.map((layer) => `
                            <tr>
                                <td class="fw-bold">T${layer.index}</td>
                                <td class="number-cell">${formatNumber(layer.thickness)}</td>
                                <td class="number-cell">${formatNumber(layer.y)}</td>
                                <td><span class="badge text-bg-light border">${layer.angle}&deg;</span></td>
                                <td class="number-cell">${formatNumber(layer.elasticModulus)}</td>
                                <td class="number-cell">${formatNumber(layer.h)}</td>
                                ${gammaValues(layer)}
                                <td class="number-cell">${formatNumber(layer.ownInertia)}</td>
                                <td class="number-cell">${formatNumber(layer.parallelAxis)}</td>
                                <td class="number-cell fw-semibold">${formatNumber(layer.stiffness)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function calculate() {
    try {
        renderAlert('');
        const layup = buildLayup();
        layup.validate();
        renderLayerPreview(layup);
        renderOutput(new PanelProperties().calculate(layup));
    } catch (error) {
        layerPreview.innerHTML = '';
        output.innerHTML = '';
        renderAlert(error.message);
    }
}

function syncLayerInputLimit() {
    if (methodInput.value === 'gamma') {
        layerCountInput.min = '3';
        layerCountInput.max = '5';
        if (![3, 5].includes(Number(layerCountInput.value))) layerCountInput.value = '5';
        methodHelp.textContent = 'Gamma method supports 3 or 5 layers only.';
    } else {
        layerCountInput.min = '3';
        layerCountInput.max = '9';
        methodHelp.textContent = 'Shear Analogy supports 3-9 symmetric layers.';
    }
}

MaterialGrade.list().forEach((grade) => {
    const option = document.createElement('option');
    option.value = grade.name;
    option.textContent = grade.name;
    gradeInput.appendChild(option);
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
});

[methodInput, gradeInput, layerCountInput, thicknessInput, lengthInput, effectiveWidthInput].forEach((input) => {
    input.addEventListener('change', () => {
        syncLayerInputLimit();
        calculate();
    });
});

syncLayerInputLimit();
calculate();
