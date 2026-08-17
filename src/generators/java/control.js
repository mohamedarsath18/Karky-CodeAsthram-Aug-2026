import { javaGenerator } from '../java.js';
import { Order } from 'blockly/javascript';

function getStatement(generator, block, ...names) {
    for (const name of names) {
        if (block.getInput(name)) {
            return generator.statementToCode(block, name) || '';
        }
    }
    return '';
}

function getValue(generator, block, order, ...names) {
    for (const name of names) {
        if (block.getInput(name)) {
            return generator.valueToCode(block, name, order) || '';
        }
    }
    return '';
}

// Dedicated Java if/else block
javaGenerator.forBlock['java_if_else'] = function (block, generator) {
    const condition = getValue(generator, block, Order.NONE, 'IF0', 'CONDITION', 'COND', 'IF') || 'false';
    const branch = getStatement(generator, block, 'DO0', 'DO', 'STACK', 'BODY');
    return `if (${condition}) {\n${branch}}\n`;
};

// Dedicated Java do-while loop: do { ... } while (condition);
javaGenerator.forBlock['java_do_while'] = function (block, generator) {
    const branch = getStatement(generator, block, 'DO', 'STACK', 'BODY');
    const condition = getValue(generator, block, Order.NONE, 'CONDITION', 'BOOL', 'COND', 'IF') || 'false';
    return `do {\n${branch}} while (${condition});\n`;
};

// Dedicated Java break / continue
javaGenerator.forBlock['java_break_continue'] = function (block, generator) {
    const action = block.getFieldValue('ACTION') === 'CONTINUE' ? 'continue;' : 'break;';
    return `${action}\n`;
};

// Additional loop control blocks
javaGenerator.forBlock['control_for_indexed'] = function (block, generator) {
    const varName = block.getFieldValue('VAR') || 'i';
    const list = getValue(generator, block, Order.NONE, 'LIST', 'ITER', 'VALUE') || 'new Object[]{}';
    const branch = getStatement(generator, block, 'DO', 'STACK', 'BODY');
    return `for (int ${varName} = 0; ${varName} < ${list}.length; ${varName}++) {\n${branch}}\n`;
};

javaGenerator.forBlock['control_for_zip'] = function (block, generator) {
    const branch = getStatement(generator, block, 'DO', 'STACK', 'BODY');
    const lists = [];
    for (let i = 0; i < (block.itemCount_ || 0); i++) {
        lists.push(generator.valueToCode(block, 'ADD' + i, Order.NONE) || 'new Object[]{}');
    }
    if (lists.length === 0) return '';
    const lenStrs = lists.map(l => `${l}.length`);
    const lenExpr = lenStrs.reduce((acc, curr) => `Math.min(${acc}, ${curr})`);
    return `// Zip iteration\nfor (int i = 0; i < ${lenExpr}; i++) {\n${branch}}\n`;
};

javaGenerator.forBlock['control_try_except'] = function (block, generator) {
    const tryBlock = getStatement(generator, block, 'TRY', 'DO', 'STACK', 'BODY');
    const catchBlock = getStatement(generator, block, 'EXCEPT', 'CATCH', 'HANDLER');
    return `try {\n${tryBlock}} catch (Exception e) {\n${catchBlock}}\n`;
};

javaGenerator.forBlock['control_try_except_finally'] = function (block, generator) {
    const tryBlock = getStatement(generator, block, 'TRY', 'DO', 'STACK', 'BODY');
    const catchBlock = getStatement(generator, block, 'EXCEPT', 'CATCH', 'HANDLER');
    const finallyBlock = getStatement(generator, block, 'FINALLY');
    return `try {\n${tryBlock}} catch (Exception e) {\n${catchBlock}} finally {\n${finallyBlock}}\n`;
};

javaGenerator.forBlock['control_raise_exception'] = function (block, generator) {
    const msg = getValue(generator, block, Order.NONE, 'EXC', 'MSG', 'VALUE') || '"Error"';
    return `throw new RuntimeException(${msg});\n`;
};

