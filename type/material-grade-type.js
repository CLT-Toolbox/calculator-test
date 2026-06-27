class MaterialGrade {

    constructor(
        name,
        Ex,
        Ey,
        G,
        density = 0
    ) {

        this.name = name;
        this.Ex = Ex;
        this.Ey = Ey;
        this.G = G;
        this.density = density;

    }

}