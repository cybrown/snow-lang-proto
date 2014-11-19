import assert = require('assert');

import ir = require('../../main/ir');
import ir2bc = require('../../main/ir2bc');
import types = require('../../main/types');

describe('IR to Bytecode translator', () => {

    var irTranslator: ir2bc.IrTranslator;

    beforeEach(() => {
        irTranslator = new ir2bc.IrTranslator();
    });

    it('IntegerConstant', () => {
        var irIntegerConstant = new ir.IntegerConstant(1);
        irTranslator.translateIntegerConstant(irIntegerConstant);
        var buffer = irTranslator.toBuffer();
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
    });

    it('Add', () => {
        var irAdd = new ir.Add(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        irTranslator.translateAdd(irAdd);
        var buffer = irTranslator.toBuffer();
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(ir2bc.Opcode.ADD32, buffer.readUInt8(10));
    });

    it('Sub', () => {
        var irSub = new ir.Sub(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        irTranslator.translateSub(irSub);
        var buffer = irTranslator.toBuffer();
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(ir2bc.Opcode.SUB32, buffer.readUInt8(10));
    });

    it('Call', () => {
        var irCall = new ir.Call(new ir.Func(null, null, null), [new ir.IntegerConstant(1)]);
        irTranslator.translateCall(irCall);
        var buffer = irTranslator.toBuffer();
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(0, buffer.readInt32BE(5));
        assert.equal(ir2bc.Opcode.CALL, buffer.readUInt8(9));
    });

    it('Func', () => {
        var irAdd = new ir.Add(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        var irRet = new ir.Return(new ir.IntegerConstant(1));
        var block = new ir.BasicBlock(null, [irAdd], irRet);
        var irFunc = new ir.Func(null, [block], new types.Func([], types.Integer.INT32));
        irTranslator.translateFunc(irFunc);
        var buffer = irTranslator.toBuffer();
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(ir2bc.Opcode.ADD32, buffer.readUInt8(10));
        assert.equal(buffer.readUInt8(11), ir2bc.Opcode.CONST32);
        assert.equal(buffer.readInt32BE(12), 1);
        assert.equal(buffer.readUInt8(16), ir2bc.Opcode.RET32);
    });

    it('Return', () => {
        var irRet = new ir.Return(new ir.IntegerConstant(1));
        irTranslator.translateReturn(irRet);
        var buffer = irTranslator.toBuffer();
        assert.equal(buffer.readUInt8(0), ir2bc.Opcode.CONST32);
        assert.equal(buffer.readInt32BE(1), 1);
        assert.equal(buffer.readUInt8(5), ir2bc.Opcode.RET32);
    });

    it('BasicBlock', () => {
        var irAdd = new ir.Add(new ir.IntegerConstant(1), new ir.IntegerConstant(2));
        var irRet = new ir.Return(new ir.IntegerConstant(1));
        var block = new ir.BasicBlock(null, [irAdd], irRet);
        irTranslator.translateBasicBlock(block);
        var buffer = irTranslator.toBuffer();
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(0));
        assert.equal(1, buffer.readInt32BE(1));
        assert.equal(ir2bc.Opcode.CONST32, buffer.readUInt8(5));
        assert.equal(2, buffer.readInt32BE(6));
        assert.equal(ir2bc.Opcode.ADD32, buffer.readUInt8(10));
        assert.equal(buffer.readUInt8(11), ir2bc.Opcode.CONST32);
        assert.equal(buffer.readInt32BE(12), 1);
        assert.equal(buffer.readUInt8(16), ir2bc.Opcode.RET32);
    });
});
