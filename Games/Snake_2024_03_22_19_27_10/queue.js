class Queue {
  constructor() {
    this.items = [];
  }

  isEmpty() {
    return this.items.length == 0;
  }

  insertar(elemento) {
    // Insertar al principio del array
    this.items.unshift(elemento);
  }

  sacar() {
    // Sacar el último elemento del array
    if (!this.isEmpty()) {
      return this.items.pop();
    } else {
      throw new Error("La cola está vacía");
    }
  }

  size() {
    return this.items.length;
  }
  
  peek() {
    // Obtener el elemento en el frente de la cola sin eliminarlo
    if (!this.isEmpty()) {
      return this.items[this.items.length - 1];
    } else {
      throw new Error("La cola está vacía");
    }
  }
}

