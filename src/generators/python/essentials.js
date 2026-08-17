// src/generators/python/essentials.js
import { pythonGenerator as Python } from 'blockly/python';
// Simplified imports
Python.forBlock['essentials_import_simple'] = function (block) {
  const mod = block.getFieldValue('MODULE');
  if (mod) {
    Python.addImport(mod);
  }
  return '';
};

// Scope keywords: global/nonlocal
Python.forBlock['essentials_scope_keyword'] = function (block) {
  const kind = block.getFieldValue('KIND') || 'global';
  const name = block.getFieldValue('NAME') || 'x';
  return `${kind} ${name}\n`;
};

// pass statement
Python.forBlock['control_pass'] = function (block) {
  return 'pass\n';
};
Python.forBlock['control_pass_simple'] = function (block) {
  return 'pass\n';
};

// while True / while <expr>
Python.forBlock['control_while_true'] = function (block) {
  const mode = block.getFieldValue('COND_MODE');
  const cond = mode === 'EXPR' ? (Python.valueToCode(block, 'COND', Python.ORDER_NONE) || 'True') : 'True';
  const body = Python.statementToCode(block, 'DO') || '  pass\n';
  return `while ${cond}:\n${body}`;
};
Python.forBlock['control_while_true_inline'] = function (block) {
  const mode = block.getFieldValue('COND_MODE');
  const cond = mode === 'EXPR' ? (Python.valueToCode(block, 'COND', Python.ORDER_NONE) || 'True') : 'True';
  const body = Python.statementToCode(block, 'DO') || '  pass\n';
  return `while ${cond}:\n${body}`;
};

Python.forBlock['essentials_function_def'] = function (block) {
  const functionName = block.getFieldValue('NAME');

  // Try multiple ways to get parameters from the mutator
  let params = [];
  if (block.params_) {
    params = block.params_;
  } else if (block.getExtraState && block.getExtraState()) {
    const state = block.getExtraState();
    params = state.params || [];
  }

  const branch = Python.statementToCode(block, 'DO');
  const returnValue = Python.valueToCode(block, 'RETURN', Python.ORDER_NONE) || '';

  let code = `def ${functionName}(${params.join(', ')}):\n`;
  code += branch || '  pass\n';
  if (returnValue) {
    code += `  return ${returnValue}\n`;
  }

  return code;
};

// separate return statement
Python.forBlock['control_return'] = function (block) {
  const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE);
  if (value) return `return ${value}\n`;
  return 'return\n';
};

