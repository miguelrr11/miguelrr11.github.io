class Simulation{
    constructor(){
        this.entorno = new Entorno()
        this.init()
    }

    init(){
        this.ovejas = []
        for(let i = 0; i < N_OVEJAS; i++){
            this.ovejas.push(new Oveja(this.entorno))
        }
    }

    update(){
        for(let o of this.ovejas) o.update()
    }

    show(){
        this.entorno.show()
        for(let o of this.ovejas) o.show()
    }
}