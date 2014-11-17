import assert = require('assert');

import ir = require('../../main/ir');
import vm = require('../../main/vm');
import ir2bc = require('../../main/ir2bc');
import types = require('../../main/types');

describe('CPU', () => {

    it('add', () => {
        var r = new vm.CPU();
        var bc = new Buffer(11);
        bc.writeUInt8(ir2bc.Opcode.CONST, 0);
        bc.writeUInt32BE(1, 1);
        bc.writeUInt8(ir2bc.Opcode.CONST, 5);
        bc.writeUInt32BE(2, 6);
        bc.writeInt8(ir2bc.Opcode.ADD, 10);
        r.run(bc);
        assert.equal(3, r.getResult());
    });

    it('sub', () => {
        var r = new vm.CPU();
        var bc = new Buffer(11);
        bc.writeUInt8(ir2bc.Opcode.CONST, 0);
        bc.writeUInt32BE(13, 1);
        bc.writeUInt8(ir2bc.Opcode.CONST, 5);
        bc.writeUInt32BE(7, 6);
        bc.writeInt8(ir2bc.Opcode.SUB, 10);
        r.run(bc);
        assert.equal(6, r.getResult());
    });

    it('call', () => {
        var r = new vm.CPU();
        var irTranslator = new ir2bc.IrTranslator();
        var irRet = new ir.Return(new ir.IntegerConstant(42));
        var block = new ir.BasicBlock(null, [], irRet);
        var irFunc = new ir.Func(null, [block], new types.Func([], types.Integer.INT32));
        irTranslator.translateFunc(irFunc);
        var buffer = irTranslator.toBuffer();
        var b1 = new Buffer(12);
        b1.writeUInt8(ir2bc.Opcode.CALL, 0);
        b1.writeInt32BE(6, 1);
        b1.writeUInt8(ir2bc.Opcode.HALT, 5);
        buffer.copy(b1, 6);
        r.run(b1);
        assert.equal(42, r.getResult());
    });
});
