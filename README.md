### Calculator Test - Floor Panel Properties
----------------------------------------------------------------------------------------------------------------------------------------
<span style="font-size: 18px">
  Based On The Excel. Please Convert the excel become calculator in web.
</span>

#### 1. Please Follow this illustration to build Datatype CLT Layup

<img width="2816" height="1536" alt="clt-layup" src="https://github.com/user-attachments/assets/66c3569f-e169-4bb7-9b03-2a4644d166f6" />

<span style="font-size: 18px">
  On the illustration above we have Layer 1, Layer 2 etc. Each Layer will be covered on datatype CLTLayerType. For combination of layers, we will store on CLTLayupType. So please Build the Data Structure as the illustration above.
</span>

#### 2. Use The Datatype as Parameter to calculate Panel Properties
<span style="font-size: 18px">
  PanelProperties.calculate(CLTLayupType) => Return PanelPropertiesType
</span>

#### 3. Show The Calculation to Front View
<span style="font-size: 18px">
  After Getting the Data Panel Properties and CLT Layup, you can render the data to html in front view of calculator
</span>

#### 4. Detail Information
<span style="font-size: 18px">
  <ul>
    <li>
      Shear Analogy can calculate 3-9 layers. Gamma can calculate 3-5 layers.
    </li>
    <li>
      When Analytical method choose Shear Analogy. Please only show the section of shear analogy and hide the Gamma. When Gamma choose, please hide shear analogy
    </li>
    <li>
      Show the Input Section and Output Render only.
    </li>
    <li>
      Please implement the calculation with Data Structure and Object Oriented Programming
    </li>
    <li>
      The Candidate freely to delete, update, add the code to implement executing this test
    </li>
    <li>
      Tambahkan limitasi untuk shear analogy simetric dari atas ke bawah. Lalu untuk Gamma Hanya bisa 3 dan 5 layer saja.
    </li>
    <li>
      Please fork this branch and make branch <b>assignment-"name"</b> and add https://github.com/NurAfianto and https://github.com/ikhsan017 as contributor
    </li>
  </ul>
</span>

---

## Implementation Notes

This project implements a CLT floor panel calculator based on `floor-panel-properties.xlsx`.

Implemented requirements:

- CLT layer datatype: `CLTLayerType`.
- CLT layup datatype: `CLTLayupType`.
- Panel result datatype: `PanelPropertiesType`.
- Calculation entry point: `PanelProperties.calculate(CLTLayupType)`.
- Supported analytical methods: Shear Analogy and Gamma.
- Shear Analogy supports 3 to 9 layers.
- Gamma supports 3 or 5 layers only.
- Shear Analogy layup validation checks symmetry from top to bottom.
- Front view renders input section and output result/detail only.
- Calculation logic uses data structures and object-oriented JavaScript.

## Project Structure

```text
.
|-- index.html
|-- calculator.js
|-- floor-panel-properties.xlsx
|-- assets/
|   `-- clt-layup.png
|-- calculation/
|   `-- panel-properties.js
`-- type/
    |-- clt-layer-type.js
    |-- clt-layer-properties-type.js
    |-- clt-layup-type.js
    |-- material-grade-type.js
    `-- panel-properties-type.js
```

## How to Run

This project is a static web app. No build step is required.

Run a local server from the project root:

```bash
python3 -m http.server 8010
```

Open in browser:

```text
http://127.0.0.1:8010/index.html
```

If the page still shows an older layout, hard refresh the browser:

- macOS: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

## How to Use

1. Choose analytical method: `Shear Analogy` or `Gamma`.
2. Choose material grade: `MGP10` or `MGP12`.
3. Enter total layers, layer thickness, span length, and effective width.
4. Click `Calculate Panel`.
5. Review result cards: effective flexural stiffness, CLT layup preview, and calculation detail table.

Validation rules:

- `Shear Analogy` accepts 3 to 9 symmetric layers.
- `Gamma` accepts 3 or 5 layers only.
- Thickness, length, and `beff` must be greater than 0.

## Manual Test Checklist

Use these checks before submitting the assignment:

1. Open `http://127.0.0.1:8010/index.html`.
2. Confirm default input renders without errors.
3. Confirm default Shear Analogy result appears.
4. Switch method to `Gamma` and confirm layer count is limited to `3` or `5`.
5. Switch back to `Shear Analogy` and confirm layer count accepts `3` to `9`.
6. Try invalid values, such as `0` thickness, and confirm validation message appears.
7. Check responsive layout on desktop, tablet, and mobile widths.
8. Open browser DevTools console and confirm there are no JavaScript errors.

## Submission Notes

Current assignment branch:

```text
assignment-anang
```

After pushing the branch, create a pull request from:

```text
assignment-anang
```

to the original repository target branch requested by the assignment.

The assignment also asks to add these GitHub users as contributors:

```text
NurAfianto
ikhsan017
```

If GitHub does not show them automatically as contributors, add them through the fork repository settings or invite them as collaborators, depending on repository permission.
