class Cell_5 extends Cell {
    constructor(x, y, material, hp, illuminated, rnd) {
        super(x, y, material, hp, illuminated, rnd);
        this.colSuelo1 = colSueloBioma5;
        this.colSuelo2 = colSueloBioma1_2;
        this.colRoca = colRocaBioma5;
        this.colOscuridad1 = colOscuridad1;
        this.colOscuridad2 = colOscuridad1_2;
    }

    //en un futuro poner aqui funciones de show() y mas cosas para diferenciar a los biomas mas que simplemente por los colores
}