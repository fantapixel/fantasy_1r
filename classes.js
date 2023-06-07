class Rectangle {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}


    square() {
        return this.a * this.b
    }
let rect = new Rectangle(2,4);
console.log(rect.square);
