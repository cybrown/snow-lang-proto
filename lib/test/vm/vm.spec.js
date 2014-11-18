var assert = require('assert');
var vm = require('../../main/vm');
var ir2bc = require('../../main/ir2bc');
describe('CPU', function () {
    var assembler;
    beforeEach(function () {
        assembler = new ir2bc.Assembler();
    });
    it('add', function () {
        var r = new vm.CPU();
        var bc = assembler.const_i32(1).const_i32(2).add().get();
        r.run(bc);
        assert.equal(3, r.getResult());
    });
    it('mul', function () {
        var r = new vm.CPU();
        var bc = assembler.const_i32(3).const_i32(4).mul().get();
        r.run(bc);
        assert.equal(12, r.getResult());
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
        var bc = assembler.call('myfunc', 0).halt().label('myfunc').const_i32(42).ret().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(42, cpu.getResult());
    });
    it('call 2', function () {
        var bc = assembler.call('myfunc1', 0).halt().label('myfunc1').call('myfunc2', 0).const_i32(7).add().ret().label('myfunc2').const_i32(13).ret().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(20, cpu.getResult());
    });
    it('jump', function () {
        var bc = assembler.jp('ok').label('nop').const_i32(1).halt().label('ok').const_i32(2).halt().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('jpz 1', function () {
        var bc = assembler.const_i32(1).jpz('ok').label('nop').const_i32(1).halt().label('ok').const_i32(2).halt().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(1, cpu.getResult());
    });
    it('jpz 2', function () {
        var bc = assembler.const_i32(0).jpz('ok').label('nop').const_i32(1).halt().label('ok').const_i32(2).halt().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('arg', function () {
        var bc = assembler.const_i32(42).call('func', 1).halt().label('func').load_arg(0).const_i32(8).add().ret().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(50, cpu.getResult());
    });
    it('fact', function () {
        var bc = assembler.const_i32(5).call('fact', 1).halt().label('fact').load_arg(0).const_i32(1).sub().jpz('isZero').load_arg(0).load_arg(0).const_i32(1).sub().call('fact', 1).mul().ret().label('isZero').const_i32(1).ret().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 120);
    });
    it('retvoid', function () {
        var bc = assembler.const_i32(40).const_i32(2).call('func', 0).add().halt().label('func').const_i32(1).retvoid().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 42);
    });
});
