var assert = require('assert');
var parser = require('../../main/parser/index');
var ast2ir = require('../../main/ast2ir');
var ir2bc = require('../../main/ir2bc');
var vm = require('../../main/vm');
describe('e2e', function () {
    var astTranslator;
    var irTranslator;
    beforeEach(function () {
        astTranslator = new ast2ir.AstTranslator();
        irTranslator = new ir2bc.IrTranslator();
    });
    describe('Builtin', function () {
        it('#ADD(1, 2);', function () {
            var exprStm = parser.parse('#ADD(1, 2);').declarations[0];
            var irnode = astTranslator.translate(exprStm.expression);
            irTranslator.translate(irnode);
            var bytecode = irTranslator.toBuffer();
            var run = new vm.CPU();
            run.run(bytecode);
            assert.equal(3, run.getResult());
        });
    });
    describe('Call', function () {
        it('call', function () {
        });
    });
});
