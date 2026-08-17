import { javascriptGenerator } from 'blockly/javascript';

// Sub-phase 3.1: JavaScript Core Variables & Data Types Generators

javascriptGenerator.forBlock['js_var_let'] = function(block, generator) {
  const varName = block.getFieldValue('VAR') || 'x';
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
  return `let ${varName} = ${val};\n`;
};

javascriptGenerator.forBlock['js_var_const'] = function(block, generator) {
  const varName = block.getFieldValue('VAR') || 'PI';
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
  return `const ${varName} = ${val};\n`;
};

javascriptGenerator.forBlock['js_var_assign'] = function(block, generator) {
  const varName = block.getFieldValue('VAR') || 'x';
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
  return `${varName} = ${val};\n`;
};

javascriptGenerator.forBlock['js_typeof'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_UNARY_PREFIX) || 'null';
  return [`typeof ${val}`, generator.ORDER_UNARY_PREFIX];
};

javascriptGenerator.forBlock['js_type_convert'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
  const type = block.getFieldValue('TYPE') || 'Number';
  return [`${type}(${val})`, generator.ORDER_FUNCTION_CALL];
};

// Standard & Essentials Variable Generators for JavaScript
javascriptGenerator.forBlock['variables_get'] = function(block, generator) {
  const varName = generator.nameDB_ ? generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') : (block.getFieldValue('VAR') || 'x');
  return [varName, generator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['variables_set'] = function(block, generator) {
  const varName = generator.nameDB_ ? generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') : (block.getFieldValue('VAR') || 'x');
  const argument0 = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
  return `${varName} = ${argument0};\n`;
};

javascriptGenerator.forBlock['essentials_var_get'] = function(block, generator) {
  const varName = block.getFieldValue('VAR') || block.getFieldValue('NAME') || 'x';
  return [varName, generator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['essentials_var_set'] = function(block, generator) {
  const varName = block.getFieldValue('VAR') || block.getFieldValue('NAME') || 'x';
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
  return `${varName} = ${val};\n`;
};

javascriptGenerator.forBlock['essentials_type_of'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_UNARY_PREFIX) || 'null';
  return [`typeof ${val}`, generator.ORDER_UNARY_PREFIX];
};

javascriptGenerator.forBlock['essentials_cast'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
  const type = block.getFieldValue('TYPE') || 'String';
  if (type === 'int' || type === 'Integer') return [`parseInt(${val}, 10)`, generator.ORDER_FUNCTION_CALL];
  if (type === 'double' || type === 'float' || type === 'Double') return [`parseFloat(${val})`, generator.ORDER_FUNCTION_CALL];
  if (type === 'boolean' || type === 'Boolean') return [`Boolean(${val})`, generator.ORDER_FUNCTION_CALL];
  return [`String(${val})`, generator.ORDER_FUNCTION_CALL];
};

javascriptGenerator.forBlock['essentials_is_instance'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VALUE', generator.ORDER_RELATIONAL) || 'null';
  const type = block.getFieldValue('TYPE') || 'Object';
  return [`${val} instanceof ${type}`, generator.ORDER_RELATIONAL];
};
