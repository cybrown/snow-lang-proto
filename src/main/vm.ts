import ir2bc = require('./ir2bc');

export class CPU {

    pc: number = 0;
    sp: number = -1;
    fp: number = 0;

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
            case ir2bc.Opcode.CALL:
                this.runCall();
                break;
            case ir2bc.Opcode.RET:
                this.runRet();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + this.pc);
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

    runCall () {
        var address = this.readAddress();
        this.push(this.fp);
        this.push(this.pc);
        this.pc = address;
        this.fp = this.sp;
    }

    runRet () {
        var result = this.pop();
        this.sp = this.fp;
        this.pc = this.pop();
        this.fp = this.pop();
        this.push(result);
    }
}
