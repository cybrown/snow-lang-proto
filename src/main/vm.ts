import ir2bc = require('./ir2bc');

export class CPU {

    pc: number = 0;
    sp: number = -1;
    fp: number = 0;

    debug: boolean = false;

    stack: number[] = [];
    bytecode: Buffer;

    pop32 (): number {
        return this.stack[this.sp--]|0;
    }

    push32 (value: number) {
        this.stack[++this.sp] = value|0;
    }

    readOpcode (): number {
        var value = this.bytecode.readUInt8(this.pc);
        this.pc++;
        return value;
    }

    readInt32 (): number {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    }

    readAddress (): number {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    }

    getResult (): number {
        return this.stack[this.sp];
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

    runBytecode (opcode: ir2bc.Opcode) {
        if (this.debug) {
            console.log('[%s] %s', this.pc - 1, ir2bc.Opcode[opcode]);
            console.log(this.stack.slice(0, this.sp + 1));
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
            case ir2bc.Opcode.MOD32:
                this.runMod32();
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
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            console.log(this.stack.slice(0, this.sp + 1));
        }
    }

    runLoadLocal32 () {
        var offset = this.readInt32();
        this.push32(this.stack[this.fp + offset]);
    }

    runPush32_0 () {
        this.push32(0);
    }

    runStore32 () {
        var offset = this.readInt32();
        this.stack[this.fp + offset] = this.pop32();
    }

    runConst32 () {
        var value = this.readInt32();
        this.push32(value);
    }

    runAdd32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left + right;
        this.push32(value);
    }

    runSub32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left - right;
        this.push32(value);
    }

    runMul32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left * right;
        this.push32(value);
    }

    runDiv32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left / right;
        this.push32(value);
    }

    runMod32 () {
        var right = this.pop32();
        var left = this.pop32();
        var value = left % right;
        this.push32(value);
    }

    runCall () {
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
    }

    runRet32 () {
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
    }

    runRet () {
        this.sp = this.fp;
        this.pc = this.pop32();
        this.fp = this.pop32();
        this.sp = this.sp - this.pop32() - 1;
        if (this.debug) {
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
    }

    runJp () {
        this.pc = this.readAddress();
    }

    runJpz () {
        var dest = this.readAddress();
        if (this.pop32() === 0) {
            this.pc = dest;
        }
    }

    runLoadArg32 () {
        var offset = this.readInt32();
        this.push32(this.stack[this.fp - offset - 3]);
    }
}
