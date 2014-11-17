var assert = require('assert');
var ir = require('../../main/ir');
var vm = require('../../main/vm');
var ir2bc = require('../../main/ir2bc');
var types = require('../../main/types');
describe('CPU', function () {
    it('add', function () {
        var r = new vm.CPU();
        var bc = new Buffer(11);
        bc.writeUInt8(4 /* CONST */, 0);
        bc.writeUInt32BE(1, 1);
        bc.writeUInt8(4 /* CONST */, 5);
        bc.writeUInt32BE(2, 6);
        bc.writeInt8(2 /* ADD */, 10);
        r.run(bc);
        assert.equal(3, r.getResult());
    });
    it('sub', function () {
        var r = new vm.CPU();
        var bc = new Buffer(11);
        bc.writeUInt8(4 /* CONST */, 0);
        bc.writeUInt32BE(13, 1);
        bc.writeUInt8(4 /* CONST */, 5);
        bc.writeUInt32BE(7, 6);
        bc.writeInt8(3 /* SUB */, 10);
        r.run(bc);
        assert.equal(6, r.getResult());
    });
    it('call', function () {
        var r = new vm.CPU();
        var irTranslator = new ir2bc.IrTranslator();
        var irRet = new ir.Return(new ir.IntegerConstant(42));
        var block = new ir.BasicBlock(null, [], irRet);
        var irFunc = new ir.Func(null, [block], new types.Func([], types.Integer.INT32));
        irTranslator.translateFunc(irFunc);
        var buffer = irTranslator.toBuffer();
        var b1 = new Buffer(12);
        b1.writeUInt8(6 /* CALL */, 0);
        b1.writeInt32BE(6, 1);
        b1.writeUInt8(1 /* HALT */, 5);
        buffer.copy(b1, 6);
        r.run(b1);
        assert.equal(42, r.getResult());
    });
});
