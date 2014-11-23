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
    it('mul32 1', function () {
        var bc = assembler.const_i32(3).const_i32(4).mul32.get();
        cpu.run(bc);
        assert.equal(12, cpu.getResult());
    });
    it('mul32 2', function () {
        var bc = assembler.const_i32(2000000000).const_i32(2).mul32.get();
        cpu.run(bc);
        assert.equal(4000000000, cpu.getResulti32u());
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
    it('div32u', function () {
        var bc = assembler.const_u32(2294967296).const_i32(2).div32u.get();
        cpu.run(bc);
        assert.equal(1147483648, cpu.getResult());
    });
    it('mod32', function () {
        var bc = assembler.const_i32(12).const_i32(5).mod32.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('mod32u', function () {
        var bc = assembler.const_u32(2294967296).const_i32(3).mod32u.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('and32', function () {
        var bc = assembler.const_i32(3).const_i32(6).and32.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('or2', function () {
        var bc = assembler.const_i32(3).const_i32(6).or32.get();
        cpu.run(bc);
        assert.equal(7, cpu.getResult());
    });
    it('xor32', function () {
        var bc = assembler.const_i32(3).const_i32(6).xor32.get();
        cpu.run(bc);
        assert.equal(5, cpu.getResult());
    });
    it('shl32', function () {
        var bc = assembler.const_i32(2000000000).const_i32(1).shl32.get();
        cpu.run(bc);
        assert.equal(-294967296, cpu.getResult());
    });
    it('shr32', function () {
        var bc = assembler.const_u32(4000000000).const_i32(1).shr32.get();
        cpu.run(bc);
        assert.equal(-147483648, cpu.getResult());
    });
    it('shr32u', function () {
        var bc = assembler.const_u32(4000000000).const_i32(1).shr32u.get();
        cpu.run(bc);
        assert.equal(2000000000, cpu.getResult());
    });
    it('call', function () {
        var bc = assembler.const_p('myfunc').call(0).halt.label('myfunc').const_i32(42).ret32.get();
        cpu.run(bc);
        assert.equal(42, cpu.getResult());
    });
    it('call 2', function () {
        var bc = assembler.const_p('myfunc1').call(0).halt.label('myfunc1').const_p('myfunc2').call(0).const_i32(7).add32.ret32.label('myfunc2').const_i32(13).ret32.get();
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
    it('jpnz 1', function () {
        var bc = assembler.const_i32(1).jpnz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('jpnz 2', function () {
        var bc = assembler.const_i32(0).jpnz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(1, cpu.getResult());
    });
    it('jr', function () {
        var bc = assembler.jr('ok').label('nop').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('jrz 1', function () {
        var bc = assembler.const_i32(1).jrz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(1, cpu.getResult());
    });
    it('jrz 2', function () {
        var bc = assembler.const_i32(0).jrz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('jrnz 1', function () {
        var bc = assembler.const_i32(1).jrnz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(2, cpu.getResult());
    });
    it('jrnz 2', function () {
        var bc = assembler.const_i32(0).jrnz('ok').const_i32(1).halt.label('ok').const_i32(2).halt.get();
        cpu.run(bc);
        assert.equal(1, cpu.getResult());
    });
    it('arg', function () {
        var bc = assembler.const_i32(42).const_p('func').call(1).halt.label('func').load_arg32(0).const_i32(8).add32.ret32.get();
        cpu.run(bc);
        assert.equal(50, cpu.getResult());
    });
    it('fact', function () {
        var bc = assembler.const_i32(5).const_p('fact').call(1).halt.label('fact').load_arg32(0).const_i32(1).eq32.jpnz('stop').load_arg32(0).load_arg32(0).const_i32(1).sub32.const_p('fact').call(1).mul32.ret32.label('stop').const_i32(1).ret32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 120);
    });
    it('ret', function () {
        var bc = assembler.const_i32(40).const_i32(2).const_p('func').call(0).add32.halt.label('func').const_i32(1).ret.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 42);
    });
    it('alloc32', function () {
        var bc = assembler.alloc32.const_i32(42).store32(0).const_i32(1).load_local32(0).halt.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 42);
    });
    it('sum with absolute jumps', function () {
        var bc = assembler.alloc32.alloc32.const_i32(0).store32(0).const_i32(0).store32(1).label('begin').load_local32(1).const_i32(11).ge32.jpnz('end').load_local32(0).load_local32(1).add32.store32(0).load_local32(1).const_i32(1).add32.store32(1).jp('begin').label('end').load_local32(0).halt.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 55);
    });
    it('sum with relative jumps', function () {
        var bc = assembler.alloc32.alloc32.const_i32(0).store32(0).const_i32(0).store32(1).label('begin').load_local32(1).const_i32(11).ge32.jpnz('end').load_local32(0).load_local32(1).add32.store32(0).load_local32(1).const_i32(1).add32.store32(1).jp('begin').label('end').load_local32(0).halt.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 55);
    });
    it('eq32 1', function () {
        var bc = assembler.const_u32(10).const_u32(10).eq32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 1);
    });
    it('eq32 2', function () {
        var bc = assembler.const_u32(10).const_u32(11).eq32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('ne32 1', function () {
        var bc = assembler.const_u32(10).const_u32(10).ne32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('ne32 2', function () {
        var bc = assembler.const_u32(10).const_u32(11).ne32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 1);
    });
    it('gt32 1', function () {
        var bc = assembler.const_u32(10).const_u32(10).gt32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('gt32 2', function () {
        var bc = assembler.const_u32(2500000001).const_u32(2000000000).gt32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('gt32u', function () {
        var bc = assembler.const_u32(2500000001).const_u32(2000000000).gt32u.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 1);
    });
    it('ge32 1', function () {
        var bc = assembler.const_u32(10).const_u32(10).ge32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 1);
    });
    it('ge32 2', function () {
        var bc = assembler.const_u32(2500000001).const_u32(2000000000).ge32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('ge32u', function () {
        var bc = assembler.const_u32(2500000001).const_u32(2000000000).ge32u.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 1);
    });
    it('not32 1', function () {
        var bc = assembler.const_i32(1).not32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('not32 2', function () {
        var bc = assembler.const_i32(42).not32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 0);
    });
    it('not32 3', function () {
        var bc = assembler.const_i32(0).not32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), 1);
    });
    it('bnot32', function () {
        var bc = assembler.const_i32(3).bnot32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), -4);
    });
    it('neg32', function () {
        var bc = assembler.const_i32(5).neg32.get();
        cpu.run(bc);
        assert.equal(cpu.getResult(), -5);
    });
});
