import Big from 'big.js';

export default function operate(numberOne: any, numberTwo: any, operation: any) {
    console.log("we're in operate")

    console.log(numberOne)
    console.log(numberTwo)
    const one = Big(numberOne);
    const two = Big(numberTwo);

    console.log("1 is" + one)
    console.log("2 is" + two)
    if (operation === '+') {
        return one.plus(two).toString();
    }
    if (operation === '-') {
        return one.minus(two).toString();
    }
    if (operation === 'x') {
        return one.times(two).toString();
    }
    if (operation === '÷') {
        try {
            return one.div(two).toString();
        } catch (err) {
            return "Can't divide by 0.";
        }
    }
    if (operation === '%') {
        try {
            return one.mod(two).toString();
        } catch (err) {
            return "Can't find modulo as can't divide by 0.";
        }
    }
    throw Error(`Unknown operation '${operation}'`);
}