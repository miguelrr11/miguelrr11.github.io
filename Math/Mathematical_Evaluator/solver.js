function newtonRaphson(x0, expr, tol = 1e-7, maxIter = 1000) {
    let x = x0;               // Current root approximation
    let iter = 0;             // Iteration counter
    let prevFx = 0, prevx = 0; // Previous values for secant method

    // Precompute the constant derivative for linear expressions
    const constantDerivative = detectLinearDerivative(expr);

    while (iter < maxIter) {
        let fx = evaluateExpr(expr, x); // Evaluate f(x) at current x
        let fpx;

        // Use constant derivative if detected
        if (constantDerivative !== null) {
            fpx = constantDerivative;
        } 
        // Use initial derivative approximation or secant-based derivative
        else if (iter === 0) {
            fpx = approximateInitialDerivative(expr, x, 1e-5);
        } else {
            fpx = getDerivative(fx, prevFx, x, prevx); // Secant approximation
        }

        if (Math.abs(fpx) < Number.EPSILON) {
            console.error("Derivative near zero. Unable to continue.");
            return null;
        }

        const xNext = x - fx / fpx; // Newton-Raphson step

        // Check for convergence
        if (Math.abs(xNext - x) < tol) {
            console.log(`Converged in ${iter + 1} iterations.`);
            return xNext;
        }

        // Update previous values
        prevFx = fx;
        prevx = x;
        x = xNext;
        iter++;
    }

    console.error("Newton-Raphson did not converge.");
    return null;
}

// Helper function to evaluate the expression f(x)
function evaluateExpr(expr, x) {
    return getfx(expr, x)
}

// Secant method to approximate the derivative
function getDerivative(fx, prevFx, x, prevx) {
    return (fx - prevFx) / (x - prevx);
}

// Estimate the initial derivative numerically
function approximateInitialDerivative(expr, x, h = 1e-5) {
    const fxh = evaluateExpr(expr, x + h);
    const fx = evaluateExpr(expr, x);
    return (fxh - fx) / h;
}

// Detect and return constant derivative for linear expressions
function detectLinearDerivative(expr) {
    const match = expr.match(/^(\d+)\s*\*\s*x\s*[\+\-]\s*\d+$/);
    if (match) {
        return parseFloat(match[1]); // Extract the coefficient of x
    }
    return null;
}

function rearrangeEquation(equation) {
    // Split the equation into left and right sides
    const [left, right] = equation.split('=');

    // Ensure both sides exist
    if (left === undefined || right === undefined) {
        throw new Error("Invalid equation format. Use 'left = right'.");
    }

    // Rearrange into 'left - right = 0'
    const rearrangedEquation = `${left.trim()} - ( ${right.trim()} ) = 0`;
    
    return rearrangedEquation;
}

// Example usage
const inputEquation = "sin(x/2) = tan(2x) / abs(x)";
const outputEquation = rearrangeEquation(inputEquation);
console.log(outputEquation)

const root = newtonRaphson(100, outputEquation);    // Initial guess: 10

console.log("Root:", root);
