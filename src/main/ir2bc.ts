import stream = require('stream');
import ir = require('./ir');

export enum Opcode {
    NOP,
    HALT,
    ADD,
    SUB,
    CONST,
    RET,
    CALL
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

    writeInteger(value: number) {
        var buffer = new Buffer(IrStreamWritter.INTEGER_SIZE);
        buffer.writeInt32BE(value, 0);
        this.buffer.append(buffer);
    }

    writeOpcode(opcode: Opcode) {
        var buffer = new Buffer(IrStreamWritter.OPCODE_SIZE);
        buffer.writeUInt8(opcode, 0);
        this.buffer.append(buffer);
    }

    writeAddress (address: number, offset: number) {
        offset = this.getCurrentOffset() || offset;
        var buffer = new Buffer(4);
        buffer.writeInt32BE(address, 0);
        this.buffer.write(buffer, offset);
    }

    appendAddress (address: number) {
        var buffer = new Buffer(4);
        buffer.writeInt32BE(address, 0);
        this.buffer.append(buffer);
    }

    getCurrentOffset (): number {
        return this.buffer.getCurrentOffset();
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
            this.irStreamWritter.appendAddress(0);
            if (!this.waitingForLabel.hasOwnProperty(String(id))) {
                this.waitingForLabel[id] = [];
            }
            this.waitingForLabel[id].push(this.irStreamWritter.getCurrentOffset());
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
        this.irStreamWritter.writeOpcode(Opcode.CONST);
        this.irStreamWritter.writeInteger(node.value);
    }

    translateAdd (node: ir.Add) {
        this.translate(node.left);
        this.translate(node.right);
        this.irStreamWritter.writeOpcode(Opcode.ADD);
    }

    translateSub (node: ir.Sub) {
        this.translate(node.left);
        this.translate(node.right);
        this.irStreamWritter.writeOpcode(Opcode.SUB);
    }

    translateReturn (node: ir.Return) {
        this.translate(node.value);
        this.irStreamWritter.writeOpcode(Opcode.RET);
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
        this.irStreamWritter.writeOpcode(Opcode.CALL);
    }
}
