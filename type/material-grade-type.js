class MaterialGrade {
  /**
   * @param {string} name      
   * @param {number} E         
   * @param {number} E90       
   * @param {number} G         
   * @param {number} G90       
   */
  constructor(name, E, E90, G, G90) {
    this.name = name;
    this.E    = E;
    this.E90  = E90;
    this.G    = G;
    this.G90  = G90;
  }

  static MGP10() { return new MaterialGrade('MGP10', 1100, 110, 687.5, 62.5); }
  static MGP12() { return new MaterialGrade('MGP12', 1100, 110, 687.5, 62.5); }

  /**
   * Look up a grade by name string.
   * @param {string} name
   * @returns {MaterialGrade}
   */
  static fromName(name) {
    const map = {
      MGP10: MaterialGrade.MGP10,
      MGP12: MaterialGrade.MGP12,
    };
    const factory = map[name];
    if (!factory) throw new Error(`Unknown material grade: "${name}"`);
    return factory();
  }

  /**
   * Return the appropriate E value for a given orientation.
   * @param {number} theta - Layer angle in degrees (0 or 90)
   * @returns {number} MPa
   */
  getE(theta) { return theta === 0 ? this.E : this.E90; }

  /**
   * Return the appropriate G value for a given orientation.
   * @param {number} theta - Layer angle in degrees (0 or 90)
   * @returns {number} MPa
   */
  getG(theta) { return theta === 0 ? this.G : this.G90; }
}