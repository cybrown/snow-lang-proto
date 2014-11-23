import stream = require('stream');
import ir = require('./ir');

export enum Opcode {
    NOP,
    HALT,
    CONST32,
    ADD32,
    SUB32,
    MUL32,
    DIV32,
    DIV32U,
    MOD32,
    MOD32U,
    RET32,
    RET,
    CALL,
    JP,
    JPZ,
    JPNZ,
    LOAD_ARG32,
    PUSH32_0,
    STORE32,
    LOAD_LOCAL32,
    AND32,
    OR32,
    XOR32,
    SHL32,
    SHR32,
    SHR32U,
    EQ32,
    NE32,
    GT32,
    GT32U,
    GE32,
    GE32U,
    NOT32,
    BNOT32,
    NEG32
}

class DynamicBuffer {

    private buffer = new Buffer(1024);
    private minBufferInc = 1024;
    private bufferOffset = 0;

    private free (): number {
        return this.buffer.length - this.bufferOffset;
    }

    private grow (length: number) {
        var buffer = new Buffer(this.buffer.length + length);
        this.buffer.copy(buffer);
        this.buffer = buffer;
    }

    write (buffer: Buffer, offset: number) {
        buffer.copy(this.buffer, offset);
    }

    append (buffer: Buffer) {
        if (this.free() > buffer.length) {
            this.grow(buffer.length + this.minBufferInc);
        }
        buffer.copy(this.buffer, this.bufferOffset);
        this.bufferOffset += buffer.length;
    }

    toBuffer (): Buffer {
        return this.buffer.slice(0, this.bufferOffset);
    }

    getCurrentOffset (): number {
        return this.bufferOffset;
    }
}

export class IrStreamWritter {

    static INTEGER_SIZE = 4;
    static OPCODE_SIZE = 1;

    private buffer = new DynamicBuffer();

    toBuffer () {
        return this.buffer.toBuffer();
    }

    appendInt32(value: number) {
        var buffer = new Buffer(IrStreamWritter.INTEGER_SIZE);
        buffer.writeInt32BE(value, 0);
        this.buffer.append(buffer);
    }

    appendUInt32(value: number) {
        var buffer = new Buffer(IrStreamWritter.INTEGER_SIZE);
        buffer.writeUInt32BE(value, 0);
        this.buffer.append(buffer);
    }

    appendOpcode(opcode: Opcode) {
        var buffer = new Buffer(IrStreamWritter.OPCODE_SIZE);
        buffer.writeUInt8(opcode, 0);
        this.buffer.append(buffer);
    }

    appendAddress (address: number) {
        var buffer = new Buffer(4);
        buffer.writeInt32BE(address, 0);
        this.buffer.append(buffer);
    }

    writeAddress (address: number, offset: number) {
        var buffer = new Buffer(4);
        buffer.writeInt32BE(address, 0);
        this.buffer.write(buffer, offset);
    }

    getCurrentOffset (): number {
        return this.buffer.getCurrentOffset();
    }
}

export class Assembler {

    private irStreamWritter = new IrStreamWritter();

    op (opcode: string): Assembler;
    op (opcode: Opcode): Assembler;
    op (opcode: any): Assembler {
        if (typeof opcode === 'string') {
            this.irStreamWritter.appendOpcode(<Opcode> (<any>Opcode)[opcode]);
        } else {
            this.irStreamWritter.appendOpcode(<Opcode> opcode);
        }
        return this;
    }

    const_p (value: string): Assembler {
        return this.op(Opcode.CONST32).address(value);
    }

    const_i32 (value: number): Assembler {
        return this.op(Opcode.CONST32).i32(value);
    }

    const_u32 (value: number): Assembler {
        return this.op(Opcode.CONST32).u32(value);
    }

    get add32 () {
        return this.op(Opcode.ADD32);
    }

    get sub32 () {
        return this.op(Opcode.SUB32);
    }

    get mul32 () {
        return this.op(Opcode.MUL32);
    }

    get div32 () {
        return this.op(Opcode.DIV32);
    }

    get div32u () {
        return this.op(Opcode.DIV32U);
    }

    get mod32 () {
        return this.op(Opcode.MOD32);
    }

    get mod32u () {
        return this.op(Opcode.MOD32U);
    }

    store32 (offset: number) {
        return this.op(Opcode.STORE32).i32(offset);
    }

    load_local32 (offset: number) {
        return this.op(Opcode.LOAD_LOCAL32).i32(offset);
    }

    jp (address: string) {
        return this.op(Opcode.JP).address(address);
    }

    jpz (address: string) {
        return this.op(Opcode.JPZ).address(address);
    }

    jpnz (address: string) {
        return this.op(Opcode.JPNZ).address(address);
    }

    call (argc: number) {
        return this.op(Opcode.CALL).i32(argc);
    }

    get and32 () {
        return this.op(Opcode.AND32);
    }

    get or32 () {
        return this.op(Opcode.OR32);
    }

    get xor32 () {
        return this.op(Opcode.XOR32);
    }

    get shl32 () {
        return this.op(Opcode.SHL32);
    }

    get shr32 () {
        return this.op(Opcode.SHR32);
    }

    get shr32u () {
        return this.op(Opcode.SHR32U);
    }

    get eq32 () {
        return this.op(Opcode.EQ32);
    }

    get ne32 () {
        return this.op(Opcode.NE32);
    }

    get gt32 () {
        return this.op(Opcode.GT32);
    }

    get gt32u () {
        return this.op(Opcode.GT32U);
    }

    get ge32 () {
        return this.op(Opcode.GE32);
    }

