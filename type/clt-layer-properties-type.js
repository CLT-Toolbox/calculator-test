class CLTLayerPropertiesType {
    constructor({ index, thickness, y, angle, elasticModulus, h, shearModulus }) {
        this.index = index;
        this.thickness = Number(thickness);
        this.y = Number(y);
        this.angle = Number(angle);
        this.elasticModulus = Number(elasticModulus);
        this.h = Number(h);
        this.shearModulus = Number(shearModulus);
    }
}
