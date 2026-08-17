import { pythonGenerator as Python } from 'blockly/python';
const pythonGenerator = Python;

Python.forBlock['controls_if'] = function (block) {
    let code = '';
    const hasExplicitElse = !!block.getInput('ELSE');

    // Count IFx inputs (IF0 always exists)
    let countIFs = 0;
    while (block.getInput('IF' + countIFs)) countIFs++;

    // if head
    const ifCond = Python.valueToCode(block, 'IF0', Python.ORDER_NONE) || 'False';
    const ifBranch = Python.statementToCode(block, 'DO0') || '';
    code += `if ${ifCond}:\n`;
    code += Python.prefixLines(ifBranch.trim() ? ifBranch : 'pass\n', Python.INDENT);

    // elif chain (IF1..IF{n-1})
    for (let n = 1; n < countIFs; n++) {
        const cond = Python.valueToCode(block, 'IF' + n, Python.ORDER_NONE) || 'False';
        const body = Python.statementToCode(block, 'DO' + n) || '';
        code += `elif ${cond}:\n`;
        code += Python.prefixLines(body.trim() ? body : 'pass\n', Python.INDENT);
    }

    // explicit else only
    if (hasExplicitElse) {
        const elseBranch = Python.statementToCode(block, 'ELSE') || '';
        code += `else:\n`;
        code += Python.prefixLines(elseBranch.trim() ? elseBranch : 'pass\n', Python.INDENT);
    }

    return code;
};

// Reuse the same logic for the project-owned if_block alias.
Python.forBlock['if_block'] = function (block) {
    // Mirror controls_if exactly to keep behavior standardized across projects
    let code = '';
    const hasExplicitElse = !!block.getInput('ELSE');

    let countIFs = 0;
    while (block.getInput('IF' + countIFs)) countIFs++;

    const ifCond = Python.valueToCode(block, 'IF0', Python.ORDER_NONE) || 'False';
    const ifBranch = Python.statementToCode(block, 'DO0') || '';
    code += `if ${ifCond}:\n`;
    code += Python.prefixLines(ifBranch.trim() ? ifBranch : 'pass\n', Python.INDENT);

    for (let n = 1; n < countIFs; n++) {
        const cond = Python.valueToCode(block, 'IF' + n, Python.ORDER_NONE) || 'False';
        const body = Python.statementToCode(block, 'DO' + n) || '';
        code += `elif ${cond}:\n`;
        code += Python.prefixLines(body.trim() ? body : 'pass\n', Python.INDENT);
    }

    if (hasExplicitElse) {
        const elseBranch = Python.statementToCode(block, 'ELSE') || '';
        code += `else:\n`;
        code += Python.prefixLines(elseBranch.trim() ? elseBranch : 'pass\n', Python.INDENT);
    }

    return code;
};

Python.forBlock['control_match'] = function (block) {
    const subject = Python.valueToCode(block, 'SUBJECT', Python.ORDER_NONE) || 'None';
    const cases = Python.statementToCode(block, 'CASES') || '  case _:\n    pass\n';
    return `match ${subject}:\n${cases}`;
};

Python.forBlock['control_case'] = function (block) {
    const pattern = Python.valueToCode(block, 'PATTERN', Python.ORDER_NONE) || '_';
    const statements = Python.statementToCode(block, 'DO') || 'pass';
    return `case ${pattern}:\n${pythonGenerator.prefixLines(statements, pythonGenerator.INDENT)}\n`;
};

// Condition Expression: comparisons, membership, identity
Python.forBlock['control_condition_expr'] = function (block) {
    const a = Python.valueToCode(block, 'A', Python.ORDER_RELATIONAL) || 'None';
    const b = Python.valueToCode(block, 'B', Python.ORDER_RELATIONAL) || 'None';
    const op = block.getFieldValue('OP');
    const MAP = {
        'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=',
        'IN': 'in', 'NOT_IN': 'not in', 'IS': 'is', 'IS_NOT': 'is not'
    };
    const pyOp = MAP[op] || '==';
    return [`${a} ${pyOp} ${b}`, Python.ORDER_RELATIONAL];
};

