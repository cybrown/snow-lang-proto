var ir2bc = require('./ir2bc');
var CPU = (function () {
    function CPU() {
        this.pc = 0;
        this.sp = -1;
        this.fp = 0;
        this.stack = new Array(100);
    }
    CPU.prototype.pop = function () {
        return this.stack[this.sp--];
    };
    CPU.prototype.push = function (value) {
        this.stack[++this.sp] = value;
    };
    CPU.prototype.readOpcode = function () {
        var value = this.bytecode.readUInt8(this.pc);
        this.pc++;
        return value;
    };
    CPU.prototype.readInt = function () {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    };
    CPU.prototype.readAddress = function () {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    };
    CPU.prototype.getResult = function () {
        return this.stack[this.sp];
    };
    CPU.prototype.run = function (bc) {
        this.bytecode = bc;
        while (this.pc < this.bytecode.length) {
            var opcode = this.readOpcode();
            if (opcode === 1 /* HALT */) {
                break;
            }
            this.runBytecode(opcode);
        }
    };
    CPU.prototype.runBytecode = function (opcode) {
        switch (opcode) {
            case 4 /* CONST */:
                this.runConst();
                break;
            case 2 /* ADD */:
                this.runAdd();
                break;
            case 3 /* SUB */:
                this.runSub();
                break;
            case 6 /* CALL */:
                this.runCall();
                break;
            case 5 /* RET */:
                this.runRet();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + this.pc);
        }
    };
    CPU.prototype.runConst = function () {
        var value = this.readInt();
        this.push(value);
    };
    CPU.prototype.runAdd = function () {
        var right = this.pop();
        var left = this.pop();
        var value = left + right;
        this.push(value);
    };
    CPU.prototype.runSub = function () {
        var right = this.pop();
        var left = this.pop();
        var value = left - right;
        this.push(value);
    };
    CPU.prototype.runCall = function () {
        var address = this.readAddress();
        this.push(this.fp);
        this.push(this.pc);
        this.pc = address;
        this.fp = this.sp;
    };
    CPU.prototype.runRet = function () {
        var result = this.pop();
        this.sp = this.fp;
        this.pc = this.pop();
        this.fp = this.pop();
        this.push(result);
    };
    return CPU;
})();
exports.CPU = CPU;
