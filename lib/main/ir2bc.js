var ir = require('./ir');
(function (Opcode) {
    Opcode[Opcode["NOP"] = 0] = "NOP";
    Opcode[Opcode["HALT"] = 1] = "HALT";
    Opcode[Opcode["CONST32"] = 2] = "CONST32";
    Opcode[Opcode["ADD32"] = 3] = "ADD32";
    Opcode[Opcode["SUB32"] = 4] = "SUB32";
    Opcode[Opcode["MUL32"] = 5] = "MUL32";
    Opcode[Opcode["DIV32"] = 6] = "DIV32";
    Opcode[Opcode["MOD32"] = 7] = "MOD32";
    Opcode[Opcode["RET32"] = 8] = "RET32";
    Opcode[Opcode["RET"] = 9] = "RET";
    Opcode[Opcode["CALL"] = 10] = "CALL";
    Opcode[Opcode["JP"] = 11] = "JP";
    Opcode[Opcode["JPZ"] = 12] = "JPZ";
    Opcode[Opcode["LOAD_ARG32"] = 13] = "LOAD_ARG32";
    Opcode[Opcode["PUSH32_0"] = 14] = "PUSH32_0";
    Opcode[Opcode["STORE32"] = 15] = "STORE32";
    Opcode[Opcode["LOAD_LOCAL32"] = 16] = "LOAD_LOCAL32";
})(exports.Opcode || (exports.Opcode = {}));
var Opcode = exports.Opcode;
var DynamicBuffer = (function () {
    function DynamicBuffer() {
        this.buffer = new Buffer(1024);
        this.minBufferInc = 1024;
        this.bufferOffset = 0;
    }
    DynamicBuffer.prototype.free = function () {
        return this.buffer.length - this.bufferOffset;
    };
    DynamicBuffer.prototype.grow = function (length) {
        var buffer = new Buffer(this.buffer.length + length);
        this.buffer.copy(buffer);
        this.buffer = buffer;
    };
    DynamicBuffer.prototype.write = function (buffer, offset) {
        buffer.copy(this.buffer, offset);
    };
    DynamicBuffer.prototype.append = function (buffer) {
        if (this.free() > buffer.length) {
            this.grow(buffer.length + this.minBufferInc);
        }
        buffer.copy(this.buffer, this.bufferOffset);
        this.bufferOffset += buffer.length;
    };
    DynamicBuffer.prototype.toBuffer = function () {
        return this.buffer.slice(0, this.bufferOffset);
    };
    DynamicBuffer.prototype.getCurrentOffset = function () {
        return this.bufferOffset;
    };
    return DynamicBuffer;
})();
var IrStreamWritter = (function () {
    function IrStreamWritter() {
        this.buffer = new DynamicBuffer();
    }
    IrStreamWritter.prototype.toBuffer = function () {
        return this.buffer.toBuffer();
    };
    IrStreamWritter.prototype.appendInt32 = function (value) {
        var buffer = new Buffer(IrStreamWritter.INTEGER_SIZE);
        buffer.writeInt32BE(value, 0);
        this.buffer.append(buffer);
    };
    IrStreamWritter.prototype.appendOpcode = function (opcode) {
        var buffer = new Buffer(IrStreamWritter.OPCODE_SIZE);
        buffer.writeUInt8(opcode, 0);
        this.buffer.append(buffer);
    };
    IrStreamWritter.prototype.appendAddress = function (address) {
        var buffer = new Buffer(4);
        buffer.writeInt32BE(address, 0);
        this.buffer.append(buffer);
    };
    IrStreamWritter.prototype.writeAddress = function (address, offset) {
        var buffer = new Buffer(4);
        buffer.writeInt32BE(address, 0);
        this.buffer.write(buffer, offset);
    };
    IrStreamWritter.prototype.getCurrentOffset = function () {
        return this.buffer.getCurrentOffset();
    };
    IrStreamWritter.INTEGER_SIZE = 4;
    IrStreamWritter.OPCODE_SIZE = 1;
    return IrStreamWritter;
})();
exports.IrStreamWritter = IrStreamWritter;
var Assembler = (function () {
    function Assembler() {
        this.irStreamWritter = new IrStreamWritter();
        this.labels = {};
        this.waitingForLabel = {};
    }
    Assembler.prototype.op = function (opcode) {
        if (typeof opcode === 'string') {
            this.irStreamWritter.appendOpcode(Opcode[opcode]);
        }
        else {
            this.irStreamWritter.appendOpcode(opcode);
        }
        return this;
    };
    Assembler.prototype.const_i32 = function (value) {
        return this.op(2 /* CONST32 */).i32(value);
    };
    Object.defineProperty(Assembler.prototype, "add32", {
        get: function () {
            return this.op(3 /* ADD32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "sub32", {
        get: function () {
            return this.op(4 /* SUB32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "mul32", {
        get: function () {
            return this.op(5 /* MUL32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "div32", {
        get: function () {
            return this.op(6 /* DIV32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "mod32", {
        get: function () {
            return this.op(7 /* MOD32 */);
        },
        enumerable: true,
        configurable: true
    });
    Assembler.prototype.store32 = function (offset) {
        return this.op(15 /* STORE32 */).i32(offset);
    };
    Assembler.prototype.load_local32 = function (offset) {
        return this.op(16 /* LOAD_LOCAL32 */).i32(offset);
    };
    Assembler.prototype.jp = function (address) {
        return this.op(11 /* JP */).address(address);
    };
    Assembler.prototype.jpz = function (address) {
        return this.op(12 /* JPZ */).address(address);
    };
    Assembler.prototype.call = function (address, argc) {
        return this.op(10 /* CALL */).address(address).i32(argc);
    };
    Object.defineProperty(Assembler.prototype, "halt", {
        get: function () {
            return this.op(1 /* HALT */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ret32", {
        get: function () {
            return this.op(8 /* RET32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ret", {
        get: function () {
            return this.op(9 /* RET */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "alloc32", {
        get: function () {
            return this.op(14 /* PUSH32_0 */);
        },
        enumerable: true,
        configurable: true
    });
    Assembler.prototype.load_arg32 = function (num) {
        return this.op(13 /* LOAD_ARG32 */).i32(num);
    };
    Assembler.prototype.label = function (name) {
        this.resolveLabel(name);
        return this;
    };
    Assembler.prototype.i32 = function (value) {
        this.irStreamWritter.appendInt32(value);
        return this;
    };
    Assembler.prototype.address = function (value) {
        this.writeAddress(value);
        return this;
    };
    Assembler.prototype.get = function () {
        return this.irStreamWritter.toBuffer();
    };
    Assembler.prototype.getCurrentAddress = function () {
        return this.irStreamWritter.getCurrentOffset();
    };
    Assembler.prototype.resolveLabel = function (id) {
        var _this = this;
        var address = this.getCurrentAddress();
        this.labels[id] = address;
        if (this.waitingForLabel.hasOwnProperty(id)) {
            this.waitingForLabel[id].forEach(function (offset) { return _this.irStreamWritter.writeAddress(address, offset); });
        }
    };
    Assembler.prototype.writeAddress = function (id) {
        if (this.labels.hasOwnProperty(String(id))) {
            this.irStreamWritter.appendAddress(this.labels[id]);
            delete this.waitingForLabel[id];
        }
        else {
            if (!this.waitingForLabel.hasOwnProperty(id)) {
                this.waitingForLabel[id] = [];
            }
            this.waitingForLabel[id].push(this.irStreamWritter.getCurrentOffset());
            this.irStreamWritter.appendAddress(0);
        }
    };
    return Assembler;
})();
exports.Assembler = Assembler;
var IrTranslator = (function () {
    function IrTranslator() {
        this.irStreamWritter = new IrStreamWritter();
        this.labels = {};
        this.waitingForLabel = {};
    }
    IrTranslator.prototype.toBuffer = function () {
        return this.irStreamWritter.toBuffer();
    };
    IrTranslator.prototype.getCurrentAddress = function () {
        return this.irStreamWritter.getCurrentOffset();
    };
    IrTranslator.prototype.resolveLabel = function (id) {
        var _this = this;
        var address = this.getCurrentAddress();
        this.labels[id] = address;
        if (this.waitingForLabel.hasOwnProperty(String(id))) {
            this.waitingForLabel[id].forEach(function (offset) { return _this.irStreamWritter.writeAddress(address, offset); });
        }
    };
    IrTranslator.prototype.writeAddress = function (id) {
        if (this.labels.hasOwnProperty(String(id))) {
            this.irStreamWritter.appendAddress(this.labels[id]);
            delete this.waitingForLabel[id];
        }
        else {
            if (!this.waitingForLabel.hasOwnProperty(String(id))) {
                this.waitingForLabel[id] = [];
            }
            this.waitingForLabel[id].push(this.irStreamWritter.getCurrentOffset());
            this.irStreamWritter.appendAddress(0);
        }
    };
    IrTranslator.prototype.translate = function (node) {
        if (node instanceof ir.IntegerConstant) {
            return this.translateIntegerConstant(node);
        }
        else if (node instanceof ir.Add) {
            return this.translateAdd(node);
        }
        else if (node instanceof ir.Return) {
            return this.translateReturn(node);
        }
        else if (node instanceof ir.BasicBlock) {
            return this.translateBasicBlock(node);
        }
        else {
            throw new Error('Unsupported IR node');
        }
    };
    IrTranslator.prototype.translateIntegerConstant = function (node) {
        this.irStreamWritter.appendOpcode(2 /* CONST32 */);
        this.irStreamWritter.appendInt32(node.value);
    };
    IrTranslator.prototype.translateAdd = function (node) {
        this.translate(node.left);
        this.translate(node.right);
        this.irStreamWritter.appendOpcode(3 /* ADD32 */);
    };
    IrTranslator.prototype.translateSub = function (node) {
        this.translate(node.left);
        this.translate(node.right);
        this.irStreamWritter.appendOpcode(4 /* SUB32 */);
    };
    IrTranslator.prototype.translateReturn = function (node) {
        this.translate(node.value);
        this.irStreamWritter.appendOpcode(8 /* RET32 */);
    };
    IrTranslator.prototype.translateBasicBlock = function (node) {
        var _this = this;
        node.values.forEach(function (value) { return _this.translate(value); });
        this.translate(node.terminal);
    };
    IrTranslator.prototype.translateFunc = function (node) {
        var _this = this;
        this.resolveLabel(node.id);
        node.blocks.forEach(function (block) { return _this.translate(block); });
    };
    IrTranslator.prototype.translateCall = function (node) {
        var _this = this;
        node.args.forEach(function (arg) { return _this.translate(arg); });
        this.writeAddress(node.func.id);
        this.irStreamWritter.appendOpcode(10 /* CALL */);
    };
    return IrTranslator;
})();
exports.IrTranslator = IrTranslator;
