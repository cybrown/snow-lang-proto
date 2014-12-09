var assert = require('assert');
var ir = require('../../main/ir');
var ir2llvm = require('../../main/ir2llvm');
var types = require('../../main/types');
describe('IR to LLVM translator', function () {
    var irTranslator;
    beforeEach(function () {
        irTranslator = new ir2llvm.Ir2llvm();
    });
    it('IntegerConstant', function () {
        var irIntegerConstant = new ir.IntegerConstant(42);
        irTranslator.translate(irIntegerConstant);
        var result = irTranslator.get();
        assert.equal(result, '');
    });
    describe('Return', function () {
        it('with i32 value', function () {
            var integerConstant42 = new ir.IntegerConstant(42);
            var irRet = new ir.ReturnValue(integerConstant42);
            irTranslator.translate(irRet);
            var result = irTranslator.get();
            assert.equal(result, '\n' + '  ret i32 42');
        });
    });
    describe('Func', function () {
        it('+name -content -args', function () {
            var irFunc = new ir.Func(null, [], new types.Func([], types.Integer.INT32), 'funcName');
            irTranslator.translate(irFunc);
            var result = irTranslator.get();
            assert.equal(result, 'define i32 @funcName() {\n}');
        });
        it('+name -content +args', function () {
            var irFunc = new ir.Func(null, [], new types.Func([types.Integer.INT32], types.Integer.INT32), 'funcName');
            irTranslator.translate(irFunc);
            var result = irTranslator.get();
            assert.equal(result, 'define i32 @funcName(i32 %arg0) {\n}');
        });
        it('+name +oneBasicBlock -args', function () {
            var integerConstant13 = new ir.IntegerConstant(13);
            var integerConstant42 = new ir.IntegerConstant(42);
            var irBasicBlock = new ir.BasicBlock(null, [integerConstant13], new ir.ReturnValue(integerConstant42));
            var irFunc = new ir.Func(null, [irBasicBlock], new types.Func([], types.Integer.INT32), 'funcName');
            irTranslator.translate(irFunc);
            var result = irTranslator.get();
            assert.equal(result, 'define i32 @funcName() {\n' + '  ret i32 42\n' + '}');
        });
        it('-name -content -args, should concatenate func with id of ir node', function () {
            var irFunc = new ir.Func(null, [], new types.Func([], types.Integer.INT32));
            irTranslator.translate(irFunc);
            var id = irFunc.id;
            var result = irTranslator.get();
            assert.equal(result, 'define i32 @func' + id + '() {\n}');
        });
    });
    describe('BasicBlock', function () {
        it('basic block with 2 integer constants', function () {
            var integerConstant13 = new ir.IntegerConstant(13);
            var integerConstant7 = new ir.IntegerConstant(7);
            var integerConstant42 = new ir.IntegerConstant(42);
            var irBasicBlock = new ir.BasicBlock(null, [integerConstant13, integerConstant7], new ir.ReturnValue(integerConstant42));
            irTranslator.translate(irBasicBlock);
            var result = irTranslator.get();
            assert.equal(result, '\n' + '  ret i32 42');
        });
    });
});
