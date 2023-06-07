class Triangle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    square() {
        return this.a * this.b
    }
    p() {
        return this.a + this.b + this.c
    }
}
let rect = new Triangle(2,4,6.4);
console.log(rect.p());
