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
        var bc = assembler.call('myfunc').halt().label('myfunc').const_i32(42).ret().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(42, cpu.getResult());
    });
    it('call 2', function () {
        var bc = assembler.call('myfunc1').halt().label('myfunc1').call('myfunc2').const_i32(7).add().ret().label('myfunc2').const_i32(13).ret().get();
        var cpu = new vm.CPU();
        cpu.run(bc);
        assert.equal(20, cpu.getResult());
    });
});
