class MaterialGrade {
    constructor(name, elasticModulus, elasticModulus90, shearModulus, shearModulus90) {
        this.name = name;
        this.elasticModulus = Number(elasticModulus);
        this.elasticModulus90 = Number(elasticModulus90);
        this.shearModulus = Number(shearModulus);
        this.shearModulus90 = Number(shearModulus90);
    }

    static list() {
        return [
            new MaterialGrade('MGP10', 1100, 110, 687.5, 62.5),
            new MaterialGrade('MGP12', 1100, 110, 687.5, 62.5),
        ];
    }

    static find(name) {
        return MaterialGrade.list().find((grade) => grade.name === name);
    }
}
