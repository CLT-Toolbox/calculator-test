class PanelProperties {

    calculate() {

        throw new Error(
            "calculate() must be implemented"
        );

    }

}

class ShearAnalogyMethod extends PanelProperties {

    calculate(cltLayup) {

        if (cltLayup.getLayerCount() < 3 ||
            cltLayup.getLayerCount() > 9) {

            throw new Error("Shear Analogy only supports 3-9 layers");

        }

        if (!cltLayup.isSymmetric()) {

            throw new Error(
                "Shear Analogy requires symmetric layup."
            );

        }

        let result = new PanelPropertiesType();

        result.method = "Shear Analogy";

        result.totalThickness = cltLayup.getTotalThickness();

        const totalThickness = cltLayup.getTotalThickness();

        let current = 0;

        let EI = 0;

        let GA = 0;

        for (let layer of cltLayup.getLayers()) {

            const area =
                layer.getArea(
                    cltLayup.getWidth()
                );


            const inertia =
                layer.getInertia(
                    cltLayup.getWidth()
                );

            const center =
                current + layer.thickness / 2;

            const ai =
                center - totalThickness / 2;

            const E =
                layer.orientation === 0
                    ? layer.material.Ex
                    : layer.material.Ey;

            layer.properties.area = area;
            layer.properties.inertia = inertia;
            layer.properties.center = center;
            layer.properties.ai = ai;
            layer.properties.E = E;

            const EIi = E * inertia;
            const EA2 = E * area * Math.pow(ai, 2);

            layer.properties.EI = EIi;
            layer.properties.EA2 = EA2;

            EI += EIi + EA2;

            GA += layer.material.G * area;

            current += layer.thickness;

            result.layers.push(layer);

        }
        result.EI = EI;

        result.GA = GA;

        return result;

    }

}

class GammaMethod extends PanelProperties {

    calculate(cltLayup) {

        let layerCount = cltLayup.getLayerCount();

        if (!(layerCount === 3 || layerCount === 5)) {

            throw new Error(
                "Gamma Method only supports 3 or 5 layers."
            );

        }

        let result = new PanelPropertiesType();

        result.method = "Gamma Method";

        result.totalThickness = cltLayup.getTotalThickness();

        let EI = 0;

        let gammaValue = [];

        const totalThickness = cltLayup.getTotalThickness();

        let current = 0;

        for (let layer of cltLayup.getLayers()) {

            const E =
                layer.orientation === 0
                    ? layer.material.Ex
                    : layer.material.Ey;
        
            const area =
                layer.getArea(cltLayup.getWidth());
        
            const inertia =
                layer.getInertia(cltLayup.getWidth());
        
            const L = cltLayup.getLength();
            const d = cltLayup.getTotalThickness();
        
            const gamma =
                1 /
                (
                    1 +
                    (Math.PI * Math.PI * E * area) /
                    (layer.material.G * d * L * L)
                );
        
            const center =
                current + layer.thickness / 2;
        
            const ai =
                center - totalThickness / 2;
        
            const EIi =
                gamma * E * inertia;
        
            const EA2 =
                gamma * E * area * Math.pow(ai, 2);
        
            layer.properties.area = area;
            layer.properties.inertia = inertia;
            layer.properties.center = center;
            layer.properties.ai = ai;
            layer.properties.E = E;
            layer.properties.gamma = gamma;
            layer.properties.EI = EIi;
            layer.properties.EA2 = EA2;
        
            gammaValue.push(gamma);
        
            EI += EIi + EA2;
        
            current += layer.thickness;
        }
        result.gamma = gammaValue;

        result.EI = EI;

        result.layers = cltLayup.getLayers();

        return result;

    }

}
