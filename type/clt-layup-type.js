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
        return this.layers.reduce(
            (sum, layer) => sum + layer.thickness,
            0
        );
    }

    isSymmetric() {

        const n = this.layers.length;
    
        for (let i = 0; i < Math.floor(n / 2); i++) {
    
            const top = this.layers[i];
            const bottom = this.layers[n - i - 1];
    
            if (
                top.thickness !== bottom.thickness ||
                top.orientation !== bottom.orientation ||
                top.material.name !== bottom.material.name
            ) {
    
                return false;
    
            }
    
        }
    
        return true;
    
    }

}