import ir2bc = require('./ir2bc');

export class CPU {

    pc: number = 0;
    sp: number = -1;
    fp: number = 0;

    debug: boolean = false;

    stack: number[] = new Array(100);
    bytecode: Buffer;

    pop (): number {
        return this.stack[this.sp--];
    }

    push (value: number) {
        this.stack[++this.sp] = value;
    }

    readOpcode (): number {
        var value = this.bytecode.readUInt8(this.pc);
        this.pc++;
        return value;
    }

    readInt (): number {
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
            case ir2bc.Opcode.CONST:
                this.runConst();
                break;
            case ir2bc.Opcode.ADD:
                this.runAdd();
                break;
            case ir2bc.Opcode.SUB:
                this.runSub();
                break;
            case ir2bc.Opcode.MUL:
                this.runMul();
                break;
            case ir2bc.Opcode.CALL:
                this.runCall();
                break;
            case ir2bc.Opcode.RET:
                this.runRet();
                break;
            case ir2bc.Opcode.RETVOID:
                this.runRetvoid();
                break;
            case ir2bc.Opcode.JP:
                this.runJp();
                break;
            case ir2bc.Opcode.JPZ:
                this.runJpz();
                break;
            case ir2bc.Opcode.LOAD_ARG:
                this.runLoadArg();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            console.log(this.stack.slice(0, this.sp + 1));
        }
    }

    runConst () {
        var value = this.readInt();
        this.push(value);
    }

    runAdd () {
        var right = this.pop();
        var left = this.pop();
        var value = left + right;
        this.push(value);
    }

    runSub () {
        var right = this.pop();
        var left = this.pop();
        var value = left - right;
        this.push(value);
    }

    runMul () {
        var right = this.pop();
        var left = this.pop();
        var value = left * right;
        this.push(value);
    }

    runCall () {
        var address = this.readAddress();
        var argc = this.readInt();
        this.push(this.fp);
        this.push(this.pc);
        this.push(argc);
        if (this.debug) {
            console.log('Saving argc: %s', argc);
            console.log('Saving pc: %s', this.pc);
            console.log('Saving fp: %s', this.fp);
        }
        this.pc = address;
        this.fp = this.sp;
    }

    runRet () {
        var result = this.pop();
        this.sp = this.fp;
        var argc = this.pop();
        this.pc = this.pop();
        this.fp = this.pop();
        this.sp = this.sp - argc;
        if (this.debug) {
            console.log('Restoring argc: %s', argc);
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
        this.push(result);
    }

    runRetvoid () {
        this.sp = this.fp;
        var argc = this.pop();
        this.pc = this.pop();
        this.fp = this.pop();
        this.sp = this.sp - argc;
        if (this.debug) {
            console.log('Restoring argc: %s', argc);
            console.log('Restoring pc: %s', this.pc);
            console.log('Restoring fp: %s', this.fp);
        }
    }

    runJp () {
        this.pc = this.readAddress();
    }

    runJpz () {
        var dest = this.readAddress();
        if (this.pop() === 0) {
            this.pc = dest;
        }
    }

    runLoadArg () {
        var offset = this.readInt();
        this.push(this.stack[this.fp - offset - 3]);
    }
}