    get ge32u () {
        return this.op(Opcode.GE32U);
    }

    get not32 () {
        return this.op(Opcode.NOT32);
    }

    get bnot32 () {
        return this.op(Opcode.BNOT32);
    }

    get neg32 () {
        return this.op(Opcode.NEG32);
    }

    get halt () {
        return this.op(Opcode.HALT);
    }

    get ret32 () {
        return this.op(Opcode.RET32);
    }

    get ret () {
        return this.op(Opcode.RET);
    }

    get alloc32 () {
        return this.op(Opcode.PUSH32_0);
    }

    load_arg32 (num: number) {
        return this.op(Opcode.LOAD_ARG32).i32(num);
    }

    label (name: string): Assembler {
        this.resolveLabel(name);
        return this;
    }

    private i32 (value: number): Assembler {
        this.irStreamWritter.appendInt32(value);
        return this;
    }

    private u32 (value: number): Assembler {
        this.irStreamWritter.appendUInt32(value);
        return this;
    }

    private address (value: string, isRelativeAddress: boolean = false): Assembler {
        this.writeAddress(value, isRelativeAddress);
        return this;
    }

    get (): Buffer {
        return this.irStreamWritter.toBuffer();
    }

    private getCurrentAddress () {
        return this.irStreamWritter.getCurrentOffset();
    }

    private labels: {[key: string]: number} = {};
    private waitingForLabel: {[key: string]: number[]} = {};
    private waitingForRelativeLabel: {[key: string]: number[]} = {};

    private resolveLabel (id: string) {
        var address = this.getCurrentAddress();
        this.labels[id] = address;
        if (this.waitingForLabel.hasOwnProperty(id)) {
            this.waitingForLabel[id].forEach(offset => this.irStreamWritter.writeAddress(address, offset));
        }
        if (this.waitingForRelativeLabel.hasOwnProperty(id)) {
            this.waitingForRelativeLabel[id].forEach(offset => this.irStreamWritter.writeAddress(address - offset, offset));
        }
    }

    private writeAddress (id: string, isRelativeAddress: boolean = false) {
        var obj = isRelativeAddress ? this.waitingForRelativeLabel : this.waitingForLabel;
        if (this.labels.hasOwnProperty(String(id))) {
            if (isRelativeAddress) {
                this.irStreamWritter.appendAddress(this.labels[id] - this.irStreamWritter.getCurrentOffset());
            } else {
                this.irStreamWritter.appendAddress(this.labels[id]);
            }
            delete obj[id];
        } else {
            if (!obj.hasOwnProperty(id)) {
                obj[id] = [];
            }
            obj[id].push(this.irStreamWritter.getCurrentOffset());
            this.irStreamWritter.appendAddress(0);
        }
    }
}

export class IrTranslator {

    private irStreamWritter = new IrStreamWritter();

    toBuffer () {
        return this.irStreamWritter.toBuffer();
    }

    private getCurrentAddress () {
        return this.irStreamWritter.getCurrentOffset();
    }

    private labels: {[key: number]: number} = {};
    private waitingForLabel: {[key: number]: number[]} = {};

    private resolveLabel (id: number) {
        var address = this.getCurrentAddress();
        this.labels[id] = address;
        if (this.waitingForLabel.hasOwnProperty(String(id))) {
            this.waitingForLabel[id].forEach(offset => this.irStreamWritter.writeAddress(address, offset));
        }
    }

    private writeAddress (id: number) {
        if (this.labels.hasOwnProperty(String(id))) {
            this.irStreamWritter.appendAddress(this.labels[id]);
            delete this.waitingForLabel[id];
        } else {
            if (!this.waitingForLabel.hasOwnProperty(String(id))) {
                this.waitingForLabel[id] = [];
            }
            this.waitingForLabel[id].push(this.irStreamWritter.getCurrentOffset());
            this.irStreamWritter.appendAddress(0);
        }
    }

    translate (node: ir.IrNode) {
        if (node instanceof ir.IntegerConstant) {
            return this.translateIntegerConstant(<ir.IntegerConstant> node);
        } else if (node instanceof ir.Add) {
            return this.translateAdd(<ir.Add> node);
        } else if (node instanceof ir.Return) {
            return this.translateReturn(<ir.Return> node);
        } else if (node instanceof ir.BasicBlock) {
            return this.translateBasicBlock(<ir.BasicBlock> node);
        } else {
            throw new Error('Unsupported IR node');
        }
    }

    translateIntegerConstant (node: ir.IntegerConstant) {
        this.irStreamWritter.appendOpcode(Opcode.CONST32);
        this.irStreamWritter.appendInt32(node.value);
    }

    translateAdd (node: ir.Add) {
        this.translate(node.left);
        this.translate(node.right);
        this.irStreamWritter.appendOpcode(Opcode.ADD32);
    }

    translateSub (node: ir.Sub) {
        this.translate(node.left);
        this.translate(node.right);
        this.irStreamWritter.appendOpcode(Opcode.SUB32);
    }

    translateReturn (node: ir.Return) {
        this.translate(node.value);
        this.irStreamWritter.appendOpcode(Opcode.RET32);
    }

    translateBasicBlock (node: ir.BasicBlock) {
        node.values.forEach(value => this.translate(value));
        this.translate(node.terminal);
    }

    translateFunc (node: ir.Func) {
        this.resolveLabel(node.id);
        node.blocks.forEach(block => this.translate(block));
    }

    translateCall (node: ir.Call) {
        node.args.forEach(arg => this.translate(arg));
        this.writeAddress(node.func.id);
        this.irStreamWritter.appendOpcode(Opcode.CALL);
    }
}
