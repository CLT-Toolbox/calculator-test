class PanelProperties {
  /**
   * Calculate panel properties.
   * @param {CLTLayupType}   cltLayup  
   * @param {number}         beff      
   * @param {object}         options  
   * @returns {PanelPropertiesType}
   */
  calculate(cltLayup, beff, options = {}) {
    throw new Error('PanelProperties.calculate() must be implemented by subclass');
  }

  /**
   * Validate layer count is within allowed range.
   * @param {number} count
   * @param {number} min
   * @param {number} max
   * @param {number[]} allowed 
   */
  _validateLayerCount(count, min, max, allowed = null) {
    if (allowed) {
      if (!allowed.includes(count)) {
        throw new Error(
          `This method only supports ${allowed.join(' or ')} layers. ` +
          `You have ${count} layer(s).`
        );
      }
    } else {
      if (count < min || count > max) {
        throw new Error(
          `Layer count must be between ${min} and ${max}. ` +
          `You have ${count} layer(s).`
        );
      }
    }
  }

  /**
   * Build a pre-filled PanelPropertiesType from the layup metadata.
   * @param {CLTLayupType} cltLayup
   * @param {number}       beff
   * @returns {PanelPropertiesType}
   */
  _initResult(cltLayup, beff) {
    const result          = new PanelPropertiesType();
    result.totalThickness = cltLayup.totalThickness;
    result.layerCount     = cltLayup.layerCount;
    result.beff           = beff;
    return result;
  }
}

class ShearAnalogyMethod extends PanelProperties {
  /**
   * @param {CLTLayupType} cltLayup
   * @param {number}       beff     
   * @param {object}       options 
   * @returns {PanelPropertiesType}
   */
  calculate(cltLayup, beff = 1000, options = {}) {
    this._validateLayerCount(cltLayup.layerCount, 3, 9);

    if (!cltLayup.isSymmetric()) {
      throw new Error(
        'Shear Analogy requires a symmetric layup ' +
        '(layer stack must mirror from top to bottom).'
      );
    }

    cltLayup.computeGeometry();

    const arms   = cltLayup.steinerArms;   
    const result = this._initResult(cltLayup, beff);
    result.method = 'ShearAnalogy';

    let sumEiIi = 0;

    cltLayup.getLayers().forEach((layer, idx) => {
      const lp = new CLTLayerPropertiesType();

      lp.index       = layer.index;
      lp.ti          = layer.thickness;
      lp.yi          = layer.yCentroid;
      lp.theta       = layer.orientation;
      lp.Ei_XX       = layer.E;  
      lp.Gi          = layer.G;
      lp.ai          = arms[idx];

      lp.beff_ti3_12 = beff * Math.pow(layer.thickness, 3) / 12;

      lp.beff_ti_ai2 = beff * layer.thickness * Math.pow(arms[idx], 2);

      lp.EiIi = lp.Ei_XX * (lp.beff_ti3_12 + lp.beff_ti_ai2);

      sumEiIi += lp.EiIi;
      result.layers.push(lp);
    });

    result.EI_eff = sumEiIi;
    return result;
  }
}

class GammaMethod extends PanelProperties {
  /**
   * @param {CLTLayupType} cltLayup
   * @param {number}       beff     
   * @param {object}       options  
   * @returns {PanelPropertiesType}
   */
  calculate(cltLayup, beff = 1000, options = {}) {
    this._validateLayerCount(cltLayup.layerCount, null, null, [3, 5]);

    const Lref = options.Lref ?? 5000;
    if (!Lref || Lref <= 0) throw new Error('Lref must be a positive number (mm).');

    cltLayup.computeGeometry();

    const layers = cltLayup.getLayers();
    const n      = layers.length;
    const result = this._initResult(cltLayup, beff);
    result.method = 'Gamma';
    result.Lref   = Lref;

  
    const activeIdx = layers
      .map((l, i) => ({ l, i }))
      .filter(x => x.l.orientation === 0)
      .map(x => x.i);

    const gammaValues = new Array(n).fill(null);
    const aiEff       = new Array(n).fill(0);

    activeIdx.forEach((li, rank) => {
      const layer = layers[li];
      const Ai    = beff * layer.thickness;
      const Ei    = layer.E;

      if (rank === 0 || rank === activeIdx.length - 1) {
        const crossIdx = (rank === 0) ? li + 1 : li - 1;
        if (crossIdx >= 0 && crossIdx < n) {
          const crossLayer = layers[crossIdx];
          const d_cross    = crossLayer.thickness;  
          const GR = crossLayer.grade.G90 * beff / d_cross;

          gammaValues[li] = 1 / (
            1 + (Math.PI ** 2) * Ei * Ai * d_cross / (Lref ** 2 * GR)
          );
        } else {
          gammaValues[li] = 1;
        }
      } else {
        
        const crossAboveIdx = li - 1;
        const crossBelowIdx = li + 1;
        let GR_above = Infinity, GR_below = Infinity;
        let d_above = 0, d_below = 0;

        if (crossAboveIdx >= 0) {
          const cl = layers[crossAboveIdx];
          d_above  = cl.thickness;
          GR_above = cl.grade.G90 * beff / d_above;
        }
        if (crossBelowIdx < n) {
          const cl = layers[crossBelowIdx];
          d_below  = cl.thickness;
          GR_below = cl.grade.G90 * beff / d_below;
        }
        
        const d_use  = (d_above + d_below) / 2 || d_above || d_below;
        const GR_use = Math.min(GR_above, GR_below);
        gammaValues[li] = 1 / (
          1 + (Math.PI ** 2) * Ei * Ai * d_use / (Lref ** 2 * GR_use)
        );
      }
    });

    const H   = cltLayup.totalThickness;
    const mid = H / 2;

    activeIdx.forEach(li => {
      aiEff[li] = layers[li].yCentroid - mid;
    });

    let sumEIeff = 0;

    layers.forEach((layer, li) => {
      const lp = new CLTLayerPropertiesType();

      lp.index  = layer.index;
      lp.ti     = layer.thickness;
      lp.yi     = layer.yCentroid;
      lp.theta  = layer.orientation;
      lp.Ei_XX  = layer.E;
      lp.Gi     = layer.G;
      lp.Ai     = beff * layer.thickness;

      if (li < n - 1) {
        const nextCross = layers[li + 1];
        if (nextCross.orientation === 90) {
          lp.GR_next = nextCross.grade.G90 * beff / nextCross.thickness;
          lp.di      = nextCross.thickness;
        }
      }

      if (layer.orientation === 0 && gammaValues[li] !== null) {
        lp.gamma   = gammaValues[li];
        lp.ai_eff  = aiEff[li];
        lp.beff_ti3_12 = beff * Math.pow(layer.thickness, 3) / 12;
        lp.beff_ti_ai2 = lp.Ai * Math.pow(aiEff[li], 2);
        lp.EiIi_eff    = layer.E * (lp.beff_ti3_12 + lp.gamma * lp.beff_ti_ai2);
        sumEIeff += lp.EiIi_eff;
      } else {
        lp.gamma       = layer.orientation === 90 ? null : 0;
        lp.EiIi_eff    = 0;
        lp.beff_ti3_12 = 0;
        lp.beff_ti_ai2 = 0;
      }

      result.layers.push(lp);
    });

    result.EI_eff = sumEIeff;
    return result;
  }
}