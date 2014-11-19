var assert = require('assert');
var vm = require('../../main/vm');
var ir2bc = require('../../main/ir2bc');
describe('CPU', function () {
    var assembler;
    var cpu;
    beforeEach(function () {
        assembler = new ir2bc.Assembler();
        cpu = new vm.CPU();
    });
    it('add32', function () {
        var bc = assembler.const_i32(1).const_i32(2).add32.get();
        cpu.run(bc);
        assert.equal(3, cpu.getResult());
    });
    it('mul32', function () {
        var bc = assembler.const_i32(3).const_i32(4).mul32.get();
        cpu.run(bc);
        assert.equal(12, cpu.getResult());
    });
    it('sub32', function () {
        var bc = assembler.const_i32(13).const_i32(7).sub32.get();
        cpu.run(bc);
        assert.equal(6, cpu.getResult());
    });
    it('div32', function () {
        var bc = assembler.const_i32(12).const_i32(5).div32.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('mod32', function () {
        var bc = assembler.const_i32(12).const_i32(5).mod32.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('call', function () {
        var bc = assembler.call('myfunc', 0).halt.label('myfunc').const_i32(42).ret32.get();
        cpu.run(bc);
        assert.equal(42, cpu.getResult());
    });
    it('call 2', function () {
        var bc = assembler.call('myfunc1', 0).halt.label('myfunc1').call('myfunc2', 0).const_i32(7).add32.ret32.label('myfunc2').const_i32(13).ret32.get();
        cpu.run(bc);
        assert.equal(20, cpu.getResult());
    });
    it('jump', function () {
        var bc = assembler.jp('ok').label('nop').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('jpz 1', function () {
        var bc = assembler.const_i32(1).jpz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(1, cpu.getResult());
    });
    it('jpz 2', function () {
        var bc = assembler.const_i32(0).jpz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('arg', function () {
        var bc = assembler.const_i32(42).call('func', 1).halt.label('func').load_arg32(0).const_i32(8).add32.ret32.get();
        cpu.run(bc);
        assert.equal(50, cpu.getResult());
    });
    it('fact', function () {
        var bc = assembler.const_i32(5).call('fact', 1).halt.label('fact').load_arg32(0).const_i32(1).sub32.jpz('isZero').load_arg32(0).load_arg32(0).const_i32(1).sub32.call('fact', 1).mul32.ret32.label('isZero').const_i32(1).ret32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 120);
    });
    it('ret', function () {
        var bc = assembler.const_i32(40).const_i32(2).call('func', 0).add32.halt.label('func').const_i32(1).ret.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 42);
    });
});
