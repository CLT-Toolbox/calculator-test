class CLTLayerType {
  /**
   * @param {number}        index       
   * @param {number}        thickness   
   * @param {number}        orientation 
   * @param {MaterialGrade} grade       
   */
  constructor(index, thickness, orientation, grade) {
    this.index       = index;
    this.thickness   = thickness;
    this.orientation = orientation;  
    this.grade       = grade;

    this.yTop      = 0;
    this.yBottom   = 0;
    this.yCentroid = 0;
  }


  get E() { return this.grade.getE(this.orientation); }

  get G() { return this.grade.getG(this.orientation); }

  get label() { return `Layer ${this.index}  ${this.orientation}°`; }

  get isPrimary() { return this.orientation === 0; }
}