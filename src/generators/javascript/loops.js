import { javascriptGenerator } from 'blockly/javascript';

// Sub-phase 4.2 & 4.3: JavaScript Loops & Flow Control Generators

javascriptGenerator.forBlock['js_for_loop'] = function(block, generator) {
  const varName = block.getFieldValue('VAR') || 'i';
  const from = generator.valueToCode(block, 'FROM', generator.ORDER_ASSIGNMENT) || '0';
  const to = generator.valueToCode(block, 'TO', generator.ORDER_RELATIONAL) || '10';
  const step = generator.valueToCode(block, 'STEP', generator.ORDER_ASSIGNMENT) || '1';
  const branch = generator.statementToCode(block, 'DO');
  return `for (let ${varName} = ${from}; ${varName} < ${to}; ${varName} += ${step}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['js_for_of'] = function(block, generator) {
  const item = block.getFieldValue('ITEM') || 'item';
  const list = generator.valueToCode(block, 'LIST', generator.ORDER_NONE) || '[]';
  const branch = generator.statementToCode(block, 'DO');
  return `for (const ${item} of ${list}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['js_for_in'] = function(block, generator) {
  const key = block.getFieldValue('KEY') || 'key';
  const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_NONE) || '{}';
  const branch = generator.statementToCode(block, 'DO');
  return `for (const ${key} in ${obj}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['js_while'] = function(block, generator) {
  const cond = generator.valueToCode(block, 'COND', generator.ORDER_NONE) ||
               generator.valueToCode(block, 'BOOL', generator.ORDER_NONE) ||
               'false';
  const branch = generator.statementToCode(block, 'DO');
  return `while (${cond}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['js_break_continue'] = function(block) {
  const action = (block.getFieldValue('ACTION') || 'break').toLowerCase();
  return `${action};\n`;
};

javascriptGenerator.forBlock['controls_for'] = function(block, generator) {
  const variable0 = generator.nameDB_ ? generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') : (block.getFieldValue('VAR') || 'i');
  const argument0 = generator.valueToCode(block, 'FROM', generator.ORDER_ASSIGNMENT) || '0';
  const argument1 = generator.valueToCode(block, 'TO', generator.ORDER_ASSIGNMENT) || '0';
  const increment = generator.valueToCode(block, 'BY', generator.ORDER_ASSIGNMENT) || '1';
  const branch = generator.statementToCode(block, 'DO');

  return `for (let ${variable0} = ${argument0}; ${variable0} <= ${argument1}; ${variable0} += ${increment}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['controls_forEach'] = function(block, generator) {
  const variable0 = generator.nameDB_ ? generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') : (block.getFieldValue('VAR') || 'item');
  const argument0 = generator.valueToCode(block, 'LIST', generator.ORDER_ASSIGNMENT) || '[]';
  const branch = generator.statementToCode(block, 'DO');
  return `for (const ${variable0} of ${argument0}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 = generator.valueToCode(block, 'BOOL', generator.ORDER_NONE) ||
                   generator.valueToCode(block, 'COND', generator.ORDER_NONE) ||
                   'false';
  const branch = generator.statementToCode(block, 'DO');
  if (until) {
    argument0 = '!' + argument0;
  }
  return `while (${argument0}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['controls_flow_statements'] = function(block) {
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  return 'break;\n';
};

javascriptGenerator.forBlock['control_flow_break_continue'] = function(block) {
  const flow = block.getFieldValue('FLOW') || 'BREAK';
  return `${flow.toLowerCase()};\n`;
};

javascriptGenerator.forBlock['control_while_true_inline'] = function(block, generator) {
  const mode = block.getFieldValue('COND_MODE');
  const condCode = generator.valueToCode(block, 'COND', generator.ORDER_NONE);
  const cond = condCode || (mode === 'EXPR' ? 'false' : 'true');
  const branch = generator.statementToCode(block, 'DO');
  return `while (${cond}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['control_for_indexed'] = function (block, generator) {
    const indexVar = generator.nameDB_ ? generator.nameDB_.getName(block.getFieldValue('INDEX_VAR'), 'VARIABLE') : (block.getFieldValue('INDEX_VAR') || 'i');
    const valueVar = generator.nameDB_ ? generator.nameDB_.getName(block.getFieldValue('VALUE_VAR'), 'VARIABLE') : (block.getFieldValue('VALUE_VAR') || 'item');
    const list = generator.valueToCode(block, 'LIST', generator.ORDER_NONE) || '[]';
    const branch = generator.statementToCode(block, 'DO');
    return `for (let ${indexVar} = 0; ${indexVar} < ${list}.length; ${indexVar}++) {\n  let ${valueVar} = ${list}[${indexVar}];\n${branch}}\n`;
};

javascriptGenerator.forBlock['control_for_zip'] = function (block, generator) {
    const branch = generator.statementToCode(block, 'DO');
    const lists = [];
    for (let i = 0; i < (block.itemCount_ || 0); i++) {
        lists.push(generator.valueToCode(block, 'ADD' + i, generator.ORDER_NONE) || '[]');
    }
    if (lists.length === 0) return '';
    const lenStrs = lists.map(l => `${l}.length`);
    const lenExpr = lenStrs.length > 1 ? `Math.min(${lenStrs.join(', ')})` : lenStrs[0];
    return `for (let i = 0; i < ${lenExpr}; i++) {\n${branch}}\n`;
};
