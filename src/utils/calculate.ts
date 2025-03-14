import operate from "./operate";

interface CalculatorState {
    equals: boolean;
    total: number | null;
    next: number | null;
    operation: string | null;
}

type Operation = '+' | '-' | 'x' | '÷' | '%';

function isNumber(item: string): boolean {
    return /^[0-9]+$/.test(item);
}

/**
 * Given a button name and a calculator data object, return an updated
 * calculator data object.
 *
 * Calculator data object contains:
 *   total: number | null      the running total
 *   next: number | null       the next number to be operated on with the total
 *   operation: string | null  +, -, etc.
 */
export default function calculate(obj: CalculatorState, buttonName: string): CalculatorState {
    if (buttonName === 'AC') {
        return {
            equals: false,
            total: 0,
            next: null,
            operation: null,
        };
    }

    if (isNumber(buttonName)) {
        // If there is an operation, update next
        if (obj.operation) {
            return {
                equals: true,
                total: Number(operate(obj.total || 0, parseInt(buttonName, 10), obj.operation as Operation)),
                next: null,
                operation: null,
            };
        }

        return {
            next: parseInt(buttonName, 10),
            total: null,
            equals: false,
            operation: null,
        };
    }

    if (buttonName === '=') {
        if (obj.next && obj.operation) {
            return {
                equals: true,
                total: Number(operate(obj.total || 0, obj.next, obj.operation as Operation)),
                next: null,
                operation: null,
            };
        }
        // '=' with no operation, nothing to do
        return { ...obj };
    }

    // User pressed an operation after pressing '='
    if (!obj.next && obj.total && !obj.operation) {
        return { ...obj, operation: buttonName };
    }

    // User pressed an operation button and there is an existing operation
    if (obj.operation) {
        return { ...obj, operation: buttonName };
    }

    // The user hasn't typed a number yet
    if (!obj.next) {
        return { 
            equals: false,
            total: null,
            next: null,
            operation: null 
        };
    }

    // save the operation and shift 'next' into 'total'
    return {
        equals: false,
        total: obj.next,
        next: null,
        operation: buttonName,
    };
}
