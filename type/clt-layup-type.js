class CLTLayupType {
    constructor() {
        this.name = "CLT Layup";
        this.width = 1000;
        this.length = 5000;
        this.layers = [];
    }

    addLayer(layer) {
        this.layers.push(layer);
    }

    getLayers() {
        return this.layers;
    }

    getLayerCount() {
        return this.layers.length;
    }

    getWidth() {
        return this.width;
    }

    setWidth(width) {
        this.width = Number(width);
    }

    getLength() {
        return this.length;
    }

    setLength(length) {
        this.length = Number(length);
    }

    getTotalThickness() {
        return this.layers.reduce((sum, layer) => sum + layer.thickness, 0);
    }

    isSymmetric() {
        const layerCount = this.layers.length;
        for (let i = 0; i < Math.floor(layerCount / 2); i++) {
            const topLayer = this.layers[i];
            const bottomLayer = this.layers[layerCount - i - 1];
    
            if (
                topLayer.thickness !== bottomLayer.thickness ||
                topLayer.orientation !== bottomLayer.orientation ||
                topLayer.material.name !== bottomLayer.material.name
            ) {
                return false;
            }
        }
        return true;
    }
}