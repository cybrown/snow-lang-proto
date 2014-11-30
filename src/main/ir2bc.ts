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
    JR,
    JRZ,
    JRNZ,
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

    private getCurrentAddress () {
        return this.irStreamWritter.getCurrentOffset();
    }

    private labels: {[key: string]: number} = {};
    private waitingForLabel: {[key: string]: number[]} = {};
    private waitingForRelativeLabel: {[key: string]: number[]} = {};

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

    resolveLabel (id: string) {
        var address = this.getCurrentAddress();
        this.labels[id] = address;
        if (this.waitingForLabel.hasOwnProperty(id)) {
            this.waitingForLabel[id].forEach(offset => this.irStreamWritter.writeAddress(address, offset));
        }
        if (this.waitingForRelativeLabel.hasOwnProperty(id)) {
            this.waitingForRelativeLabel[id].forEach(offset => this.irStreamWritter.writeAddress(address - offset, offset));
        }
    }

    i32 (value: number): Assembler {
        this.irStreamWritter.appendInt32(value);
        return this;
    }

    u32 (value: number): Assembler {
        this.irStreamWritter.appendUInt32(value);
        return this;
    }

    address (value: string, isRelativeAddress: boolean = false): Assembler {
        this.writeAddress(value, isRelativeAddress);
        return this;
    }

    getBuffer (): Buffer {
        return this.irStreamWritter.toBuffer();
    }
}

export class AssemblerHelper {

    private assembler = new Assembler();

    const_p (value: string): AssemblerHelper {
        this.assembler.op(Opcode.CONST32).address(value);
        return this;
    }

    const_i32 (value: number): AssemblerHelper {
        this.assembler.op(Opcode.CONST32).i32(value);
        return this;
    }

    const_u32 (value: number): AssemblerHelper {
        this.assembler.op(Opcode.CONST32).u32(value);
        return this;
    }

    get add32 (): AssemblerHelper {
        this.assembler.op(Opcode.ADD32);
        return this;
    }

    get sub32 (): AssemblerHelper {
        this.assembler.op(Opcode.SUB32);
        return this;
    }

    get mul32 (): AssemblerHelper {
        this.assembler.op(Opcode.MUL32);
        return this;
    }

    get div32 (): AssemblerHelper {
        this.assembler.op(Opcode.DIV32);
        return this;
    }

    get div32u (): AssemblerHelper {
        this.assembler.op(Opcode.DIV32U);
        return this;
    }

    get mod32 (): AssemblerHelper {
        this.assembler.op(Opcode.MOD32);
        return this;
    }

    get mod32u (): AssemblerHelper {
        this.assembler.op(Opcode.MOD32U);
        return this;
    }

    store32 (offset: number): AssemblerHelper {
        this.assembler.op(Opcode.STORE32).i32(offset);
        return this;
    }

    load_local32 (offset: number): AssemblerHelper {
        this.assembler.op(Opcode.LOAD_LOCAL32).i32(offset);
        return this;
    }

    jp (address: string): AssemblerHelper {
        this.assembler.op(Opcode.JP).address(address);
        return this;
    }

    jpz (address: string): AssemblerHelper {
        this.assembler.op(Opcode.JPZ).address(address);
        return this;
    }

    jpnz (address: string): AssemblerHelper {
        this.assembler.op(Opcode.JPNZ).address(address);
        return this;
    }

    jr (address: string): AssemblerHelper {
        this.assembler.op(Opcode.JR).address(address, true);
        return this;
    }

    jrz (address: string): AssemblerHelper {
        this.assembler.op(Opcode.JRZ).address(address, true);
        return this;
    }

    jrnz (address: string): AssemblerHelper {
        this.assembler.op(Opcode.JRNZ).address(address, true);
        return this;
    }

    call (argc: number): AssemblerHelper {
        this.assembler.op(Opcode.CALL).i32(argc);
        return this;
    }

    get and32 (): AssemblerHelper {
        this.assembler.op(Opcode.AND32);
        return this;
    }

    get or32 (): AssemblerHelper {
        this.assembler.op(Opcode.OR32);
        return this;
    }

    get xor32 (): AssemblerHelper {
        this.assembler.op(Opcode.XOR32);
        return this;
    }

    get shl32 (): AssemblerHelper {
        this.assembler.op(Opcode.SHL32);
        return this;
    }

    get shr32 (): AssemblerHelper {
        this.assembler.op(Opcode.SHR32);
        return this;
    }

    get shr32u (): AssemblerHelper {
        this.assembler.op(Opcode.SHR32U);
        return this;
    }

    get eq32 (): AssemblerHelper {
        this.assembler.op(Opcode.EQ32);
        return this;
    }

    get ne32 (): AssemblerHelper {
        this.assembler.op(Opcode.NE32);
        return this;
    }

    get gt32 (): AssemblerHelper {
        this.assembler.op(Opcode.GT32);
        return this;
    }

    get gt32u (): AssemblerHelper {
        this.assembler.op(Opcode.GT32U);
        return this;
    }

    get ge32 (): AssemblerHelper {
        this.assembler.op(Opcode.GE32);
        return this;
    }

    get ge32u (): AssemblerHelper {
        this.assembler.op(Opcode.GE32U);
        return this;
    }

    get not32 (): AssemblerHelper {
        this.assembler.op(Opcode.NOT32);
        return this;
    }

    get bnot32 (): AssemblerHelper {
        this.assembler.op(Opcode.BNOT32);
        return this;
    }

    get neg32 (): AssemblerHelper {
        this.assembler.op(Opcode.NEG32);
        return this;
    }

    get halt (): AssemblerHelper {
        this.assembler.op(Opcode.HALT);
        return this;
    }

    get ret32 (): AssemblerHelper {
        this.assembler.op(Opcode.RET32);
        return this;
    }

    get ret (): AssemblerHelper {
        this.assembler.op(Opcode.RET);
        return this;
    }

    get alloc32 (): AssemblerHelper {
        this.assembler.op(Opcode.PUSH32_0);
        return this;
    }

    load_arg32 (num: number): AssemblerHelper {
        this.assembler.op(Opcode.LOAD_ARG32).i32(num);
        return this;
    }

    label (name: string): AssemblerHelper {
        this.assembler.resolveLabel(name);
        return this;
    }

    get (): Buffer {
        return this.assembler.getBuffer();
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
        } else if (node instanceof ir.ReturnValue) {
            return this.translateReturnValue(<ir.ReturnValue> node);
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

    translateReturnValue (node: ir.ReturnValue) {
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