// Logical Combination: and/or/not with right operand optional for NOT
Python.forBlock['control_logical_combine'] = function (block) {
    const op = block.getFieldValue('LOGICAL_OP');
    const left = Python.valueToCode(block, 'LEFT', op === 'NOT' ? Python.ORDER_LOGICAL_NOT : Python.ORDER_LOGICAL_AND) || 'False';
    if (op === 'NOT') {
        return [`not ${left}`, Python.ORDER_LOGICAL_NOT];
    }
    const right = Python.valueToCode(block, 'RIGHT', op === 'AND' ? Python.ORDER_LOGICAL_AND : Python.ORDER_LOGICAL_OR) || 'False';
    const pyOp = (op === 'AND') ? 'and' : 'or';
    const order = (op === 'AND') ? Python.ORDER_LOGICAL_AND : Python.ORDER_LOGICAL_OR;
    return [`${left} ${pyOp} ${right}`, order];
};

// 4) Truthy/Falsy simplified IF
Python.forBlock['control_if_truthy'] = function (block) {
    const expr = Python.valueToCode(block, 'EXPR', Python.ORDER_NONE) || 'False';
    const branch = Python.statementToCode(block, 'DO') || '';
    let code = `if ${expr}:\n`;
    code += Python.prefixLines(branch.trim() ? branch : 'pass\n', Python.INDENT);
    return code;
};

Python.forBlock['control_for_indexed'] = function (block) {
    const indexVar = pythonGenerator.getVariableName(block.getFieldValue('INDEX_VAR'));
    const valueVar = pythonGenerator.getVariableName(block.getFieldValue('VALUE_VAR'));
    const list = Python.valueToCode(block, 'LIST', Python.ORDER_NONE) || '[]';
    const branch = Python.statementToCode(block, 'DO') || 'pass';
    return `for ${indexVar}, ${valueVar} in enumerate(${list}):\n${pythonGenerator.prefixLines(branch, pythonGenerator.INDENT)}\n`;
};

Python.forBlock['control_for_zip'] = function (block) {
    const vars = block.getFieldValue('VARS');
    const elements = [];
    for (let i = 0; i < block.itemCount_; i++) {
        const code = Python.valueToCode(block, 'ADD' + i, Python.ORDER_NONE) || '[]';
        elements.push(code);
    }
    const lists = elements.join(', ');
    const branch = Python.statementToCode(block, 'DO') || 'pass';
    return `for ${vars} in zip(${lists}):\n${pythonGenerator.prefixLines(branch, pythonGenerator.INDENT)}\n`;
};

Python.forBlock['control_lambda_expr'] = function (block) {
    const args = block.getFieldValue('ARGS');
    const expr = Python.valueToCode(block, 'EXPR', Python.ORDER_NONE) || 'None';
    return [`lambda ${args}: ${expr}`, Python.ORDER_LAMBDA];
};

Python.forBlock['control_partial_apply'] = function (block) {
    pythonGenerator.addImport('import functools');
    const func = Python.valueToCode(block, 'FUNC', Python.ORDER_NONE) || 'None';
    const args = Python.valueToCode(block, 'ARGS', Python.ORDER_NONE) || '[]';
    return [`functools.partial(${func}, *${args})`, Python.ORDER_FUNCTION_CALL];
};

