class PanelPropertiesType {
    constructor({ method, effectiveBendingStiffness, layers, units }) {
        this.method = method;
        this.effectiveBendingStiffness = effectiveBendingStiffness;
        this.layers = layers;
        this.units = units || 'N-mm²/m';
    }
}
