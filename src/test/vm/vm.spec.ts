import assert = require('assert');

import ir = require('../../main/ir');
import vm = require('../../main/vm');
import ir2bc = require('../../main/ir2bc');
import types = require('../../main/types');

describe('CPU', () => {

    var assembler: ir2bc.Assembler;

    beforeEach(() => {
        assembler = new ir2bc.Assembler();
    });

    it('add', () => {
        var r = new vm.CPU();
        var bc = assembler
            .const_i32(1)
            .const_i32(2)
            .add()
            .get();
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
        var bc = assembler
            .call('myfunc')
            .halt()
            .label('myfunc')
            .const_i32(42)
            .ret()
            .get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(42, cpu.getResult());
    });

    it('call 2', () => {
        var bc = assembler
            .call('myfunc1')
            .halt()
            .label('myfunc1')
            .call('myfunc2')
            .const_i32(7)
            .add()
            .ret()
            .label('myfunc2')
            .const_i32(13)
            .ret()
            .get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(20, cpu.getResult());
    });
});
