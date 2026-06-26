class CLTLayupType {
  /**
   * @param {string} name 
   */
  constructor(name = 'CLT Layup') {
    this.name   = name;
    /** @type {CLTLayerType[]} */
    this.layers = [];
  }

  /**
   * Append a layer to the bottom of the current stack.
   * @param {CLTLayerType} layer
   * @returns {CLTLayupType} this (fluent API)
   */
  addLayer(layer) {
    this.layers.push(layer);
    return this;
  }

  computeGeometry() {
    let cursor = 0;
    for (const layer of this.layers) {
      layer.yTop      = cursor;
      layer.yBottom   = cursor + layer.thickness;
      layer.yCentroid = cursor + layer.thickness / 2;
      cursor = layer.yBottom;
    }
  }

  getLayers() { return this.layers; }

  get totalThickness() {
    return this.layers.reduce((sum, l) => sum + l.thickness, 0);
  }

  get layerCount() { return this.layers.length; }

  /**
   * Distance from top face to centroid of the FULL panel cross-section.
   * Used as the reference y̅ for Steiner-term calculations.
   * @returns {number} mm
   */
  get panelCentroidY() { return this.totalThickness / 2; }

  /**
   * Distance from each layer centroid to the panel centroid.
   * ai = yCentroid_i − panelCentroidY
   * (positive = above, negative = below — sign is squared so direction
   *  doesn't matter for stiffness, but it's kept for completeness.)
   * @returns {number[]} array of ai values in mm
   */
  get steinerArms() {
    const ref = this.panelCentroidY;
    return this.layers.map(l => l.yCentroid - ref);
  }

  /**
   * Check if the layup is symmetric about the panel mid-plane.
   * Used to validate Shear Analogy input (must be symmetric).
   * @returns {boolean}
   */
  isSymmetric() {
    const n = this.layers.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      const top    = this.layers[i];
      const bottom = this.layers[n - 1 - i];
      if (
        top.thickness   !== bottom.thickness   ||
        top.orientation !== bottom.orientation ||
        top.grade.name  !== bottom.grade.name
      ) return false;
    }
    return true;
  }
}