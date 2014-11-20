var ir2bc = require('./ir2bc');
var CPU = (function () {
    function CPU() {
        this.debug = false;
        this.pc = 0;
        this.sp = -1;
        this.fp = 0;
        this.stack = new Buffer(2048);
    }
    //region Helpers
    CPU.prototype.set32 = function (offset, value) {
        this.stack.writeInt32BE(value | 0, offset * 4);
    };
    CPU.prototype.get32 = function (offset) {
        return this.stack.readInt32BE(offset * 4);
    };
    CPU.prototype.get32u = function (offset) {
        return this.stack.readUInt32BE(offset * 4);
    };
    CPU.prototype.pop32 = function () {
        return this.get32(this.sp--);
    };
    CPU.prototype.pop32u = function () {
        return this.get32u(this.sp--);
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
    CPU.prototype.logStack = function () {
        var _this = this;
        var offsets = [];
        for (var i = 0; i <= this.sp; i++) {
            offsets.push(i);
        }
        console.log(offsets.map(function (offset) { return _this.get32(offset); }));
    };
    //endregion
    CPU.prototype.getResult = function () {
        return this.get32(this.sp);
    };
    CPU.prototype.getResulti32u = function () {
        return this.get32u(this.sp);
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
            case 15 /* LOAD_ARG32 */:
                this.runLoadArg32();
                break;
            case 16 /* PUSH32_0 */:
                this.runPush32_0();
                break;
            case 17 /* STORE32 */:
                this.runStore32();
                break;
            case 18 /* LOAD_LOCAL32 */:
                this.runLoadLocal32();
                break;
            case 19 /* AND32 */:
                this.runAnd32();
                break;
            case 20 /* OR32 */:
                this.runOr32();
                break;
            case 21 /* XOR32 */:
                this.runXor32();
                break;
            case 22 /* SHL32 */:
                this.runShl32();
                break;
            case 23 /* SHR32 */:
                this.runShr32();
                break;
            case 24 /* SHR32U */:
                this.runShr32u();
                break;
            case 25 /* EQ32 */:
                this.runEq32();
                break;
            case 26 /* NE32 */:
                this.runNe32();
                break;
            case 27 /* GT32 */:
                this.runGt32();
                break;
            case 28 /* GT32U */:
                this.runGt32u();
                break;
            case 29 /* GE32 */:
                this.runGe32();
                break;
            case 30 /* GE32U */:
                this.runGe32u();
                break;
            case 31 /* NOT32 */:
                this.runNot32();
                break;
            case 32 /* BNOT32 */:
                this.runBnot32();
                break;
            case 33 /* NEG32 */:
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
