class CLTLayerType {
    constructor({ thickness = 35, orientation = 0, material = null }) {
        this.thickness = thickness;
        this.orientation = orientation;
        this.material = material;
        this.properties = new CLTLayerPropertiesType();
    }

    getArea(panelWidth) {
        return panelWidth * this.thickness;
    }

    getInertia(panelWidth) {
        return (panelWidth * Math.pow(this.thickness, 3)) / 12;
    }
}