// Robust generator for control_function_def — paste into python.js near other generators
Python.forBlock['control_function_def'] = function (block) {
    // helper: safe getFieldValue that returns null if field doesn't exist
    function fieldVal(name) {
        try { return block.getFieldValue(name); } catch (e) { return null; }
    }

    // simple indent function (4 spaces)
    function indent(text, nSpaces = 4) {
        if (!text) return '';
        const pad = ' '.repeat(nSpaces);
        // ensure we keep trailing newline if present
        return text.split('\n').map(function (line) {
            return line.length ? pad + line : line;
        }).join('\n') + (text.endsWith('\n') ? '' : '\n');
    }

    // function name
    const name = fieldVal('NAME') || 'my_function';

    // Collect params from mutator inputs named PARAM0, PARAM1, ...
    const paramsArr = [];
    let i = 0;
    while (true) {
        const inputName = 'PARAM' + i;
        if (!block.getInput(inputName)) break;

        // variable name field (VAR{i}), type field (TYPE{i}), default field (MINUS{i})
        const varName = fieldVal('VAR' + i);
        const typeAnn = fieldVal('TYPE' + i); // optional type annotation
        const minusDefault = fieldVal('MINUS' + i); // default stored as a field (string)
        // default provided by a connected value block (preferred)
        let defaultCode = '';
        try {
            defaultCode = Python.valueToCode(block, inputName, Python.ORDER_NONE) || '';
        } catch (e) {
            // if Python.valueToCode isn't available for some reason, leave defaultCode ''
            defaultCode = '';
        }

        // Use connected value first; if not present, fall back to MINUS field value
        let finalDefault = defaultCode.trim() ? defaultCode.trim() : (minusDefault ? minusDefault : null);

        // Build param text
        // fallback variable name if not provided
        const argName = varName || ('arg' + i);
        let paramText = argName;

        if (typeAnn) paramText += `: ${typeAnn}`;
        if (finalDefault !== null && finalDefault !== undefined) {
            // if default looks like a bare string without quotes, keep as-is (assume user provided proper literal)
            paramText += `=${finalDefault}`;
        }

        paramsArr.push({
            text: paramText,
            rawName: argName
        });
        i++;
    }

    // Support positional-only (/) and keyword-only (*) markers if mutator stored split indices:
    // - POSONLY: index (integer) after which we should insert '/'
    // - KWONLY: index (integer) before which we should insert '*'
    // These fields are optional; if not present, no markers are emitted.
    const posOnlyIndexRaw = fieldVal('POSONLY'); // e.g. "2" means first 2 args are positional-only -> place '/' after index 2
    const kwOnlyIndexRaw = fieldVal('KWONLY');   // e.g. "2" means args from index 2 onwards are keyword-only -> place '*' before index 2

    // convert to integers when possible
    const posOnlyIndex = posOnlyIndexRaw ? parseInt(posOnlyIndexRaw, 10) : null;
    const kwOnlyIndex = kwOnlyIndexRaw ? parseInt(kwOnlyIndexRaw, 10) : null;

    // Build final params string with markers
    const parts = [];
    for (let idx = 0; idx < paramsArr.length; idx++) {
        // insert '*' marker before kwOnlyIndex if kwOnlyIndex equals current index
        if (kwOnlyIndex !== null && idx === kwOnlyIndex) {
            // If '*' would collide with positional-only '/', Python allows "/, *" only in specific orders;
            // here we just insert '*' where requested.
            parts.push('*');
        }

        parts.push(paramsArr[idx].text);

        // insert '/' after posOnlyIndex (posOnlyIndex is count of positional-only args)
        if (posOnlyIndex !== null && idx === (posOnlyIndex - 1)) {
            parts.push('/');
        }
    }

    // Edge cases:
    // - If posOnlyIndex equals number of params, ensure trailing '/' is added.
    if (posOnlyIndex !== null && posOnlyIndex === paramsArr.length) {
        // if not already added
        if (parts[parts.length - 1] !== '/') parts.push('/');
    }

    const paramsCode = parts.length ? parts.join(', ') : '';

    // function body
    let branch = '';
    try {
        branch = Python.statementToCode(block, 'DO') || '';
    } catch (e) {
        branch = '';
    }
    if (!branch.trim()) {
        branch = indent('pass\n');
    } else {
        // ensure branch lines are indented (statementToCode usually returns already-indented code; but re-indent to be safe)
        branch = indent(branch.replace(/\n+$/, ''));
    }

    // optional return value input
    let returnExpr = '';
    try {
        returnExpr = Python.valueToCode(block, 'RETURN', Python.ORDER_NONE) || '';
    } catch (e) {
        returnExpr = '';
    }
    let returnLine = '';
    if (returnExpr && returnExpr.trim()) {
        returnLine = indent(`return ${returnExpr.trim()}\n`);
    }

    // assemble function definition
    let code = `def ${name}(${paramsCode}):\n`;
    code += branch;
    if (returnLine) code += returnLine;

    // two newlines to separate functions (match typical generator style)
    return `\n${code}\n`;
};


