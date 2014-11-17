import assert = require('assert');

import parser = require('../../main/parser/index');
import ast = require('../../main/ast');
import ir = require('../../main/ir');
import ast2ir = require('../../main/ast2ir');
import ir2bc = require('../../main/ir2bc');
import vm = require('../../main/vm');

describe('e2e', () => {

    var astTranslator: ast2ir.AstTranslator;
    var irTranslator: ir2bc.IrTranslator;

    beforeEach(() => {
        astTranslator = new ast2ir.AstTranslator();
        irTranslator = new ir2bc.IrTranslator();
    });

    describe('Builtin', () => {

        it('#ADD(1, 2);', () => {
            var exprStm = <ast.ExpressionStatement> parser.parse('#ADD(1, 2);').declarations[0];
            var irnode = astTranslator.translate(exprStm.expression);
            irTranslator.translate(irnode);
            var bytecode = irTranslator.toBuffer();
            var run = new vm.CPU();
            run.run(bytecode);
            assert.equal(3, run.getResult());
        });
    });

    describe ('Call', () => {

        it ('call', () => {

        });
    });
});
