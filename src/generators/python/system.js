import { pythonGenerator as Python } from 'blockly/python';
// os.environ get
Python.forBlock['system_env_get'] = function (block) {
  Python.addImport('import os');
  const key = Python.valueToCode(block, 'KEY', Python.ORDER_NONE) || '"KEY"';
  const defVal = Python.valueToCode(block, 'DEFAULT', Python.ORDER_NONE);
  const code = defVal ? `os.environ.get(${key}, ${defVal})` : `os.environ.get(${key})`;
  return [code, Python.ORDER_FUNCTION_CALL];
};
// __name__ == "__main__" guard
Python.forBlock['control_if_main'] = function (block) {
  const statements = Python.statementToCode(block, 'DO') || 'pass\n';
  const code = `if __name__ == "__main__":\n${Python.prefixLines(statements, Python.INDENT)}`;
  return code;
};
// Pathlib utilities generator
Python.forBlock['system_pathlib_util'] = function (block) {
  Python.imports_.add('from pathlib import Path');
  const method = block.getFieldValue('METHOD');
  if (method === 'cwd') {
    return ['Path.cwd()', Python.ORDER_FUNCTION_CALL];
  } else if (method === 'home') {
    return ['Path.home()', Python.ORDER_FUNCTION_CALL];
  } else if (method === 'joinpath') {
    const base = Python.valueToCode(block, 'ARG1', Python.ORDER_NONE) || 'Path.cwd()';
    const segment = Python.valueToCode(block, 'ARG2', Python.ORDER_NONE) || '"segment"';
    return [`${base}.joinpath(${segment})`, Python.ORDER_FUNCTION_CALL];
  } else if (method === 'suffix') {
    const p = Python.valueToCode(block, 'ARG1', Python.ORDER_NONE) || 'Path("file.txt")';
    return [`(${p}).suffix`, Python.ORDER_MEMBER];
  } else if (method === 'stem') {
    const p = Python.valueToCode(block, 'ARG1', Python.ORDER_NONE) || 'Path("file.txt")';
    return [`(${p}).stem`, Python.ORDER_MEMBER];
  } else if (method === 'parent') {
    const p = Python.valueToCode(block, 'ARG1', Python.ORDER_NONE) || 'Path("file.txt")';
    return [`(${p}).parent`, Python.ORDER_MEMBER];
  }
  return ['Path.cwd()', Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['system_os_getenv'] = function (block) {
  Python.addImport('import os');
  const varName = Python.valueToCode(block, 'VAR', Python.ORDER_NONE) || "''";
  return [`os.getenv(${varName})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['system_os_system'] = function (block) {
  Python.addImport('import os');
  const cmd = Python.valueToCode(block, 'CMD', Python.ORDER_NONE) || "''";
  return `os.system(${cmd})\n`;
};

Python.forBlock['system_io_open'] = function (block) {
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_NONE) || "''";
  const mode = block.getFieldValue('MODE');
  return [`open(${path}, '${mode}')`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['system_io_read'] = function (block) {
  const file = Python.valueToCode(block, 'FILE', Python.ORDER_MEMBER) || 'None';
  return [`${file}.read()`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['system_io_write'] = function (block) {
  const file = Python.valueToCode(block, 'FILE', Python.ORDER_MEMBER) || 'None';
  const content = Python.valueToCode(block, 'CONTENT', Python.ORDER_NONE) || "''";
  return `${file}.write(${content})\n`;
};

Python.forBlock['system_io_close'] = function (block) {
  const file = Python.valueToCode(block, 'FILE', Python.ORDER_MEMBER) || 'None';
  return `${file}.close()\n`;
};

Python.forBlock['system_io_remove'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_NONE) || "''";
  return `os.remove(${path})\n`;
};

Python.forBlock['system_io_listdir'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_NONE) || "''";
  return [`os.listdir(${path})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['system_os_getcwd'] = function (block) {
  Python.addImport('import os');
  return ['os.getcwd()', Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['system_sys_exit'] = function (block) {
  Python.addImport('import sys');
  const code = Python.valueToCode(block, 'CODE', Python.ORDER_NONE) || '';
  if (code) {
    return `sys.exit(${code})\n`;
  }
  return 'sys.exit()\n';
};

Python.forBlock['os_path_join'] = function (block) {
  Python.addImport('import os');
  const paths = Python.valueToCode(block, 'PATHS', Python.ORDER_NONE) || '[]';
  return [`os.path.join(*${paths})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['os_path_exists'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_NONE) || "''";
  return [`os.path.exists(${path})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['sys_argv'] = function (block) {
  Python.addImport('import sys');
  return ['sys.argv', Python.ORDER_ATOMIC];
};

Python.forBlock['sys_platform'] = function (block) {
  Python.addImport('import sys');
  return ['sys.platform', Python.ORDER_ATOMIC];
};

Python.forBlock['os_path_basename'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return [`os.path.basename(${path})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['os_path_dirname'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return [`os.path.dirname(${path})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['os_path_splitext'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return [`os.path.splitext(${path})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['os_mkdir'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return `os.mkdir(${path})\n`;
};

Python.forBlock['os_makedirs'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return `os.makedirs(${path}, exist_ok=True)\n`;
};

Python.forBlock['os_rename'] = function (block) {
  Python.addImport('import os');
  const src = Python.valueToCode(block, 'SRC', Python.ORDER_ATOMIC) || "''";
  const dst = Python.valueToCode(block, 'DST', Python.ORDER_ATOMIC) || "''";
  return `os.rename(${src}, ${dst})\n`;
};

Python.forBlock['os_path_isfile'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return [`os.path.isfile(${path})`, Python.ORDER_FUNCTION_CALL];
};

Python.forBlock['os_path_isdir'] = function (block) {
  Python.addImport('import os');
  const path = Python.valueToCode(block, 'PATH', Python.ORDER_ATOMIC) || "''";
  return [`os.path.isdir(${path})`, Python.ORDER_FUNCTION_CALL];
};
