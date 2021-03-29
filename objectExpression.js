"use strict";

function Const(val) {
    this.evaluate = () => val;
    this.toString = () => val.toString();
    this.diff = () => new Const(0);
}

const varMap = {
    "x": 0,
    "y": 1,
    "z": 2
}
function Variable(sym) {
    this.evaluate = (...args) => args[varMap[sym]];
    this.toString = () => sym;
    this.diff = x => new Const(sym === x ? 1 : 0);
}
function Operation(f, symbol, ...operands) {
    this.evaluate = (...args) => f(...(operands.map(x => x.evaluate(...args))));
    this.toString = () => operands.map(x => x.toString()).join(" ") + " " + symbol;
}

function Add(left, right) {
    Operation.call(this, (x, y) => x + y, "+", left, right);
    this.diff = x => new Add(left.diff(x), right.diff(x));
}

function Subtract(left, right) {
    Operation.call(this, (x, y) => x - y, "-", left, right);
    this.diff = x => new Subtract(left.diff(x), right.diff(x));
}

function Multiply(left, right) {
    Operation.call(this, (x, y) => x * y, "*", left, right);
    this.diff = x =>
         new Add(
            new Multiply(
                left.diff(x),
                right
            ),
            new Multiply(
                left,
                right.diff(x)
            )
        )
}

function Divide(left, right) {
    Operation.call(this, (x, y) => x / y, "/", left, right);
    this.diff = x =>
        new Divide(
            new Subtract(
                new Multiply(
                    left.diff(x),
                    right
                ),
                new Multiply(
                    left,
                    right.diff(x)
                )
            ),
            new Multiply(right, right)
        )
}

function Negate(arg) {
    Operation.call(this, x => -x, "negate", arg);
    this.diff = x => new Negate(arg.diff(x));
}

const operationsMap = {
    "+": Add,
    "-": Subtract,
    "*": Multiply,
    "/": Divide,
    "negate": Negate
}

const arityMap = {
    "+": 2,
    "-": 2,
    "*": 2,
    "/": 2,
    "negate": 1
}
const parse = str => {
    const stack = [];
    const constructOperation = (arity, op) => {
        const args = []
        for (let i = 0; i < arity; i++) {
            args.unshift(stack.pop())
        }
        stack.push(new op(...args));
    }
    for (const elem of str.trim().split(/\s+/)) {
        if (elem in operationsMap) {
            constructOperation(arityMap[elem], operationsMap[elem]);
        } else if (elem === "x" || elem === "y" || elem === "z") {
            stack.push(new Variable(elem));
        } else {
            stack.push(new Const(parseFloat(elem)));
        }
    }
    return stack.pop();
}

