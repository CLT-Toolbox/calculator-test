/**
 * This class to organize the input data for panel calculation
 * To Render the input data, you can use the following code:
 * 
 * const panelProperties = new PanelProperties();
 */

document.addEventListener("DOMContentLoaded", () => {
    changeMethod();
    const calcBtn = document.getElementById("btn-calculate");
    if (calcBtn) {
        calcBtn.addEventListener("click", handleCalculateProcess);
    }
});

function changeMethod() {
    const selectedMethod = document.getElementById("method").value;
    const layerCountDropdown = document.getElementById("layerCount");

    if (selectedMethod === "gamma") {
        layerCountDropdown.innerHTML = `
            <option value="3">3 Layers</option>
            <option value="5">5 Layers</option>
        `;
    } else {
        layerCountDropdown.innerHTML = `
            <option value="3">3 Layers</option>
            <option value="5">5 Layers</option>
            <option value="7">7 Layers</option>
            <option value="9">9 Layers</option>
        `;
    }

    generateLayerInput();
}

function generateLayerInput() {
    const totalLayers = parseInt(document.getElementById("layerCount").value, 10);
    let layerCards = [];

    for (let i = 1; i <= totalLayers; i++) {
        layerCards.push(`
            <div class="card mb-2 border-start-0 border-end-0 rounded-0 shadow-sm">
                <div class="card-body py-3">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <h6 class="mb-0 text-primary fw-bold">Layer ${i}</h6>
                        </div>
                        <div class="col-md-5">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">Thickness</span>
                                <input id="t${i}" type="number" class="form-control" value="35">
                                <span class="input-group-text">mm</span>
                            </div>
                        </div>
                        <div class="col-md-5">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">Orientation</span>
                                <select id="o${i}" class="form-select">
                                    <option value="0">0° (Parallel)</option>
                                    <option value="90">90° (Cross)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    document.getElementById("layerInput").innerHTML = layerCards.join('');
}

function getFormMaterialGrade() {
    return new MaterialGrade(
        document.getElementById("gradeName").value,
        parseFloat(document.getElementById("Ex").value),
        parseFloat(document.getElementById("Ey").value),
        parseFloat(document.getElementById("G").value),
        parseFloat(document.getElementById("density").value)
    );
}

function handleCalculateProcess() {
    const currentMethod = document.getElementById("method").value;
    const layerCount = parseInt(document.getElementById("layerCount").value, 10);
    
    const cltLayup = new CLTLayupType();
    cltLayup.setWidth(parseFloat(document.getElementById("width").value));
    cltLayup.setLength(parseFloat(document.getElementById("length").value));

    const standardMaterial = getFormMaterialGrade();

    for (let i = 1; i <= layerCount; i++) {
        const thickness = parseFloat(document.getElementById(`t${i}`).value);
        const orientation = parseInt(document.getElementById(`o${i}`).value, 10);

        cltLayup.addLayer(
            new CLTLayerType({
                thickness,
                orientation,
                material: standardMaterial
            })
        );
    }

    const engineStrategy = (currentMethod === "shear") 
        ? new ShearAnalogyMethod() 
        : new GammaMethod();

    try {
        const calculationOutput = engineStrategy.calculate(cltLayup);
        renderCalculationResult(calculationOutput);
    } catch (error) {
        alert("Calculation Error: " + error.message);
    }
}

function renderCalculationResult(result) {
    document.getElementById("output").classList.remove("d-none");

    document.getElementById("resultMethod").textContent = `Analytical Method: ${result.method}`;
    document.getElementById("totalThickness").textContent = `${result.totalThickness} mm`;
    document.getElementById("eiResult").textContent = result.EI.toLocaleString('en-US');

    const tableRowHtml = result.layers.map((layer, index) => {
        const p = layer.properties;
        return `
            <tr>
                <td class="fw-bold text-muted">L${index + 1}</td>
                <td><span class="badge ${layer.orientation === 0 ? 'bg-success' : 'bg-warning text-dark'}">${layer.orientation}°</span></td>
                <td>${layer.thickness}</td>
                <td>${p.area.toFixed(0)}</td>
                <td>${p.inertia.toFixed(2)}</td>
                <td>${p.ai.toFixed(2)}</td>
                <td>${p.E}</td>
                <td>${p.EI.toFixed(2)}</td>
                <td>${p.EA2.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    document.getElementById("resultTable").innerHTML = tableRowHtml;

    let extraSummaryHtml = "";

    if (result.method === "Shear Analogy") {
        extraSummaryHtml = `
            <div class="alert alert-success border-0 shadow-sm mt-3">
                <div class="d-flex justify-content-between align-items-center">
                    <span><strong>Effective Shear Stiffness (GA) :</strong></span>
                    <span class="fs-5 fw-bold">${result.GA.toLocaleString('en-US')} Nmm²</span>
                </div>
            </div>
        `;
    } else if (result.method === "Gamma Method") {
        let gammaItems = result.gamma.map((val, idx) => `
            <div class="col-sm-4 mb-2">
                <div class="p-2 border rounded bg-light text-center">
                    <small class="text-muted d-block">Factor γ${idx + 1}</small>
                    <strong class="text-dark">${val.toFixed(4)}</strong>
                </div>
            </div>
        `).join('');

        extraSummaryHtml = `
            <div class="card border-0 bg-light mt-3">
                <div class="card-body p-3">
                    <h6 class="fw-bold mb-3 text-secondary text-uppercase tracking-wider" style="font-size:0.8rem;">Gamma Factors Distribution</h6>
                    <div class="row g-2">${gammaItems}</div>
                </div>
            </div>
        `;
    }

    document.getElementById("extraResult").innerHTML = extraSummaryHtml;
}