import ir2bc = require('./ir2bc');

export class CPU {

    debug: boolean = false;

    private pc: number = 0;
    private sp: number = -1;
    private fp: number = 0;

    private bytecode: Buffer;
    private stack: Buffer = new Buffer(2048);

    //region Helpers
    private set32 (offset: number, value: number) {
        this.stack.writeInt32BE(value|0, offset * 4);
    }

    private get32 (offset: number) {
        return this.stack.readInt32BE(offset * 4);
    }

    private get32u (offset: number) {
        return this.stack.readUInt32BE(offset * 4);
    }

    private pop32 (): number {
        return this.get32(this.sp--);
    }

    private pop32u (): number {
        return this.get32u(this.sp--);
    }

    private push32 (value: number) {
        this.set32(++this.sp, value);
    }

    private readOpcode (): number {
        var value = this.bytecode.readUInt8(this.pc);
        this.pc++;
        return value;
    }

    private readInt32 (): number {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    }

    private readAddress (): number {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    }

    private logStack() {
        var offsets: number[] = [];
        for (var i = 0; i <= this.sp; i++) {
            offsets.push(i);
        }
        console.log(offsets.map(offset => this.get32(offset)));
    }
    //endregion

    getResult (): number {
        return this.get32(this.sp);
    }

    getResulti32u (): number {
        return this.get32u(this.sp);
    }

    run (bc: Buffer) {
        this.bytecode = bc;
        while (this.pc < this.bytecode.length) {
            var opcode = this.readOpcode();
            if (opcode === ir2bc.Opcode.HALT) {
                break;
            }
            this.runBytecode(opcode);
        }
    }

    //region Opcodes implementations
    private runBytecode (opcode: ir2bc.Opcode) {
        if (this.debug) {
            console.log('[%s] %s', this.pc - 1, ir2bc.Opcode[opcode]);
        }
        switch (opcode) {
            case ir2bc.Opcode.CONST32:
                this.runConst32();
                break;
            case ir2bc.Opcode.ADD32:
                this.runAdd32();
                break;
            case ir2bc.Opcode.SUB32:
                this.runSub32();
                break;
            case ir2bc.Opcode.MUL32:
                this.runMul32();
                break;
            case ir2bc.Opcode.DIV32:
                this.runDiv32();
                break;
            case ir2bc.Opcode.DIV32U:
                this.runDiv32u();
                break;
            case ir2bc.Opcode.MOD32:
                this.runMod32();
                break;
            case ir2bc.Opcode.MOD32U:
                this.runMod32u();
                break;
            case ir2bc.Opcode.CALL:
                this.runCall();
                break;
            case ir2bc.Opcode.RET32:
                this.runRet32();
                break;
            case ir2bc.Opcode.RET:
                this.runRet();
                break;
            case ir2bc.Opcode.JP:
                this.runJp();
                break;
            case ir2bc.Opcode.JPZ:
                this.runJpz();
                break;
            case ir2bc.Opcode.JPNZ:
                this.runJpnz();
                break;
            case ir2bc.Opcode.LOAD_ARG32:
                this.runLoadArg32();
                break;
            case ir2bc.Opcode.PUSH32_0:
                this.runPush32_0();
                break;
            case ir2bc.Opcode.STORE32:
                this.runStore32();
                break;
            case ir2bc.Opcode.LOAD_LOCAL32:
                this.runLoadLocal32();
                break;
            case ir2bc.Opcode.AND32:
                this.runAnd32();
                break;
            case ir2bc.Opcode.OR32:
                this.runOr32();
                break;
            case ir2bc.Opcode.XOR32:
                this.runXor32();
                break;
            case ir2bc.Opcode.SHL32:
                this.runShl32();
                break;
            case ir2bc.Opcode.SHR32:
                this.runShr32();
                break;
            case ir2bc.Opcode.SHR32U:
                this.runShr32u();
                break;
            case ir2bc.Opcode.EQ32:
                this.runEq32();
                break;
            case ir2bc.Opcode.NE32:
                this.runNe32();
                break;
            case ir2bc.Opcode.GT32:
                this.runGt32();
                break;
            case ir2bc.Opcode.GT32U:
                this.runGt32u();
                break;
            case ir2bc.Opcode.GE32:
                this.runGe32();
                break;
            case ir2bc.Opcode.GE32U:
                this.runGe32u();
                break;
            case ir2bc.Opcode.NOT32:
                this.runNot32();
                break;
            case ir2bc.Opcode.BNOT32:
                this.runBnot32();
                break;
            case ir2bc.Opcode.NEG32:
                this.runNeg32();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            this.logStack();
        }
    }

