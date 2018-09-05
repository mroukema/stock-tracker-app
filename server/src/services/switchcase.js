const executeIfFunction = (f, arg) =>
    f instanceof Function ? f(arg) : f;

const executeIfFunctionElseCompare = (f, arg) =>
    f instanceof Function ? f(arg) : f === arg;

const defaultCase = () => true;

const switchcase = cases => value => defaultExpression => executeIfFunction(
        [...cases, [defaultCase, defaultExpression]][
            ([...cases, [defaultCase, defaultExpression]]
                .map(_case => _case[0]
            ))
            .findIndex(caseCondition =>
                executeIfFunctionElseCompare(caseCondition, value)
            )
        ][1],
        value
    );

module.exports = switchcase;
