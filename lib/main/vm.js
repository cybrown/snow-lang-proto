var ir2bc = require('./ir2bc');
var CPU = (function () {
    function CPU() {
        this.pc = 0;
        this.sp = -1;
        this.fp = 0;
        this.debug = false;
        this.stack = new Buffer(2048);
    }
    CPU.prototype.set32 = function (offset, value) {
        this.stack.writeInt32BE(value | 0, offset * 4);
    };
    CPU.prototype.get32 = function (offset) {
        return this.stack.readInt32BE(offset * 4);
    };
    CPU.prototype.pop32 = function () {
        return this.get32(this.sp--);
    };
    CPU.prototype.push32 = function (value) {
        this.set32(++this.sp, value);
    };
    CPU.prototype.readOpcode = function () {
        var value = this.bytecode.readUInt8(this.pc);
        this.pc++;
        return value;
    };
    CPU.prototype.readInt32 = function () {
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
        return this.get32(this.sp);
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
        if (this.debug) {
            console.log('[%s] %s', this.pc - 1, ir2bc.Opcode[opcode]);
            this.logStack();
        }
        switch (opcode) {
            case 2 /* CONST32 */:
                this.runConst32();
                break;
            case 3 /* ADD32 */:
                this.runAdd32();
                break;
            case 4 /* SUB32 */:
                this.runSub32();
                break;
            case 5 /* MUL32 */:
                this.runMul32();
                break;
            case 6 /* DIV32 */:
                this.runDiv32();
                break;
            case 7 /* MOD32 */:
                this.runMod32();
                break;
            case 10 /* CALL */:
                this.runCall();
                break;
            case 8 /* RET32 */:
                this.runRet32();
                break;
            case 9 /* RET */:
                this.runRet();
                break;
            case 11 /* JP */:
                this.runJp();
                break;
            case 12 /* JPZ */:
                this.runJpz();
                break;
            case 13 /* LOAD_ARG32 */:
                this.runLoadArg32();
                break;
            case 14 /* PUSH32_0 */:
                this.runPush32_0();
                break;
            case 15 /* STORE32 */:
                this.runStore32();
                break;
            case 16 /* LOAD_LOCAL32 */:
                this.runLoadLocal32();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            this.logStack();
        }
    };
    CPU.prototype.logStack = function () {
        var _this = this;
        var offsets = [];
        for (var i = 0; i <= this.sp; i++) {
            offsets.push(i);
        }
        console.log(offsets.map(function (offset) { return _this.get32(offset); }));
    };
    CPU.prototype.runLoadLocal32 = function () {
        var offset = this.readInt32();
        this.push32(this.get32(this.fp + offset));
    };
    CPU.prototype.runPush32_0 = function () {
        this.push32(0);
    };
    CPU.prototype.runStore32 = function () {
        var offset = this.readInt32();
        this.set32(this.fp + offset, this.pop32());
    };
    CPU.prototype.runConst32 = function () {
        var value = this.readInt32();
        this.push32(value);
    };
    CPU.prototype.runAdd32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left + right;
        this.push32(value);
    };
    CPU.prototype.runSub32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left - right;
        this.push32(value);
    };
    CPU.prototype.runMul32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left * right;
        this.push32(value);
    };
    CPU.prototype.runDiv32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left / right;
        this.push32(value);
    };
    CPU.prototype.runMod32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left % right;
        this.push32(value);
    };
    CPU.prototype.runCall = function () {
        var address = this.readAddress();
        var argc = this.readInt32();
        this.push32(argc);
        this.push32(this.fp);
        this.push32(this.pc);
        if (this.debug) {
            console.log('Saving argc: %s', argc);
            console.log('Saving pc: %s', this.pc);
            console.log('Saving fp: %s', this.fp);
        }
        this.pc = address;
        this.fp = this.sp;
    };
    CPU.prototype.runRet32 = function () {
        var result = this.pop32();
        this.sp = this.fp;
        this.pc = this.pop32();
        this.fp = this.pop32();
        this.sp = this.sp - this.pop32() - 1;
        if (this.debug) {
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
        this.push32(result);
    };
    CPU.prototype.runRet = function () {
        this.sp = this.fp;
        this.pc = this.pop32();
        this.fp = this.pop32();
        this.sp = this.sp - this.pop32() - 1;
        if (this.debug) {
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
    };
    CPU.prototype.runJp = function () {
        this.pc = this.readAddress();
    };
    CPU.prototype.runJpz = function () {
        var dest = this.readAddress();
        if (this.pop32() === 0) {
            this.pc = dest;
        }
    };
    CPU.prototype.runLoadArg32 = function () {
        var offset = this.readInt32();
        this.push32(this.get32(this.fp - offset - 3));
    };
    return CPU;
})();
exports.CPU = CPU;
