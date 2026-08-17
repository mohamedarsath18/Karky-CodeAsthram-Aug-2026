import { javaGenerator } from '../java.js';
import { Order } from 'blockly/javascript';

// Dedicated Java variable declaration (int x = 10;)
javaGenerator.forBlock['java_var_declare'] = function (block, generator) {
    const type = block.getFieldValue('TYPE') || 'int';
    const varName = block.getFieldValue('VAR') || 'x';
    const value = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || (type === 'boolean' ? 'false' : type === 'String' ? '""' : '0');
    return `${type} ${varName} = ${value};\n`;
};

// Dedicated Java variable assignment (x = 20;)
javaGenerator.forBlock['java_var_assign'] = function (block, generator) {
    const varName = block.getFieldValue('VAR') || 'x';
    const value = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
    return `${varName} = ${value};\n`;
};

// Java primitive type selector
javaGenerator.forBlock['java_primitive_type'] = function (block, generator) {
    const type = block.getFieldValue('TYPE') || 'int';
    return [type, Order.ATOMIC];
};

// Java type cast: (int) value
javaGenerator.forBlock['java_type_cast'] = function (block, generator) {
    const type = block.getFieldValue('TYPE') || 'int';
    const valInput = block.getInput('VALUE') ? 'VALUE' : (block.getInput('NUM') ? 'NUM' : null);
    const value = valInput ? (generator.valueToCode(block, valInput, Order.UNARY_NEGATION || Order.NONE) || '0') : '0';
    return [`(${type}) ${value}`, Order.UNARY_NEGATION || Order.NONE];
};

// Java constant declaration: final double PI = 3.14;
javaGenerator.forBlock['java_constant'] = function (block, generator) {
    const type = block.getFieldValue('TYPE') || 'double';
    const varName = block.getFieldValue('VAR') || 'MAX_VAL';
    const valInput = block.getInput('VALUE') ? 'VALUE' : (block.getInput('VAL') ? 'VAL' : null);
    const value = valInput ? (generator.valueToCode(block, valInput, Order.ASSIGNMENT) || '0') : '0';
    return `final ${type} ${varName} = ${value};\n`;
};

// Variable assignment (generic)
javaGenerator.forBlock['essentials_var_set'] = function (block, generator) {
    const varId = block.getFieldValue('VAR');
    const varName = generator.getVariableName ? generator.getVariableName(varId) : (block.getField('VAR') ? block.getField('VAR').getText() : (varId || 'x'));
    const valInput = block.getInput('VALUE') ? 'VALUE' : (block.getInput('VAL') ? 'VAL' : null);
    const value = valInput ? (generator.valueToCode(block, valInput, Order.ASSIGNMENT) || 'null') : 'null';
    return `${varName} = ${value};\n`;
};

// Variable get
javaGenerator.forBlock['essentials_var_get'] = function (block, generator) {
    const varId = block.getFieldValue('VAR');
    const varName = generator.getVariableName ? generator.getVariableName(varId) : (block.getField('VAR') ? block.getField('VAR').getText() : (varId || 'x'));
    return [varName, Order.ATOMIC];
};

// Import statement
javaGenerator.forBlock['essentials_import_simple'] = function (block, generator) {
    const packageName = block.getFieldValue('PACKAGE') || '';
    if (packageName && generator.addImport) {
        generator.addImport(packageName);
    }
    return '';
};

// Scope keyword (not really applicable in Java, skip)
javaGenerator.forBlock['essentials_scope_keyword'] = function (block, generator) {
    return '';
};

// Variable undefined/null
javaGenerator.forBlock['essentials_var_undefined'] = function (block, generator) {
    return ['null', Order.ATOMIC];
};

// Type checking (instanceof)
javaGenerator.forBlock['essentials_is_instance'] = function (block, generator) {
    const valInput = block.getInput('VALUE') ? 'VALUE' : (block.getInput('VAL') ? 'VAL' : (block.getInput('OBJ') ? 'OBJ' : null));
    const value = valInput ? (generator.valueToCode(block, valInput, Order.RELATIONAL) || 'null') : 'null';
    const type = block.getFieldValue('TYPE') || 'Object';
    return [`${value} instanceof ${type}`, Order.RELATIONAL];
};

// Type of (getClass)
javaGenerator.forBlock['essentials_type_of'] = function (block, generator) {
    const valInput = block.getInput('VALUE') ? 'VALUE' : (block.getInput('VAL') ? 'VAL' : (block.getInput('OBJ') ? 'OBJ' : null));
    const value = valInput ? (generator.valueToCode(block, valInput, Order.MEMBER) || 'null') : 'null';
    return [`${value}.getClass().getSimpleName()`, Order.MEMBER];
};

// Type casting
javaGenerator.forBlock['essentials_cast'] = function (block, generator) {
    const valInput = block.getInput('VALUE') ? 'VALUE' : (block.getInput('VAL') ? 'VAL' : (block.getInput('NUM') ? 'NUM' : null));
    const value = valInput ? (generator.valueToCode(block, valInput, Order.UNARY_NEGATION || Order.NONE) || 'null') : 'null';
    const type = block.getFieldValue('TYPE') || 'Object';
    return [`(${type}) ${value}`, Order.UNARY_NEGATION || Order.NONE];
};

// Default if none (null coalescing)
javaGenerator.forBlock['essentials_default_if_none'] = function (block, generator) {
    const value = generator.valueToCode(block, 'VALUE', Order.CONDITIONAL) || 'null';
    const defaultValue = generator.valueToCode(block, 'DEFAULT', Order.CONDITIONAL) || '""';
    return [`(${value} != null) ? ${value} : ${defaultValue}`, Order.CONDITIONAL];
};

// Built-in variable blocks (Blockly's native)
javaGenerator.forBlock['variables_get'] = function (block, generator) {
    const varId = block.getFieldValue('VAR');
    const varName = generator.getVariableName ? generator.getVariableName(varId) : (block.getField('VAR') ? block.getField('VAR').getText() : varId);
    return [varName, Order.ATOMIC];
};

javaGenerator.forBlock['variables_set'] = function (block, generator) {
    const varId = block.getFieldValue('VAR');
    const varName = generator.getVariableName ? generator.getVariableName(varId) : (block.getField('VAR') ? block.getField('VAR').getText() : varId);
    const value = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || 'null';
    return `${varName} = ${value};\n`;
};

export { javaGenerator };
