

export const clauseEvaluator = () => {
    const contractData = {
        state: "CA",
        department: "Sales",
        amount: 15000,
        isRenewable: true
    };

    const rule: any = [
        "AND",
        ["==", "state", "CA"],
        [">", "amount", 10000],
        ["OR",
            ["==", "department", "Sales"],
            ["==", "department", "Legal"]
        ]
    ];

    const response = evaluateRule({
        data: contractData,
        rule
    })
    console.log(`Meets criteria: ${response}`)
}

// If Product comes to you tomorrow and asks for a "CONTAINS" operator,
// you only add one line here. You do not touch the core logic below.
const OPERATORS = {
    '==': (a: any, b: any) => a === b,
    '!=': (a: any, b: any) => a !== b,
    '>': (a: any, b: any) => a > b,
    '<': (a: any, b: any) => a < b,
    '>=': (a: any, b: any) => a >= b,
    '<=': (a: any, b: any) => a <= b,
    'AND': (...args: any[]) => args.every(arg => Boolean(arg)),
    'OR': (...args: any[]) => args.some(arg => Boolean(arg)),
    // Example of easy extensibility:
    'IN': (value: any, array: any[]) => Array.isArray(array) && array.includes(value)
};

const evaluateRule = ({ data, rule }: { rule: any, data: any }) => {
    // If it's not an array, it's a leaf node (a variable name or a literal value)
    if (!Array.isArray(rule)) {
        // If the string exists as a key in our data, resolve it.
        // Otherwise, assume it's a literal value (like "CA" or 15000).
        if (typeof rule === 'string' && data.hasOwnProperty(rule)) {
            return data[rule];
        }

        // Note: If a variable is missing from data, it falls through and returns 
        // the variable name as a string, which handles missing data without crashing.
        return rule;
    }

    // 2. Empty rule check
    if (rule.length === 0) return false;

    const [operator, ...operands] = rule;

    // Gracefully handle bad data
    if (!OPERATORS[operator as keyof typeof OPERATORS]) {
        throw new Error(`EVAL_ERROR: The operator '${operator}' is not supported.`);
    }

    // Recursively evaluate the nested arrays from the bottom up
    const evaluatedOperands = operands.map(op => evaluateRule({
        data,
        rule: op
    })) as any[];

    // Apply the operator logic to the resolved values
    return (OPERATORS[operator as keyof typeof OPERATORS] as (...args: any[]) => unknown)(...evaluatedOperands);
}