Python.forBlock['tuples_count'] = function (block) {
  const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || 'None';
  const tuple = Python.valueToCode(block, 'TUPLE', Python.ORDER_MEMBER) || '()';
  const code = `${tuple}.count(${value})`;
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['num_base_conversion'] = function (block) {
  const number = Python.valueToCode(block, 'NUMBER', Python.ORDER_NONE) || '0';
  const base = block.getFieldValue('BASE');

  const functionMap = {
    'BIN': 'bin',
    'OCT': 'oct',
    'HEX': 'hex'
  };


  const func = functionMap[base] || 'bin';
  const code = `${func}(${number})`;
  return [code, Python.ORDER_FUNCTION_CALL];
};

// Format number with decimal places
Python.forBlock['essentials_num_format_decimal'] = function (block) {
  const number = Python.valueToCode(block, 'NUMBER', Python.ORDER_NONE) || '0';
  const decimals = block.getFieldValue('DECIMALS') || '2';
  const code = `f"{${number}:.${decimals}f}"`;
  return [code, Python.ORDER_ATOMIC];
};

// Get element from 2D array
Python.forBlock['essentials_list_get_2d'] = function (block) {
  const array = Python.valueToCode(block, 'ARRAY', Python.ORDER_MEMBER) || '[]';
  const row = Python.valueToCode(block, 'ROW', Python.ORDER_NONE) || '0';
  const col = Python.valueToCode(block, 'COL', Python.ORDER_NONE) || '0';
  const code = `${array}[${row}][${col}]`;
  return [code, Python.ORDER_MEMBER];
};

// Set element in 2D array
Python.forBlock['essentials_list_set_2d'] = function (block) {
  const array = Python.valueToCode(block, 'ARRAY', Python.ORDER_MEMBER) || '[]';
  const row = Python.valueToCode(block, 'ROW', Python.ORDER_NONE) || '0';
  const col = Python.valueToCode(block, 'COL', Python.ORDER_NONE) || '0';
  const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || 'None';
  const code = `${array}[${row}][${col}] = ${value}\n`;
  return code;
};

// Additional Essentials moved from python.js

Python.forBlock['essentials_text_literal'] = function (block) {
  const text = block.getFieldValue('TEXT');
  return [JSON.stringify(text), Python.ORDER_ATOMIC];
};

Python.forBlock['essentials_text_empty'] = function (block) {
  return ["''", Python.ORDER_ATOMIC];
};

Python.forBlock['essentials_text_concat'] = function (block) {
  const elements = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const code = Python.valueToCode(block, 'ADD' + i, Python.ORDER_NONE) || "''";
    elements.push(code);
  }
  const code = "''.join(str(x) for x in [" + elements.join(', ') + "])";
  return [code, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_format_fstring'] = function (block) {
  const template = Python.valueToCode(block, 'TEMPLATE', Python.ORDER_NONE) || "''";
  const variables = Python.valueToCode(block, 'VARS', Python.ORDER_NONE) || '{}';
  return [`f${template}.format(**${variables})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_len'] = function (block) {
  const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || "''";
  return [`len(${value})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_slice'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const start = Python.valueToCode(block, 'START', Python.ORDER_NONE) || 'None';
  const end = Python.valueToCode(block, 'END', Python.ORDER_NONE) || 'None';
  return [`${text}[${start}:${end}]`, Python.ORDER_MEMBER];
};

Python.forBlock['essentials_text_substr'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const index = Python.valueToCode(block, 'INDEX', Python.ORDER_NONE) || '0';
  const length = Python.valueToCode(block, 'LENGTH', Python.ORDER_NONE) || '0';
  return [`${text}[${index}:${index} + ${length}]`, Python.ORDER_MEMBER];
};

Python.forBlock['essentials_text_index_of'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const substring = Python.valueToCode(block, 'SUBSTRING', Python.ORDER_NONE) || "''";
  return [`${text}.find(${substring})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_contains'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const substring = Python.valueToCode(block, 'SUBSTRING', Python.ORDER_NONE) || "''";
  return [`${substring} in ${text}`, Python.ORDER_RELATIONAL];
};

Python.forBlock['essentials_text_startswith'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const substring = Python.valueToCode(block, 'SUBSTRING', Python.ORDER_NONE) || "''";
  return [`${text}.startswith(${substring})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_endswith'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const substring = Python.valueToCode(block, 'SUBSTRING', Python.ORDER_NONE) || "''";
  return [`${text}.endswith(${substring})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_change_case'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const caseType = block.getFieldValue('CASE');
  let methodName;
  switch (caseType) {
    case 'UPPERCASE':
      methodName = 'upper';
      break;
    case 'LOWERCASE':
      methodName = 'lower';
      break;
    case 'TITLECASE':
      methodName = 'title';
      break;
  }
  return [`${text}.${methodName}()`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_strip'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  return [`${text}.strip()`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_split'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const separator = Python.valueToCode(block, 'SEPARATOR', Python.ORDER_NONE) || "''";
  return [`${text}.split(${separator})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_join'] = function (block) {
  const list = Python.valueToCode(block, 'LIST', Python.ORDER_MEMBER) || '[]';
  const separator = Python.valueToCode(block, 'SEPARATOR', Python.ORDER_NONE) || "''";
  return [`${separator}.join(${list})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_replace'] = function (block) {
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_MEMBER) || "''";
  const old_ = Python.valueToCode(block, 'OLD', Python.ORDER_NONE) || "''";
  const new_ = Python.valueToCode(block, 'NEW', Python.ORDER_NONE) || "''";
  return [`${text}.replace(${old_}, ${new_})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_escape_html'] = function (block) {
  Python.addImport('import html');
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_NONE) || "''";
  return [`html.escape(${text})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_text_unescape_html'] = function (block) {
  Python.addImport('import html');
  const text = Python.valueToCode(block, 'TEXT', Python.ORDER_NONE) || "''";
  return [`html.unescape(${text})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_is_instance'] = function (block) {
  const obj = Python.valueToCode(block, 'OBJ', Python.ORDER_NONE) || 'None';
  const type = Python.valueToCode(block, 'TYPE', Python.ORDER_NONE) || 'None';
  return [`isinstance(${obj}, ${type})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_type_of'] = function (block) {
  const obj = Python.valueToCode(block, 'OBJ', Python.ORDER_NONE) || 'None';
  return [`type(${obj})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_cast'] = function (block) {
  const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || 'None';
  const type = block.getFieldValue('TYPE');
  return [`${type}(${value})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['essentials_default_if_none'] = function (block) {
  const value = Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || 'None';
  const default_val = Python.valueToCode(block, 'DEFAULT', Python.ORDER_NONE) || 'None';
  return [`${value} if ${value} is not None else ${default_val}`, Python.ORDER_CONDITIONAL];
};

Python.forBlock['essentials_bool_true'] = function (block) {
  return ['True', Python.ORDER_ATOMIC];
};

Python.forBlock['essentials_bool_false'] = function (block) {
  return ['False', Python.ORDER_ATOMIC];
};

Python.forBlock['essentials_logic_and'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_LOGICAL_AND) || 'False';
  const b = Python.valueToCode(block, 'B', Python.ORDER_LOGICAL_AND) || 'False';
  return [`${a} and ${b}`, Python.ORDER_LOGICAL_AND];
};

Python.forBlock['essentials_logic_or'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_LOGICAL_OR) || 'False';
  const b = Python.valueToCode(block, 'B', Python.ORDER_LOGICAL_OR) || 'False';
  return [`${a} or ${b}`, Python.ORDER_LOGICAL_OR];
};

Python.forBlock['essentials_logic_not'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_LOGICAL_NOT) || 'True';
  return [`not ${a}`, Python.ORDER_LOGICAL_NOT];
};

Python.forBlock['essentials_compare'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_RELATIONAL) || '0';
  const b = Python.valueToCode(block, 'B', Python.ORDER_RELATIONAL) || '0';
  const op = block.getFieldValue('OP');
  const OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  return [`${a} ${OPERATORS[op]} ${b}`, Python.ORDER_RELATIONAL];
};

Python.forBlock['essentials_in_operator'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_RELATIONAL) || 'None';
  const b = Python.valueToCode(block, 'B', Python.ORDER_RELATIONAL) || '[]';
  return [`${a} in ${b}`, Python.ORDER_RELATIONAL];
};

Python.forBlock['essentials_not_in_operator'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_RELATIONAL) || 'None';
  const b = Python.valueToCode(block, 'B', Python.ORDER_RELATIONAL) || '[]';
  return [`${a} not in ${b}`, Python.ORDER_RELATIONAL];
};

Python.forBlock['essentials_ternary'] = function (block) {
  const a = Python.valueToCode(block, 'A', Python.ORDER_CONDITIONAL) || 'None';
  const condition = Python.valueToCode(block, 'CONDITION', Python.ORDER_CONDITIONAL) || 'False';
  const b = Python.valueToCode(block, 'B', Python.ORDER_CONDITIONAL) || 'None';
  return [`${a} if ${condition} else ${b}`, Python.ORDER_CONDITIONAL];
};

Python.forBlock['essentials_assert'] = function (block) {
  const condition = Python.valueToCode(block, 'CONDITION', Python.ORDER_NONE) || 'False';
  const message = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || '';
  return `assert ${condition}, ${message}\n`;
};


Python.forBlock['essentials_log_info'] = function (block) {
  Python.addImport('import logging');
  const msg = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || "''";
  return `logging.info(${msg})\n`;
};

Python.forBlock['essentials_log_warn'] = function (block) {
  Python.addImport('import logging');
  const msg = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || "''";
  return `logging.warning(${msg})\n`;
};

Python.forBlock['essentials_log_error'] = function (block) {
  Python.addImport('import logging');
  const msg = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || "''";
  return `logging.error(${msg})\n`;
};

Python.forBlock['essentials_print_to_console'] = function (block) {
  const msg = Python.valueToCode(block, 'MESSAGE', Python.ORDER_NONE) || "''";
  return `print(${msg})\n`;
};

Python.forBlock['essentials_safe_input'] = function (block) {
  const prompt = Python.valueToCode(block, 'PROMPT', Python.ORDER_NONE) || "''";
  const type = (block.getFieldValue && block.getFieldValue('TYPE')) || null;
  // Backward compatible: if no TYPE field, return string input
  if (!type || type === 'str') {
    return [`input(${prompt})`, Python.ORDER_FUNCTION_CALL];
  }
  return [`${type}(input(${prompt}))`, Python.ORDER_FUNCTION_CALL];
};
