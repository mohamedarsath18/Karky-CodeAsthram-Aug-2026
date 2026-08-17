import { javaGenerator } from '../java.js';
import { Order } from 'blockly/javascript';

// Dedicated Java try/catch block
javaGenerator.forBlock['java_try_catch'] = function (block, generator) {
    const tryBody = generator.statementToCode(block, 'TRY');
    const exType = block.getFieldValue('EX_TYPE') || 'Exception';
    const varName = block.getFieldValue('VAR') || 'e';
    const catchBody = generator.statementToCode(block, 'CATCH');
    return `try {\n${tryBody}} catch (${exType} ${varName}) {\n${catchBody}}\n`;
};

// Dedicated Java throw block
javaGenerator.forBlock['java_throw'] = function (block, generator) {
    const exType = block.getFieldValue('EX_TYPE') || 'Exception';
    const msg = generator.valueToCode(block, 'MSG', Order.NONE) || '""';
    return `throw new ${exType}(${msg});\n`;
};

// Blockly's built-in tuple/list creation blocks
javaGenerator.forBlock['lists_create_with'] = function (block, generator) {
    generator.addImport('java.util.ArrayList');
    generator.addImport('java.util.Arrays');

    const elements = [];
    const count = block.itemCount_ !== undefined ? block.itemCount_ : (block.inputList ? block.inputList.length : 0);
    for (let i = 0; i < count; i++) {
        let element = '';
        if (block.getInput('ADD' + i)) {
            element = generator.valueToCode(block, 'ADD' + i, Order.NONE);
        } else if (block.getInput('ITEM' + i)) {
            element = generator.valueToCode(block, 'ITEM' + i, Order.NONE);
        }
        if (element !== null && element !== '') {
            elements.push(element);
        }
    }

    if (elements.length === 0) {
        return ['new ArrayList<>()', Order.FUNCTION_CALL];
    }

    const code = `new ArrayList<>(Arrays.asList(${elements.join(', ')}))`;
    return [code, Order.FUNCTION_CALL];
};

// Create tuple (Java uses arrays for tuples)
javaGenerator.forBlock['tuples_create_with'] = function (block, generator) {
    const elements = [];
    for (let i = 0; i < (block.itemCount_ || 0); i++) {
        let element = 'null';
        if (block.getInput('ADD' + i)) {
            element = generator.valueToCode(block, 'ADD' + i, Order.NONE);
        } else if (block.getInput('ITEM' + i)) {
            element = generator.valueToCode(block, 'ITEM' + i, Order.NONE);
        }
        elements.push(element || 'null');
    }

    const code = `new Object[]{${elements.join(', ')}}`;
    return [code, Order.ATOMIC];
};

// Text join/create
javaGenerator.forBlock['text_join'] = function (block, generator) {
    const elements = [];
    for (let i = 0; i < (block.itemCount_ || 0); i++) {
        let element = '""';
        if (block.getInput('ADD' + i)) {
            element = generator.valueToCode(block, 'ADD' + i, Order.NONE);
        } else if (block.getInput('ITEM' + i)) {
            element = generator.valueToCode(block, 'ITEM' + i, Order.NONE);
        }
        elements.push(element || '""');
    }

    if (elements.length === 0) {
        return ['""', Order.ATOMIC];
    }

    const code = elements.join(' + ');
    return [code, Order.ADDITION];
};

// Text create (same as join)
javaGenerator.forBlock['text_create_join_container'] = javaGenerator.forBlock['text_join'];
javaGenerator.forBlock['text_create_join_item'] = function (block, generator) {
    return null; // This is a helper block
};

// Dictionary creation block
javaGenerator.forBlock['dicts_create_with'] = function (block, generator) {
    generator.addImport('java.util.HashMap');

    const entries = [];
    const count = block.itemCount_ !== undefined ? block.itemCount_ : 0;
    for (let i = 0; i < count; i++) {
        const keyInput = block.getInput('KEY' + i) ? 'KEY' + i : (block.getInput('KEY_' + i) ? 'KEY_' + i : null);
        const valInput = block.getInput('VALUE' + i) ? 'VALUE' + i : (block.getInput('VALUE_' + i) ? 'VALUE_' + i : null);

        const key = keyInput ? generator.valueToCode(block, keyInput, Order.NONE) : '';
        const value = valInput ? generator.valueToCode(block, valInput, Order.NONE) : '';

        if (key && value) {
            entries.push(`${key}, ${value}`);
        }
    }

    if (entries.length === 0) {
        return ['new HashMap<>()', Order.FUNCTION_CALL];
    }

    generator.addImport('java.util.Map');
    const code = `new HashMap<>(Map.of(${entries.join(', ')}))`;
    return [code, Order.FUNCTION_CALL];
};

// List comprehension (convert to Stream)
javaGenerator.forBlock['control_list_comp'] = function (block, generator) {
    const variable = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') || 'item';
    const list = generator.valueToCode(block, 'ITER', Order.NONE) || 'new ArrayList<>()';
    const expression = generator.valueToCode(block, 'EXPR', Order.NONE) || variable;
    const condition = generator.valueToCode(block, 'COND', Order.NONE);

    generator.addImport('java.util.stream.Collectors');

    let code;
    if (condition) {
        code = `${list}.stream().filter(${variable} -> ${condition}).map(${variable} -> ${expression}).collect(Collectors.toList())`;
    } else {
        code = `${list}.stream().map(${variable} -> ${expression}).collect(Collectors.toList())`;
    }

    return [code, Order.FUNCTION_CALL];
};

// Dict comprehension
javaGenerator.forBlock['control_dict_comp'] = function (block, generator) {
    const variable = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') || 'item';
    const list = generator.valueToCode(block, 'ITER', Order.NONE) || 'new ArrayList<>()';
    const keyExpr = generator.valueToCode(block, 'KEY_EXPR', Order.NONE) || variable;
    const valueExpr = generator.valueToCode(block, 'VALUE_EXPR', Order.NONE) || variable;
    const condition = generator.valueToCode(block, 'COND', Order.NONE);

    generator.addImport('java.util.stream.Collectors');

    let code;
    if (condition) {
        code = `${list}.stream().filter(${variable} -> ${condition}).collect(Collectors.toMap(${variable} -> ${keyExpr}, ${variable} -> ${valueExpr}))`;
    } else {
        code = `${list}.stream().collect(Collectors.toMap(${variable} -> ${keyExpr}, ${variable} -> ${valueExpr}))`;
    }

    return [code, Order.FUNCTION_CALL];
};

// Null/None value
javaGenerator.forBlock['logic_null'] = function (block, generator) {
    return ['null', Order.ATOMIC];
};

javaGenerator.forBlock['essentials_none'] = function (block, generator) {
    return ['null', Order.ATOMIC];
};

export { javaGenerator };
