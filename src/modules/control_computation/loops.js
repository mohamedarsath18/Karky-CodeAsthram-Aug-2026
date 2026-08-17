import * as Blockly from "blockly/core";
// While loop block (infinite or expression-based)
Blockly.defineBlocksWithJsonArray([
  {
    "type": "control_while_true_inline",
    "message0": "while %1 %2 do %3",
    "args0": [
      { "type": "field_dropdown", "name": "COND_MODE", "options": [["True", "TRUE"], ["expression", "EXPR"]] },
      { "type": "input_value", "name": "COND", "check": "Boolean" },
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#9B59B6",
    "tooltip": "While loop. Defaults to an infinite loop.",
    "helpUrl": "https://docs.python.org/3/reference/compound_stmts.html#the-while-statement"
  }
]);

Blockly.Extensions.register('control_while_true_inline_extension', function () {
  this.setOnChange(function () {
    const mode = this.getFieldValue('COND_MODE');
    const condInput = this.getInput('COND');
    if (!condInput) return;
    condInput.setVisible(mode === 'EXPR');
    if (this.rendered) this.render();
  });
});
Blockly.defineBlocksWithJsonArray([
  {
    "type": "control_for_indexed",
    "message0": "for index %1, value %2 in %3",
    "args0": [
      {
        "type": "field_variable",
        "name": "INDEX_VAR",
        "variable": "i",
        "colour": "#9B59B6"
      },
      {
        "type": "field_variable",
        "name": "VALUE_VAR",
        "variable": "item"
      },
      {
        "type": "input_value",
        "name": "LIST",
        "check": "Array"
      }
    ],
    "message1": "do %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#9B59B6",
    "tooltip": "Loops through a list with an index and value."
  },
  {
    "type": "control_for_zip",
    "message0": "for %1 in zip %2",
    "args0": [
      {
        "type": "field_input",
        "name": "VARS",
        "text": "a, b",
        "colour": "#9B59B6"
      },
      {
        "type": "input_dummy",
        "name": "INPUTS"
      }
    ],
    "message1": "do %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#9B59B6",
    "tooltip": "Loops through multiple lists at once.",
    "mutator": "control_for_zip_mutator"
  },
  {
    "type": "control_loop_limit",
    "message0": "limit loop iterations to %1",
    "args0": [{
      "type": "field_number",
      "name": "LIMIT",
      "value": 1000
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#9B59B6",
    "tooltip": "Adds a safety limit to a loop to prevent infinite loops."
  },
  {
    "type": "control_flow_break_continue",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "FLOW",
        "options": [["break", "BREAK"], ["continue", "CONTINUE"]]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#9B59B6",
    "tooltip": "Loop control: break or continue.",
    "helpUrl": "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements"
  }
]);
import { createPlusField } from "..\/..\/plugins\/block-plus-minus\/field_plus";
import { createMinusField } from "..\/..\/plugins\/block-plus-minus\/field_minus";
const forZipMutator = {
  itemCount_: 0,
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  domToMutation: function (xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_(targetCount);
  },
  saveExtraState: function () {
    return { itemCount: this.itemCount_ };
  },
  loadExtraState: function (state) {
    this.updateShape_(state["itemCount"]);
  },
  updateShape_: function (targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
  },
  plus: function () {
    this.addPart_();
  },
  minus: function (index) {
    if (this.itemCount_ > 0) {
      this.removePart_(index);
    }
  },
  addPart_: function () {
    this.appendValueInput("ADD" + this.itemCount_).setCheck("Array");
    this.itemCount_++;
  },
  removePart_: function (index) {
    this.itemCount_--;
    this.removeInput("ADD" + this.itemCount_);
  }
};
const forZipHelper = function () {
  this.getInput("INPUTS").appendField(createPlusField(), "PLUS").appendField(createMinusField(), "MINUS");
  this.updateShape_(2);
};
Blockly.Extensions.registerMutator("control_for_zip_mutator", forZipMutator, forZipHelper);