class CLTLayupType {
    constructor({ grade, layerCount, thickness, length, effectiveWidth, method }) {
        this.name = 'CLT Layup';
        this.grade = grade;
        this.layerCount = Number(layerCount);
        this.thickness = Number(thickness);
        this.length = Number(length);
        this.effectiveWidth = Number(effectiveWidth);
        this.method = method;
        /**
         * @type {CLTLayerType[]}
         */
        this.layers = [];

        for (let index = 1; index <= this.layerCount; index += 1) {
            this.layers.push(new CLTLayerType({
                index,
                thickness: this.thickness,
                angle: index % 2 === 1 ? 0 : 90,
                grade: this.grade,
            }));
        }
    }

    getLayers() {
        return this.layers;
    }

    getTotalThickness() {
        return this.layers.reduce((sum, layer) => sum + layer.thickness, 0);
    }

    isSymmetric() {
        return this.layers.every((layer, index) => {
            const opposite = this.layers[this.layers.length - index - 1];
            return layer.thickness === opposite.thickness && layer.angle === opposite.angle;
        });
    }

    validate() {
        if (!this.grade) throw new Error('Grade wajib dipilih.');
        if (!['shear', 'gamma'].includes(this.method)) throw new Error('Analytical method tidak valid.');
        if (!Number.isInteger(this.layerCount)) throw new Error('Total layers wajib bilangan bulat.');
        if (!Number.isFinite(this.thickness) || this.thickness <= 0) throw new Error('Thickness wajib lebih dari 0.');
        if (!Number.isFinite(this.length) || this.length <= 0) throw new Error('Length wajib lebih dari 0.');
        if (!Number.isFinite(this.effectiveWidth) || this.effectiveWidth <= 0) throw new Error('beff wajib lebih dari 0.');
        if (this.method === 'shear' && (this.layerCount < 3 || this.layerCount > 9)) throw new Error('Shear Analogy hanya bisa 3 sampai 9 layer.');
        if (this.method === 'shear' && !this.isSymmetric()) throw new Error('Shear Analogy harus simetris dari atas ke bawah. Gunakan jumlah layer ganjil.');
        if (this.method === 'gamma' && ![3, 5].includes(this.layerCount)) throw new Error('Gamma hanya bisa 3 atau 5 layer.');
    }
}
