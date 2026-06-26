class CLTLayerType {
    constructor({ index, thickness, angle, grade }) {
        this.index = index;
        this.thickness = Number(thickness);
        this.angle = Number(angle);
        this.grade = grade;
    }

    getElasticModulusXX() {
        return this.angle === 0 ? this.grade.elasticModulus : 0;
    }

    getShearModulus() {
        return this.angle === 0 ? this.grade.shearModulus : this.grade.shearModulus90;
    }
}
