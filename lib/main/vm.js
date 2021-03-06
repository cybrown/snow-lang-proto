var ir2bc = require('./ir2bc');
var Memory = (function () {
    function Memory() {
        this.memory = new Buffer(2048);
    }
    Memory.prototype.set32 = function (offset, value) {
        this.memory.writeInt32BE(value | 0, offset * 4);
    };
    Memory.prototype.get32 = function (offset) {
        return this.memory.readInt32BE(offset * 4);
    };
    Memory.prototype.get32u = function (offset) {
        return this.memory.readUInt32BE(offset * 4);
    };
    return Memory;
})();
exports.Memory = Memory;
var CPU = (function () {
    function CPU() {
        this.debug = false;
        this.pc = 0;
        this.sp = -1;
        this.fp = 0;
        this._memory = new Memory();
    }
    Object.defineProperty(CPU.prototype, "memory", {
        get: function () {
            return this._memory;
        },
        enumerable: true,
        configurable: true
    });
    //region Helpers
    CPU.prototype.pop32 = function () {
        return this._memory.get32(this.sp--);
    };
    CPU.prototype.pop32u = function () {
        return this._memory.get32u(this.sp--);
    };
    CPU.prototype.push32 = function (value) {
        this._memory.set32(++this.sp, value);
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
    CPU.prototype.logStack = function () {
        var _this = this;
        var offsets = [];
        for (var i = 0; i <= this.sp; i++) {
            offsets.push(i);
        }
        console.log(offsets.map(function (offset) { return _this._memory.get32(offset); }));
    };
    //endregion
    CPU.prototype.getResult = function () {
        return this._memory.get32(this.sp);
    };
    CPU.prototype.getResulti32u = function () {
        return this._memory.get32u(this.sp);
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
    //region Opcodes implementations
    CPU.prototype.runBytecode = function (opcode) {
        if (this.debug) {
            console.log('[%s] %s', this.pc - 1, ir2bc.Opcode[opcode]);
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
            case 7 /* DIV32U */:
                this.runDiv32u();
                break;
            case 8 /* MOD32 */:
                this.runMod32();
                break;
            case 9 /* MOD32U */:
                this.runMod32u();
                break;
            case 12 /* CALL */:
                this.runCall();
                break;
            case 10 /* RET32 */:
                this.runRet32();
                break;
            case 11 /* RET */:
                this.runRet();
                break;
            case 13 /* JP */:
                this.runJp();
                break;
            case 14 /* JPZ */:
                this.runJpz();
                break;
            case 15 /* JPNZ */:
                this.runJpnz();
                break;
            case 16 /* JR */:
                this.runJr();
                break;
            case 17 /* JRZ */:
                this.runJrz();
                break;
            case 18 /* JRNZ */:
                this.runJrnz();
                break;
            case 19 /* LOAD_ARG32 */:
                this.runLoadArg32();
                break;
            case 20 /* PUSH32_0 */:
                this.runPush32_0();
                break;
            case 21 /* STORE32 */:
                this.runStore32();
                break;
            case 22 /* LOAD_LOCAL32 */:
                this.runLoadLocal32();
                break;
            case 23 /* AND32 */:
                this.runAnd32();
                break;
            case 24 /* OR32 */:
                this.runOr32();
                break;
            case 25 /* XOR32 */:
                this.runXor32();
                break;
            case 26 /* SHL32 */:
                this.runShl32();
                break;
            case 27 /* SHR32 */:
                this.runShr32();
                break;
            case 28 /* SHR32U */:
                this.runShr32u();
                break;
            case 29 /* EQ32 */:
                this.runEq32();
                break;
            case 30 /* NE32 */:
                this.runNe32();
                break;
            case 31 /* GT32 */:
                this.runGt32();
                break;
            case 32 /* GT32U */:
                this.runGt32u();
                break;
            case 33 /* GE32 */:
                this.runGe32();
                break;
            case 34 /* GE32U */:
                this.runGe32u();
                break;
            case 35 /* NOT32 */:
                this.runNot32();
                break;
            case 36 /* BNOT32 */:
                this.runBnot32();
                break;
            case 37 /* NEG32 */:
                this.runNeg32();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            this.logStack();
        }
    };
    CPU.prototype.runLoadLocal32 = function () {
        var offset = this.readInt32();
        if (this.debug) {
            console.log('Offset = %s', offset);
        }
        this.push32(this._memory.get32(this.fp + offset));
    };
    CPU.prototype.runPush32_0 = function () {
        this.push32(0);
    };
    CPU.prototype.runStore32 = function () {
        var offset = this.readInt32();
        if (this.debug) {
            console.log('Offset = %s', offset);
        }
        this._memory.set32(this.fp + offset, this.pop32());
    };
    CPU.prototype.runConst32 = function () {
        var value = this.readInt32();
        if (this.debug) {
            console.log('Value = %s', value);
        }
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
    CPU.prototype.runDiv32u = function () {
        var right = this.pop32u();
        var left = this.pop32u();
        var value = left / right;
        this.push32(value);
    };
    CPU.prototype.runMod32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left % right;
        this.push32(value);
    };
    CPU.prototype.runMod32u = function () {
        var right = this.pop32u();
        var left = this.pop32u();
        var value = left % right;
        this.push32(value);
    };
    CPU.prototype.runAnd32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left & right);
    };
    CPU.prototype.runOr32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left | right);
    };
    CPU.prototype.runXor32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left ^ right);
    };
    CPU.prototype.runShl32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left << right);
    };
    CPU.prototype.runShr32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left >> right);
    };
    CPU.prototype.runShr32u = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left >>> right);
    };
    CPU.prototype.runEq32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left === right ? 1 : 0);
    };
    CPU.prototype.runNe32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left !== right ? 1 : 0);
    };
    CPU.prototype.runGt32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left > right ? 1 : 0);
    };
    CPU.prototype.runGt32u = function () {
        var right = this.pop32u();
        var left = this.pop32u();
        this.push32(left > right ? 1 : 0);
    };
    CPU.prototype.runGe32 = function () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left >= right ? 1 : 0);
    };
    CPU.prototype.runGe32u = function () {
        var right = this.pop32u();
        var left = this.pop32u();
        this.push32(left >= right ? 1 : 0);
    };
    CPU.prototype.runNot32 = function () {
        var operand = this.pop32u();
        this.push32(operand === 0 ? 1 : 0);
    };
    CPU.prototype.runBnot32 = function () {
        var operand = this.pop32u();
        this.push32(~operand);
    };
    CPU.prototype.runNeg32 = function () {
        var operand = this.pop32u();
        this.push32(-operand);
    };
    CPU.prototype.runCall = function () {
        var address = this.pop32u();
        var argc = this.readInt32();
        if (this.debug) {
            console.log('Address = %s', address);
            console.log('Argc = %s', argc);
        }
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
        this.runRet();
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
        var address = this.readAddress();
        if (this.debug) {
            console.log('Absolute address = %s', address);
        }
        this.pc = address;
    };
    CPU.prototype.runJpz = function () {
        var dest = this.readAddress();
        if (this.debug) {
            console.log('Absolute address = %s', dest);
        }
        if (this.pop32() === 0) {
            this.pc = dest;
        }
    };
    CPU.prototype.runJpnz = function () {
        var dest = this.readAddress();
        if (this.debug) {
            console.log('Absolute address = %s', dest);
        }
        if (this.pop32() !== 0) {
            this.pc = dest;
        }
    };
    CPU.prototype.runJr = function () {
        var address = this.readAddress();
        if (this.debug) {
            console.log('Relative address = %s', address);
        }
        this.pc += address - 4;
    };
    CPU.prototype.runJrz = function () {
        var dest = this.readAddress();
        if (this.debug) {
            console.log('Relative address = %s', dest);
        }
        if (this.pop32() === 0) {
            this.pc += dest - 4;
        }
    };
    CPU.prototype.runJrnz = function () {
        var dest = this.readAddress();
        if (this.debug) {
            console.log('Relative address = %s', dest);
        }
        if (this.pop32() !== 0) {
            this.pc += dest - 4;
        }
    };
    CPU.prototype.runLoadArg32 = function () {
        var offset = this.readInt32();
        if (this.debug) {
            console.log('Offset = %s', offset);
        }
        this.push32(this._memory.get32(this.fp - offset - 3));
    };
    return CPU;
})();
exports.CPU = CPU;