// If/Else block (generic if_block)
javaGenerator.forBlock['if_block'] = function (block, generator) {
    let code = '';
    let n = 0;

    let conditionCode = getValue(generator, block, Order.NONE, 'IF' + n, 'CONDITION', 'COND') || 'false';
    let branchCode = getStatement(generator, block, 'DO' + n, 'DO', 'STACK');
    code += `if (${conditionCode}) {\n${branchCode}}`;

    for (n = 1; n <= (block.elseifCount_ || 0); n++) {
        conditionCode = getValue(generator, block, Order.NONE, 'IF' + n, 'CONDITION', 'COND') || 'false';
        branchCode = getStatement(generator, block, 'DO' + n, 'DO', 'STACK');
        code += ` else if (${conditionCode}) {\n${branchCode}}`;
    }

    if (block.elseCount_) {
        branchCode = getStatement(generator, block, 'ELSE', 'DO_ELSE');
        code += ` else {\n${branchCode}}`;
    }

    return code + '\n';
};

// Match/Switch statement
javaGenerator.forBlock['control_match'] = function (block, generator) {
    const value = getValue(generator, block, Order.NONE, 'VALUE', 'EXPR', 'VAR') || '0';
    let code = `switch (${value}) {\n`;

    for (let i = 0; i < (block.caseCount_ || 0); i++) {
        const caseValue = getValue(generator, block, Order.NONE, 'CASE' + i, 'VAL' + i) || '0';
        const caseCode = getStatement(generator, block, 'DO' + i, 'STACK' + i);
        code += `    case ${caseValue}:\n${generator.prefixLines(caseCode, '        ')}        break;\n`;
    }

    if (block.defaultCount_) {
        const defaultCode = getStatement(generator, block, 'DEFAULT', 'ELSE');
        code += `    default:\n${generator.prefixLines(defaultCode, '        ')}        break;\n`;
    }

    code += '}\n';
    return code;
};

// Conditional expression (control_condition_expr)
javaGenerator.forBlock['control_condition_expr'] = function (block, generator) {
    const OPERATORS = {
        'EQ': ' == ',
        'NEQ': ' != ',
        'LT': ' < ',
        'LTE': ' <= ',
        'GT': ' > ',
        'GTE': ' >= ',
        'IS': ' == ',
        'IS_NOT': ' != '
    };
    const opKey = block.getFieldValue('OP');
    const a = getValue(generator, block, Order.RELATIONAL, 'A', 'LEFT', 'VALUE') || '0';
    const b = getValue(generator, block, Order.RELATIONAL, 'B', 'RIGHT') || '0';

    if (opKey === 'IN') {
        return [`${b}.contains(${a})`, Order.MEMBER];
    } else if (opKey === 'NOT_IN') {
        return [`!${b}.contains(${a})`, Order.LOGICAL_NOT];
    }

    const op = OPERATORS[opKey] || ' == ';
    return [`${a}${op}${b}`, Order.RELATIONAL];
};

// Logical combine (control_logical_combine)
javaGenerator.forBlock['control_logical_combine'] = function (block, generator) {
    const opKey = block.getFieldValue('LOGICAL_OP') || block.getFieldValue('OP');
    const left = getValue(generator, block, Order.LOGICAL_AND, 'LEFT', 'ITEM0', 'A', 'VALUE') || 'false';
    if (opKey === 'NOT') {
        return [`!(${left})`, Order.LOGICAL_NOT];
    }
    const right = getValue(generator, block, Order.LOGICAL_AND, 'RIGHT', 'ITEM1', 'B') || 'false';
    const op = opKey === 'OR' ? ' || ' : ' && ';
    return [`(${left}${op}${right})`, Order.LOGICAL_AND];
};

// If main (public static void main)
javaGenerator.forBlock['control_if_main'] = function (block, generator) {
    const branch = getStatement(generator, block, 'DO', 'STACK', 'BODY');
    return branch;
};

// Pass/No-op
javaGenerator.forBlock['control_pass_simple'] = function (block, generator) {
    return '// No operation\n';
};

// If truthy check (control_if_truthy)
javaGenerator.forBlock['control_if_truthy'] = function (block, generator) {
    const value = getValue(generator, block, Order.NONE, 'EXPR', 'VALUE', 'VAL') || 'false';
    const branch = getStatement(generator, block, 'DO', 'STACK', 'BODY');
    return `if (${value}) {\n${branch}}\n`;
};

export { javaGenerator };
