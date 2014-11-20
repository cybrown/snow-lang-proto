var assert = require('assert');
var ir = require('../../main/ir');
var ir2bc = require('../../main/ir2bc');
var types = require('../../main/types');
describe('IR to Bytecode translator', function () {
    var irTranslator;
    beforeEach(function () {
        irTranslator = new ir2bc.IrTranslator();
    });
    it('IntegerConstant', function () {
        var irIntegerConstant = new ir.IntegerConstant(1);
        irTranslator.translateIntegerConstant(irIntegerConstant);
        var buffer = irTranslator.toBuffer();
        assert.equal(2 /* CONST32 */, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
    });
    it('Add', function () {
        var irAdd = new ir.Add(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        irTranslator.translateAdd(irAdd);
        var buffer = irTranslator.toBuffer();
        assert.equal(2 /* CONST32 */, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(2 /* CONST32 */, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(3 /* ADD32 */, buffer.readUInt8(10));
    });
    it('Sub', function () {
        var irSub = new ir.Sub(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        irTranslator.translateSub(irSub);
        var buffer = irTranslator.toBuffer();
        assert.equal(2 /* CONST32 */, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(2 /* CONST32 */, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(4 /* SUB32 */, buffer.readUInt8(10));
    });
    it('Call', function () {
        var irCall = new ir.Call(new ir.Func(null, null, null), [new ir.IntegerConstant(1)]);
        irTranslator.translateCall(irCall);
        var buffer = irTranslator.toBuffer();
        assert.equal(2 /* CONST32 */, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(0, buffer.readInt32BE(5));
        assert.equal(12 /* CALL */, buffer.readUInt8(9));
    });
    it('Func', function () {
        var irAdd = new ir.Add(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        var irRet = new ir.Return(new ir.IntegerConstant(1));
        var block = new ir.BasicBlock(null, [irAdd], irRet);
        var irFunc = new ir.Func(null, [block], new types.Func([], types.Integer.INT32));
        irTranslator.translateFunc(irFunc);
        var buffer = irTranslator.toBuffer();
        assert.equal(2 /* CONST32 */, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(2 /* CONST32 */, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(3 /* ADD32 */, buffer.readUInt8(10));
        assert.equal(buffer.readUInt8(11), 2 /* CONST32 */);
        assert.equal(buffer.readInt32BE(12), 1);
        assert.equal(buffer.readUInt8(16), 10 /* RET32 */);
    });
    it('Return', function () {
        var irRet = new ir.Return(new ir.IntegerConstant(1));
        irTranslator.translateReturn(irRet);
        var buffer = irTranslator.toBuffer();
        assert.equal(buffer.readUInt8(0), 2 /* CONST32 */);
        assert.equal(buffer.readInt32BE(1), 1);
        assert.equal(buffer.readUInt8(5), 10 /* RET32 */);
    });
    it('BasicBlock', function () {
        var irAdd = new ir.Add(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        var irRet = new ir.Return(new ir.IntegerConstant(1));
        var block = new ir.BasicBlock(null, [irAdd], irRet);
        irTranslator.translateBasicBlock(block);
        var buffer = irTranslator.toBuffer();
        assert.equal(2 /* CONST32 */, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(2 /* CONST32 */, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(3 /* ADD32 */, buffer.readUInt8(10));
        assert.equal(buffer.readUInt8(11), 2 /* CONST32 */);
        assert.equal(buffer.readInt32BE(12), 1);
        assert.equal(buffer.readUInt8(16), 10 /* RET32 */);
    });
});
