import { pythonGenerator as Python } from 'blockly/python';
Python.forBlock['oop_class'] = function (block) {
  const name = block.getFieldValue('NAME') || 'MyClass';
  const base = Python.valueToCode(block, 'BASE', Python.ORDER_NONE) || '';
  const body = Python.statementToCode(block, 'BODY') || '  pass\n';
  const basePart = base ? `(${base})` : '';
  return `class ${name}${basePart}:\n${body}`;
};

// Dataclass enhanced definitions
Python.forBlock['data_structures_record_define_dataclass_auto'] = function (block) {
  const name = block.getFieldValue('NAME') || 'MyRecord';
  const fields = Python.valueToCode(block, 'FIELDS', Python.ORDER_NONE) || '[]';
  const defaults = Python.valueToCode(block, 'DEFAULTS', Python.ORDER_NONE) || '[]';
  const repr = block.getFieldValue('REPR') === 'TRUE';
  const frozen = block.getFieldValue('FROZEN') === 'TRUE';
  Python.addImport('import dataclasses');
  // Expect fields list of strings; defaults list aligned length or subset.
  // Build assignments inside class
  let bodyLines = [];
  bodyLines.push('@dataclasses.dataclass' + (frozen || repr ? `(${[repr ? 'repr=True' : '', frozen ? 'frozen=True' : ''].filter(Boolean).join(',')})` : ''));
  bodyLines.push(`class ${name}:`);
  bodyLines.push(`  pass  # fields injected by runtime processing of list`);
  // Simplify: rely on separate instantiation helper; advanced field injection omitted due to dynamic nature.
  return bodyLines.join('\n') + '\n';
};

Python.forBlock['data_structures_record_define_namedtuple_annotated'] = function (block) {
  const name = block.getFieldValue('NAME') || 'MyTuple';
  const fields = Python.valueToCode(block, 'FIELDS', Python.ORDER_NONE) || '[]';
  Python.addImport('import typing');
  // fields expected as list of (name, type) tuples or strings "name:type"
  return `${name} = typing.NamedTuple('${name}', ${fields})\n`;
};

Python.forBlock['oop_method'] = function (block) {
  const name = block.getFieldValue('NAME') || 'method';
  // Collect parameters from mutator dummy inputs PARAMi with field P{i}
  const params = ['self'];
  let i = 0;
  while (block.getFieldValue('P' + i)) {
    params.push(block.getFieldValue('P' + i));
    i++;
  }
  const body = Python.statementToCode(block, 'DO') || '  pass\n';
  return `def ${name}(${params.join(', ')}):\n${body}`;
};

Python.forBlock['oop_constructor'] = function (block) {
  const params = ['self'];
  let i = 0;
  while (block.getFieldValue('P' + i)) {
    params.push(block.getFieldValue('P' + i));
    i++;
  }
  const body = Python.statementToCode(block, 'DO') || '  pass\n';
  return `def __init__(${params.join(', ')}):\n${body}`;
};

Python.forBlock['oop_super_init'] = function (block) {
  const args = Python.valueToCode(block, 'ARGS', Python.ORDER_NONE) || '[]';
  return `super().__init__(*${args})\n`;
};

Python.forBlock['oop_super_call'] = function (block) {
  const method = block.getFieldValue('METHOD') || 'method';
  const args = Python.valueToCode(block, 'ARGS', Python.ORDER_NONE) || '[]';
  return `super().${method}(*${args})\n`;
};

Python.forBlock['oop_magic_method'] = function (block) {
  const magicMethod = block.getFieldValue('MAGIC_METHOD');
  const body = Python.statementToCode(block, 'BODY') || '    pass\n';

  const methodMap = {
    'STR': '__str__(self)',
    'REPR': '__repr__(self)',
    'EQ': '__eq__(self, other)',
    'LT': '__lt__(self, other)',
    'LE': '__le__(self, other)',
    'GT': '__gt__(self, other)',
    'GE': '__ge__(self, other)',
    'NE': '__ne__(self, other)',
    'ADD': '__add__(self, other)',
    'SUB': '__sub__(self, other)',
    'MUL': '__mul__(self, other)',
    'TRUEDIV': '__truediv__(self, other)',
    'LEN': '__len__(self)',
    'GETITEM': '__getitem__(self, key)',
    'SETITEM': '__setitem__(self, key, value)',
    'DELITEM': '__delitem__(self, key)',
    'CONTAINS': '__contains__(self, item)',
    'ITER': '__iter__(self)',
    'NEXT': '__next__(self)',
    'CALL': '__call__(self, *args, **kwargs)',
    'ENTER': '__enter__(self)',
    'EXIT': '__exit__(self, exc_type, exc_val, exc_tb)'
  };

  const signature = methodMap[magicMethod] || '__str__(self)';
  const code = `def ${signature}:\n${body}`;
  return code;
};

Python.forBlock['oop_property_decorator'] = function (block) {
  const decoratorType = block.getFieldValue('DECORATOR_TYPE');
  const propName = block.getFieldValue('PROP_NAME') || 'property_name';
  const body = Python.statementToCode(block, 'BODY') || '    pass\n';

  let decorator;
  if (decoratorType === 'GETTER') {
    decorator = '@property';
  } else if (decoratorType === 'SETTER') {
    decorator = `@${propName}.setter`;
  } else { // DELETER
    decorator = `@${propName}.deleter`;
  }

  const code = `${decorator}\ndef ${propName}(self):\n${body}`;
  return code;
};

Python.forBlock['oop_class_decorator'] = function (block) {
  const decorator = block.getFieldValue('DECORATOR');
  const methodName = block.getFieldValue('METHOD_NAME') || 'method_name';
  const body = Python.statementToCode(block, 'BODY') || '    pass\n';

  // Get parameters
  let params = [];
  if (decorator === 'CLASSMETHOD') {
    params.push('cls');
  }
  // Add custom params
  let i = 0;
  while (block.getField('P' + i)) {
    params.push(block.getFieldValue('P' + i));
    i++;
  }

  const decoratorAnnotation = decorator === 'CLASSMETHOD' ? '@classmethod' : '@staticmethod';
  const paramStr = params.length > 0 ? params.join(', ') : '';
  const code = `${decoratorAnnotation}\ndef ${methodName}(${paramStr}):\n${body}`;
  return code;
};
