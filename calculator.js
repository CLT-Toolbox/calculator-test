
function renderResult(result) {

    document
        .getElementById("output")
        .classList.remove("d-none");

    document.getElementById("resultMethod").textContent =
        result.method;

    document.getElementById("totalThickness").textContent =
        result.totalThickness + " mm";

    document.getElementById("eiResult").textContent =
        result.EI.toLocaleString();

    let rows = "";

    result.layers.forEach((layer, index) => {

        rows += `
            <tr>
    
                <td>Layer ${index + 1}</td>
                <td>${layer.orientation}°</td>
                <td>${layer.thickness}</td>
                <td>${layer.properties.area}</td>
                <td>${layer.properties.inertia.toFixed(2)}</td>
                <td>${layer.properties.ai.toFixed(2)}</td>
                <td>${layer.properties.E}</td>
                <td>${layer.properties.EI.toFixed(2)}</td>
                <td>${layer.properties.EA2.toFixed(2)}</td>
    
            </tr>
            `;

    });

    document.getElementById("resultTable").innerHTML = rows;

    let extra = "";

    if (result.method === "Shear Analogy") {

        extra = `
            <div class="alert alert-info">
    
                <strong>GA :</strong>
    
                ${result.GA.toLocaleString()}
    
            </div>
            `;

    }

    if (result.method === "Gamma Method") {

        extra =
            `
            <div class="card mt-3">
    
                <div class="card-header">
    
                    Gamma Factors
    
                </div>
    
                <div class="card-body">
            `;

        result.gamma.forEach((g, index) => {

            extra += `
                <p>
    
                    γ${index + 1} :
                    ${g.toFixed(4)}
    
                </p>
                `;

        });

        extra += `
                </div>
    
            </div>
            `;

    }

    document.getElementById("extraResult").innerHTML = extra;

}

window.onload = function () {

    changeMethod();

}

function changeMethod() {

    const method =
        document.getElementById("method").value;

    const layerCount =
        document.getElementById("layerCount");

    if (method === "gamma") {

        layerCount.innerHTML = `
            <option>3</option>
            <option>5</option>
        `;

    } else {

        layerCount.innerHTML = `
            <option>3</option>
            <option>5</option>
            <option>7</option>
            <option>9</option>
        `;

    }

    generateLayerInput();

}

function generateLayerInput() {

    const total =
        parseInt(
            document.getElementById("layerCount").value
        );

    let html = "";

    for (let i = 1; i <= total; i++) {

        html += `

        <div class="card mb-2">

            <div class="card-body">

                <h5>Layer ${i}</h5>

                <div class="row">

                    <div class="col">

                        <label>Thickness</label>

                        <input
                            id="t${i}"
                            type="number"
                            class="form-control"
                            value="35">

                    </div>

                    <div class="col">

                        <label>Orientation</label>

                        <select
                            id="o${i}"
                            class="form-select">

                            <option value="0">0°</option>

                            <option value="90">90°</option>

                        </select>

                    </div>

                </div>

            </div>

        </div>

        `;

    }

    document
        .getElementById("layerInput")
        .innerHTML = html;

}

function calculatePanel() {

    const method =
        document.getElementById("method").value;

    const layup =
        new CLTLayupType();

    const total =
        parseInt(
            document.getElementById("layerCount").value
        );

    const width =
        parseFloat(
            document.getElementById("width").value
        );

    const length =
        parseFloat(
            document.getElementById("length").value
        );

    layup.setWidth(width);
    layup.setLength(length);


    const material =
        new MaterialGrade(

            document.getElementById("gradeName").value,

            parseFloat(
                document.getElementById("Ex").value
            ),

            parseFloat(
                document.getElementById("Ey").value
            ),

            parseFloat(
                document.getElementById("G").value
            ),

            parseFloat(
                document.getElementById("density").value
            )

        );

    for (let i = 1; i <= total; i++) {

        const thickness =
            parseFloat(
                document.getElementById(`t${i}`).value
            );

        const orientation =
            parseInt(
                document.getElementById(`o${i}`).value
            );

        layup.addLayer(
            new CLTLayerType({

                thickness,

                orientation,

                material

            })
        );
    }



    let calculator;

    if (method === "shear") {

        calculator =
            new ShearAnalogyMethod();

    } else {

        calculator =
            new GammaMethod();

    }

    try {

        const result =
            calculator.calculate(layup);

        renderResult(result);

    } catch (e) {

        alert(e.message);

    }

}

