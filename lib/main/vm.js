var ir2bc = require('./ir2bc');
var CPU = (function () {
    function CPU() {
        this.pc = 0;
        this.sp = -1;
        this.fp = 0;
        this.debug = false;
        this.stack = new Array(100);
    }
    CPU.prototype.pop32 = function () {
        return this.stack[this.sp--] | 0;
    };
    CPU.prototype.push32 = function (value) {
        this.stack[++this.sp] = value | 0;
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
        if (this.debug) {
            console.log('[%s] %s', this.pc - 1, ir2bc.Opcode[opcode]);
            console.log(this.stack.slice(0, this.sp + 1));
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
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            console.log(this.stack.slice(0, this.sp + 1));
        }
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
        this.push32(this.fp);
        this.push32(this.pc);
        this.push32(argc);
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
        var argc = this.pop32();
        this.pc = this.pop32();
        this.fp = this.pop32();
        this.sp = this.sp - argc;
        if (this.debug) {
            console.log('Restoring argc: %s', argc);
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
        this.push32(result);
    };
    CPU.prototype.runRet = function () {
        this.sp = this.fp;
        var argc = this.pop32();
        this.pc = this.pop32();
        this.fp = this.pop32();
        this.sp = this.sp - argc;
        if (this.debug) {
            console.log('Restoring argc: %s', argc);
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
        this.push32(this.stack[this.fp - offset - 3]);
    };
    return CPU;
})();
exports.CPU = CPU;
