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
    calculate(cltLayup) {
        cltLayup.validate();
        return cltLayup.method === 'gamma'
            ? new GammaMethod().calculate(cltLayup)
            : new ShearAnalogyMethod().calculate(cltLayup);
    }

    getLayerProperties(cltLayup, centerReference = null) {
        const layers = cltLayup.getLayers();
        const totalThickness = cltLayup.getTotalThickness();
        const neutralAxis = centerReference === null ? totalThickness / 2 : centerReference;
        let thicknessFromBottom = totalThickness;

        return layers.map((layer) => {
            const y = thicknessFromBottom + layer.thickness / 2;
            thicknessFromBottom -= layer.thickness;

            return new CLTLayerPropertiesType({
                index: layer.index,
                thickness: layer.thickness,
                y,
                angle: layer.angle,
                elasticModulus: layer.getElasticModulusXX(),
                h: Math.abs(y - neutralAxis),
                shearModulus: layer.getShearModulus(),
            });
        });
    }
}

class ShearAnalogyMethod extends PanelProperties {
    calculate(cltLayup) {
        cltLayup.validate();
        const layers = this.getLayerProperties(cltLayup, 0).map((layer) => {
            const ownInertia = cltLayup.effectiveWidth * Math.pow(layer.thickness, 3) / 12;
            const parallelAxis = layer.thickness * cltLayup.effectiveWidth * Math.pow(layer.h, 2);
            const stiffness = (ownInertia + parallelAxis) * layer.elasticModulus;

            return { ...layer, ownInertia, parallelAxis, stiffness };
        });

        return new PanelPropertiesType({
            method: 'Shear Analogy',
            effectiveBendingStiffness: layers.reduce((sum, layer) => sum + layer.stiffness, 0),
            layers,
        });
    }
}

class GammaMethod extends PanelProperties {
    calculate(cltLayup) {
        cltLayup.validate();
        const layerProperties = this.getLayerProperties(cltLayup);
        const longitudinalLayers = layerProperties.filter((layer) => layer.elasticModulus > 0);
        const lengthMm = cltLayup.length * 1000;
        const middleIndex = Math.floor(longitudinalLayers.length / 2);
        const middleLayer = longitudinalLayers[middleIndex];
        const centerOffset = this.calculateCenterOffset(longitudinalLayers, cltLayup, lengthMm);

        const layers = layerProperties.map((layer) => {
            if (layer.elasticModulus === 0) {
                return { ...layer, gamma: '-', a: '-', ownInertia: '-', parallelAxis: '-', stiffness: '-' };
            }

            const position = longitudinalLayers.findIndex((item) => item.index === layer.index);
            const gamma = position === middleIndex ? 1 : this.calculateGamma(layer, cltLayup, lengthMm, layerProperties);
            const distanceToMiddle = Math.abs(layer.y - middleLayer.y);
            const a = position < middleIndex
                ? distanceToMiddle - centerOffset
                : distanceToMiddle + centerOffset;
            const ownInertia = cltLayup.effectiveWidth * Math.pow(layer.thickness, 3) / 12;
            const parallelAxis = cltLayup.effectiveWidth * layer.thickness * Math.pow(a, 2);
            const stiffness = (ownInertia + gamma * parallelAxis) * layer.elasticModulus;

            return { ...layer, gamma, a, ownInertia, parallelAxis, stiffness };
        });

        return new PanelPropertiesType({
            method: 'Gamma',
            effectiveBendingStiffness: layers.reduce((sum, layer) => sum + (Number(layer.stiffness) || 0), 0),
            layers,
        });
    }

    calculateGamma(layer, cltLayup, lengthMm, layerProperties) {
        const connector = this.getConnectorLayer(layer, layerProperties);
        const connectorThickness = connector ? connector.thickness : layer.thickness;
        const connectorShearModulus = connector ? connector.shearModulus : layer.shearModulus;
        const connectorRatio = cltLayup.effectiveWidth / connectorThickness;
        return 1 / (1 + Math.pow(Math.PI, 2) * layer.elasticModulus * layer.thickness
            / (connectorRatio * connectorShearModulus * Math.pow(lengthMm, 2)));
    }

    getConnectorLayer(layer, layerProperties) {
        const nextLayer = layerProperties.find((item) => item.index === layer.index + 1);
        const previousLayer = layerProperties.find((item) => item.index === layer.index - 1);

        if (nextLayer && nextLayer.elasticModulus === 0) return nextLayer;
        if (previousLayer && previousLayer.elasticModulus === 0) return previousLayer;
        return null;
    }

    calculateCenterOffset(longitudinalLayers, cltLayup, lengthMm) {
        const middleIndex = Math.floor(longitudinalLayers.length / 2);
        const middleLayer = longitudinalLayers[middleIndex];

        if (longitudinalLayers.length === 2) {
            const top = longitudinalLayers[0];
            const gammaTop = this.calculateGamma(top, cltLayup, lengthMm, this.getLayerProperties(cltLayup));
            const distance = Math.abs(top.y - middleLayer.y);
            return (gammaTop * top.elasticModulus * cltLayup.effectiveWidth * top.thickness * distance)
                / (gammaTop * top.elasticModulus * cltLayup.effectiveWidth * top.thickness
                    + middleLayer.elasticModulus * cltLayup.effectiveWidth * middleLayer.thickness);
        }

        const top = longitudinalLayers[0];
        const bottom = longitudinalLayers[longitudinalLayers.length - 1];
        const layerProperties = this.getLayerProperties(cltLayup);
        const gammaTop = this.calculateGamma(top, cltLayup, lengthMm, layerProperties);
        const gammaBottom = this.calculateGamma(bottom, cltLayup, lengthMm, layerProperties);
        const topDistance = Math.abs(top.y - middleLayer.y);
        const bottomDistance = Math.abs(bottom.y - middleLayer.y);
        const numerator = gammaTop * top.elasticModulus * cltLayup.effectiveWidth * top.thickness * topDistance
            - gammaBottom * bottom.elasticModulus * cltLayup.effectiveWidth * bottom.thickness * bottomDistance;
        const denominator = gammaTop * top.elasticModulus * cltLayup.effectiveWidth * top.thickness
            + middleLayer.elasticModulus * cltLayup.effectiveWidth * middleLayer.thickness
            + gammaBottom * bottom.elasticModulus * cltLayup.effectiveWidth * bottom.thickness;

        return numerator / denominator;
    }
}
