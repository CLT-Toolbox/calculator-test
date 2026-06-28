/**
 * Class Panel Properties is used to calculate the properties of panel CLT Layup.
 * Panel properties can calculate
 *  - Shear Analogy Method
 *  - Gamma Method
 * 
 * How to use : 
 * calculate(CLTLayup) => PanelProperties
 */

// Base class for panel properties
class PanelProperties {
    calculate() {
        throw new Error("calculate() must be implemented");
    }
}

class ShearAnalogyMethod extends PanelProperties {
    calculate(cltLayup) {
        const layerCount = cltLayup.getLayerCount();
        
        if (layerCount < 3 || layerCount > 9) {
            throw new Error("Shear Analogy only supports 3-9 layers.");
        }

        if (!cltLayup.isSymmetric()) {
            throw new Error("Shear Analogy requires a symmetric layup.");
        }

        const output = new PanelPropertiesType();
        output.method = "Shear Analogy";
        output.totalThickness = cltLayup.getTotalThickness();

        const totalThickness = cltLayup.getTotalThickness();
        let currentPosition = 0;
        let totalEI = 0;
        let totalGA = 0;

        for (const layer of cltLayup.getLayers()) {
            const area = layer.getArea(cltLayup.getWidth());
            const inertia = layer.getInertia(cltLayup.getWidth());
            const center = currentPosition + layer.thickness / 2;
            const ai = center - totalThickness / 2;
            
            const E = layer.orientation === 0 ? layer.material.Ex : layer.material.Ey;

            layer.properties.area = area;
            layer.properties.inertia = inertia;
            layer.properties.center = center;
            layer.properties.ai = ai;
            layer.properties.E = E;

            const EIi = E * inertia;
            const EA2 = E * area * Math.pow(ai, 2);

            layer.properties.EI = EIi;
            layer.properties.EA2 = EA2;

            totalEI += EIi + EA2;
            totalGA += layer.material.G * area;
            currentPosition += layer.thickness;

            output.layers.push(layer);
        }

        output.EI = totalEI;
        output.GA = totalGA;

        return output;
    }
}

class GammaMethod extends PanelProperties {
    calculate(cltLayup) {
        const layerCount = cltLayup.getLayerCount();
        
        if (layerCount !== 3 && layerCount !== 5) {
            throw new Error("Gamma Method only supports 3 or 5 layers.");
        }

        const output = new PanelPropertiesType();
        output.method = "Gamma Method";
        output.totalThickness = cltLayup.getTotalThickness();

        let totalEI = 0;
        const gammaValues = [];
        const totalThickness = cltLayup.getTotalThickness();
        let currentPosition = 0;

        for (const layer of cltLayup.getLayers()) {
            const E = layer.orientation === 0 ? layer.material.Ex : layer.material.Ey;
            const area = layer.getArea(cltLayup.getWidth());
            const inertia = layer.getInertia(cltLayup.getWidth());
            const L = cltLayup.getLength();
            const d = cltLayup.getTotalThickness();

            const gamma = 1 / (1 + (Math.PI * Math.PI * E * area) / (layer.material.G * d * L * L));
            const center = currentPosition + layer.thickness / 2;
            const ai = center - totalThickness / 2;

            const EIi = gamma * E * inertia;
            const EA2 = gamma * E * area * Math.pow(ai, 2);

            layer.properties.area = area;
            layer.properties.inertia = inertia;
            layer.properties.center = center;
            layer.properties.ai = ai;
            layer.properties.E = E;
            layer.properties.gamma = gamma;
            layer.properties.EI = EIi;
            layer.properties.EA2 = EA2;

            gammaValues.push(gamma);
            totalEI += EIi + EA2;
            currentPosition += layer.thickness;
        }

        output.gamma = gammaValues;
        output.EI = totalEI;
        output.layers = cltLayup.getLayers();

        return output;
    }
}