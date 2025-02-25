class Cell_2 extends Cell {
    constructor(x, y, material, hp, illuminated, rnd) {
        super(x, y, material, hp, illuminated, rnd);
        // Define biome-specific color properties
        this.colSuelo1 = colSueloBioma2;
        this.colSuelo2 = colSueloBioma2_2;
        this.colRoca = colRocaBioma2;
        this.colOscuridad1 = colOscuridad2;
        this.colOscuridad2 = colOscuridad2_2;
    }

}
  