    private runLoadLocal32 () {
        var offset = this.readInt32();
        if (this.debug) {
            console.log('Offset = %s', offset);
        }
        this.push32(this.get32(this.fp + offset));
    }

    private runPush32_0 () {
        this.push32(0);
    }

    private runStore32 () {
        var offset = this.readInt32();
        if (this.debug) {
            console.log('Offset = %s', offset);
        }
        this.set32(this.fp + offset, this.pop32());
    }

    private runConst32 () {
        var value = this.readInt32();
        if (this.debug) {
            console.log('Value = %s', value);
        }
        this.push32(value);
    }

    private runAdd32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left + right;
        this.push32(value);
    }

    private runSub32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left - right;
        this.push32(value);
    }

    private runMul32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left * right;
        this.push32(value);
    }

    private runDiv32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left / right;
        this.push32(value);
    }

    private runDiv32u () {
        var right = this.pop32u();
        var left = this.pop32u();
        var value = left / right;
        this.push32(value);
    }

    private runMod32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left % right;
        this.push32(value);
    }

    private runMod32u () {
        var right = this.pop32u();
        var left = this.pop32u();
        var value = left % right;
        this.push32(value);
    }

    private runAnd32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left & right);
    }

    private runOr32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left | right);
    }

    private runXor32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left ^ right);
    }

    private runShl32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left << right);
    }

    private runShr32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left >> right);
    }

    private runShr32u () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left >>> right);
    }

    private runEq32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left === right ? 1 : 0);
    }

    private runNe32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left !== right ? 1 : 0);
    }

    private runGt32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left > right ? 1 : 0);
    }

    private runGt32u () {
        var right = this.pop32u();
        var left = this.pop32u();
        this.push32(left > right ? 1 : 0);
    }

    private runGe32 () {
        var right = this.pop32();
        var left = this.pop32();
        this.push32(left >= right ? 1 : 0);
    }

    private runGe32u () {
        var right = this.pop32u();
        var left = this.pop32u();
        this.push32(left >= right ? 1 : 0);
    }

    private runNot32 () {
        var operand = this.pop32u();
        this.push32(operand === 0 ? 1 : 0);
    }

    private runBnot32 () {
        var operand = this.pop32u();
        this.push32(~operand);
    }

    private runNeg32 () {
        var operand = this.pop32u();
        this.push32(-operand);
    }

    private runCall () {
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
    }

    private runRet32 () {
        var result = this.pop32();
        this.runRet();
        this.push32(result);
    }

    private runRet () {
        this.sp = this.fp;
        this.pc = this.pop32();
        this.fp = this.pop32();
        this.sp = this.sp - this.pop32() - 1;
        if (this.debug) {
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
    }

    private runJp () {
        this.pc = this.readAddress();
        if (this.debug) {
            console.log('Relative address = %s', address);
        }
    }

    private runJpz () {
        var dest = this.readAddress();
        if (this.debug) {
            console.log('Relative address = %s', dest);
        }
        if (this.pop32() === 0) {
            this.pc = dest;
        }
    }

    private runJpnz () {
        var dest = this.readAddress();
        if (this.debug) {
            console.log('Relative address = %s', dest);
        }
        if (this.pop32() !== 0) {
            this.pc = dest;
        }
    }

    private runLoadArg32 () {
        var offset = this.readInt32();
        if (this.debug) {
            console.log('Offset = %s', offset);
        }
        this.push32(this.get32(this.fp - offset - 3));
    }
    //endregion
}