Python.forBlock['control_function_decorator'] = function (block) {
    const decorator = Python.valueToCode(block, 'DECORATOR', Python.ORDER_NONE) || 'None';
    return `@${decorator}\n`;
};

Python.forBlock['control_function_docstring'] = function (block) {
    const docstring = block.getFieldValue('DOCSTRING');
    return `"""${docstring}"""\n`;
};

Python.forBlock['control_list_comp'] = function (block) {
    const expr = Python.valueToCode(block, 'EXPR', Python.ORDER_NONE) || 'None';
    const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const iter = Python.valueToCode(block, 'ITER', Python.ORDER_NONE) || '[]';
    const cond = Python.valueToCode(block, 'COND', Python.ORDER_NONE) || null;
    let code = `[${expr} for ${varName} in ${iter}`;
    if (cond) {
        code += ` if ${cond}`;
    }
    code += ']';
    return [code, Python.ORDER_ATOMIC];
};

Python.forBlock['control_dict_comp'] = function (block) {
    const keyExpr = Python.valueToCode(block, 'KEY_EXPR', Python.ORDER_NONE) || 'None';
    const valueExpr = Python.valueToCode(block, 'VALUE_EXPR', Python.ORDER_NONE) || 'None';
    const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const iter = Python.valueToCode(block, 'ITER', Python.ORDER_NONE) || '[]';
    const cond = Python.valueToCode(block, 'COND', Python.ORDER_NONE) || null;
    let code = `{${keyExpr}: ${valueExpr} for ${varName} in ${iter}`;
    if (cond) {
        code += ` if ${cond}`;
    }
    code += '}';
    return [code, Python.ORDER_ATOMIC];
};

Python.forBlock['control_set_comp'] = function (block) {
    const expr = Python.valueToCode(block, 'EXPR', Python.ORDER_NONE) || 'None';
    const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const iter = Python.valueToCode(block, 'ITER', Python.ORDER_NONE) || '[]';
    const cond = Python.valueToCode(block, 'COND', Python.ORDER_NONE) || null;
    let code = `{${expr} for ${varName} in ${iter}`;
    if (cond) {
        code += ` if ${cond}`;
    }
    code += '}';
    return [code, Python.ORDER_ATOMIC];
};

Python.forBlock['control_gen_expr'] = function (block) {
    const expr = Python.valueToCode(block, 'EXPR', Python.ORDER_NONE) || 'None';
    const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const iter = Python.valueToCode(block, 'ITER', Python.ORDER_NONE) || '[]';
    const cond = Python.valueToCode(block, 'COND', Python.ORDER_NONE) || null;
    let code = `(${expr} for ${varName} in ${iter}`;
    if (cond) {
        code += ` if ${cond}`;
    }
    code += ')';
    return [code, Python.ORDER_ATOMIC];
};

Python.forBlock['control_accumulate'] = function (block) {
    Python.addImport('from itertools import accumulate');
    const iterable = Python.valueToCode(block, 'ITERABLE', Python.ORDER_NONE) || '[]';
    const func = Python.valueToCode(block, 'FUNC', Python.ORDER_NONE) || 'None';
    return [`list(accumulate(${iterable}, func=${func}))`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['control_try_except'] = function (block) {
    const tryBlock = Python.statementToCode(block, 'TRY') || 'pass';
    let code = `try:\n${pythonGenerator.prefixLines(tryBlock, pythonGenerator.INDENT)}\n`;
    const exceptCount = block.exceptCount_ || 0;
    for (let i = 0; i < exceptCount; i++) {
        const exception = block.getFieldValue('EXCEPTION' + i) || 'Exception';
        const varField = block.getField('VAR' + i);
        const varName = varField ? pythonGenerator.getVariableName(varField.getValue()) : 'e';
        const catchBlock = Python.statementToCode(block, 'EXCEPT' + i) || 'pass';
        code += `except ${exception} as ${varName}:\n${pythonGenerator.prefixLines(catchBlock, pythonGenerator.INDENT)}\n`;
    }
    return code;
};

Python.forBlock['control_try_except_finally'] = function (block) {
    const tryBlock = Python.statementToCode(block, 'TRY') || 'pass';
    const exception = Python.valueToCode(block, 'EXCEPTION', Python.ORDER_NONE) || 'Exception';
    const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const catchBlock = Python.statementToCode(block, 'CATCH') || 'pass';
    const finallyBlock = Python.statementToCode(block, 'FINALLY') || 'pass';
    return `try:\n${pythonGenerator.prefixLines(tryBlock, pythonGenerator.INDENT)}\nexcept ${exception} as ${varName}:\n${pythonGenerator.prefixLines(catchBlock, pythonGenerator.INDENT)}\nfinally:\n${pythonGenerator.prefixLines(finallyBlock, pythonGenerator.INDENT)}\n`;
};

Python.forBlock['control_try_except_else_finally'] = function (block) {
    const tryBlock = Python.statementToCode(block, 'TRY') || 'pass';
    const exception = Python.valueToCode(block, 'EXCEPTION', Python.ORDER_NONE) || 'Exception';
    const varName = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const catchBlock = Python.statementToCode(block, 'CATCH') || 'pass';
    const elseBlock = Python.statementToCode(block, 'ELSE') || '';
    const finallyBlock = Python.statementToCode(block, 'FINALLY') || '';
    let code = `try:\n${pythonGenerator.prefixLines(tryBlock, pythonGenerator.INDENT)}\n`;
    code += `except ${exception} as ${varName}:\n${pythonGenerator.prefixLines(catchBlock, pythonGenerator.INDENT)}\n`;
    if (elseBlock) {
        code += `else:\n${pythonGenerator.prefixLines(elseBlock, pythonGenerator.INDENT)}\n`;
    }
    if (finallyBlock) {
        code += `finally:\n${pythonGenerator.prefixLines(finallyBlock, pythonGenerator.INDENT)}\n`;
    }
    return code;
};

Python.forBlock['control_raise_exception'] = function (block) {
    const exception = Python.valueToCode(block, 'EXCEPTION', Python.ORDER_NONE) || 'Exception';
    const message = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || '';
    return `raise ${exception}(${message})\n`;
};

Python.forBlock['control_assert_block'] = function (block) {
    const condition = Python.valueToCode(block, 'CONDITION', Python.ORDER_NONE) || 'False';
    const message = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || '';
    return `assert ${condition}, ${message}\n`;
};

Python.forBlock['control_flow_break_continue'] = function (block) {
    const flow = block.getFieldValue('FLOW') || 'BREAK';
    return (flow === 'BREAK' ? 'break' : 'continue') + '\n';
};

// Additional Control blocks moved from python.js

Python.forBlock['loops_for_each_safe'] = function (block) {
    Python.addImport('from itertools import islice');
    const variable = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const list = Python.valueToCode(block, 'LIST', Python.ORDER_MEMBER) || '[]';
    const limit = Python.valueToCode(block, 'LIMIT', Python.ORDER_NONE) || '1000';
    const branch = Python.statementToCode(block, 'DO') || Python.PASS;
    return `for ${variable} in islice(${list}, ${limit}):\n${branch}`;
};

Python.forBlock['loops_while_safe'] = function (block) {
    const limit = Python.valueToCode(block, 'LIMIT', Python.ORDER_NONE) || '1000';
    const condition = Python.valueToCode(block, 'BOOL', Python.ORDER_NONE) || 'False';
    const branch = Python.statementToCode(block, 'DO') || Python.PASS;

    let code = `_loop_count = 0\n`;
    code += `while ${condition}:\n`;
    code += Python.prefixLines(`if _loop_count >= ${limit}:\n`, Python.INDENT);
    code += Python.prefixLines(`  raise Exception(f"Loop exceeded max iterations of {${limit}}")\n`, Python.INDENT);
    code += Python.prefixLines(`_loop_count += 1\n`, Python.INDENT);
    code += branch;
    return code;
};

Python.forBlock['loops_enumerate'] = function (block) {
    const index_var = pythonGenerator.getVariableName(block.getFieldValue('INDEX_VAR'));
    const item_var = pythonGenerator.getVariableName(block.getFieldValue('ITEM_VAR'));
    const list = Python.valueToCode(block, 'LIST', Python.ORDER_MEMBER) || '[]';
    const branch = Python.statementToCode(block, 'DO') || Python.PASS;
    return `for ${index_var}, ${item_var} in enumerate(${list}):\n${branch}`;
};

Python.forBlock['loops_zip'] = function (block) {
    const vars = block.getFieldValue('VARS');
    const lists = Python.valueToCode(block, 'LISTS', Python.ORDER_MEMBER) || '[]';
    const branch = Python.statementToCode(block, 'DO') || Python.PASS;
    return `for ${vars} in zip(*${lists}):\n${branch}`;
};

Python.forBlock['functions_call_with_kwargs'] = function (block) {
    const func = Python.valueToCode(block, 'FUNC', Python.ORDER_FUNCTION_CALL) || 'my_function';
    const args = Python.valueToCode(block, 'ARGS', Python.ORDER_NONE) || '[]';
    const kwargs = Python.valueToCode(block, 'KWARGS', Python.ORDER_NONE) || '{}';
    const code = `${func}(*${args}, **${kwargs})`;
    return [code, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['functions_callable'] = function (block) {
    const item = Python.valueToCode(block, 'ITEM', Python.ORDER_NONE) || 'None';
    const code = `callable(${item})`;
    return [code, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['iterators_yield'] = function (block) {
    const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || 'None';
    return `yield ${value}\n`;
};

Python.forBlock['iterators_yield_from'] = function (block) {
    const iterable = Python.valueToCode(block, 'ITERABLE', Python.ORDER_NONE) || '[]';
    return `yield from ${iterable}\n`;
};

Python.forBlock['iterators_generator_function'] = function (block) {
    const name = block.getFieldValue('NAME');
    const params = block.getFieldValue('PARAMS');
    const branch = Python.statementToCode(block, 'DO') || Python.PASS;
    const code = `def ${name}(${params}):\n${branch}`;
    return `\n${code}\n`;
};

Python.forBlock['iterators_safe_next'] = function (block) {
    const iterator = Python.valueToCode(block, 'ITERATOR', Python.ORDER_NONE) || 'iter([])';
    const defaultValue = Python.valueToCode(block, 'DEFAULT', Python.ORDER_NONE) || 'None';
    return [`next(${iterator}, ${defaultValue})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['iterators_generator_expression'] = function (block) {
    const output = Python.valueToCode(block, 'OUTPUT', Python.ORDER_NONE) || 'None';
    const variable = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const list = Python.valueToCode(block, 'LIST', Python.ORDER_MEMBER) || '[]';
    const condition = Python.valueToCode(block, 'IF', Python.ORDER_NONE) || '';

    let code = `(${output} for ${variable} in ${list}`;
    if (condition) {
        code += ` if ${condition}`;
    }
    code += ')';
    return [code, Python.ORDER_ATOMIC];
};
