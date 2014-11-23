var ir = require('./ir');
(function (Opcode) {
    Opcode[Opcode["NOP"] = 0] = "NOP";
    Opcode[Opcode["HALT"] = 1] = "HALT";
    Opcode[Opcode["CONST32"] = 2] = "CONST32";
    Opcode[Opcode["ADD32"] = 3] = "ADD32";
    Opcode[Opcode["SUB32"] = 4] = "SUB32";
    Opcode[Opcode["MUL32"] = 5] = "MUL32";
    Opcode[Opcode["DIV32"] = 6] = "DIV32";
    Opcode[Opcode["DIV32U"] = 7] = "DIV32U";
    Opcode[Opcode["MOD32"] = 8] = "MOD32";
    Opcode[Opcode["MOD32U"] = 9] = "MOD32U";
    Opcode[Opcode["RET32"] = 10] = "RET32";
    Opcode[Opcode["RET"] = 11] = "RET";
    Opcode[Opcode["CALL"] = 12] = "CALL";
    Opcode[Opcode["JP"] = 13] = "JP";
    Opcode[Opcode["JPZ"] = 14] = "JPZ";
    Opcode[Opcode["JPNZ"] = 15] = "JPNZ";
    Opcode[Opcode["LOAD_ARG32"] = 16] = "LOAD_ARG32";
    Opcode[Opcode["PUSH32_0"] = 17] = "PUSH32_0";
    Opcode[Opcode["STORE32"] = 18] = "STORE32";
    Opcode[Opcode["LOAD_LOCAL32"] = 19] = "LOAD_LOCAL32";
    Opcode[Opcode["AND32"] = 20] = "AND32";
    Opcode[Opcode["OR32"] = 21] = "OR32";
    Opcode[Opcode["XOR32"] = 22] = "XOR32";
    Opcode[Opcode["SHL32"] = 23] = "SHL32";
    Opcode[Opcode["SHR32"] = 24] = "SHR32";
    Opcode[Opcode["SHR32U"] = 25] = "SHR32U";
    Opcode[Opcode["EQ32"] = 26] = "EQ32";
    Opcode[Opcode["NE32"] = 27] = "NE32";
    Opcode[Opcode["GT32"] = 28] = "GT32";
    Opcode[Opcode["GT32U"] = 29] = "GT32U";
    Opcode[Opcode["GE32"] = 30] = "GE32";
    Opcode[Opcode["GE32U"] = 31] = "GE32U";
    Opcode[Opcode["NOT32"] = 32] = "NOT32";
    Opcode[Opcode["BNOT32"] = 33] = "BNOT32";
    Opcode[Opcode["NEG32"] = 34] = "NEG32";
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
    IrStreamWritter.prototype.appendUInt32 = function (value) {
        var buffer = new Buffer(IrStreamWritter.INTEGER_SIZE);
        buffer.writeUInt32BE(value, 0);
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
        this.waitingForRelativeLabel = {};
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
    Assembler.prototype.const_p = function (value) {
        return this.op(2 /* CONST32 */).address(value);
    };
    Assembler.prototype.const_i32 = function (value) {
        return this.op(2 /* CONST32 */).i32(value);
    };
    Assembler.prototype.const_u32 = function (value) {
        return this.op(2 /* CONST32 */).u32(value);
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
    Object.defineProperty(Assembler.prototype, "div32u", {
        get: function () {
            return this.op(7 /* DIV32U */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "mod32", {
        get: function () {
            return this.op(8 /* MOD32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "mod32u", {
        get: function () {
            return this.op(9 /* MOD32U */);
        },
        enumerable: true,
        configurable: true
    });
    Assembler.prototype.store32 = function (offset) {
        return this.op(18 /* STORE32 */).i32(offset);
    };
    Assembler.prototype.load_local32 = function (offset) {
        return this.op(19 /* LOAD_LOCAL32 */).i32(offset);
    };
    Assembler.prototype.jp = function (address) {
        return this.op(13 /* JP */).address(address);
    };
    Assembler.prototype.jpz = function (address) {
        return this.op(14 /* JPZ */).address(address);
    };
    Assembler.prototype.jpnz = function (address) {
        return this.op(15 /* JPNZ */).address(address);
    };
    Assembler.prototype.call = function (argc) {
        return this.op(12 /* CALL */).i32(argc);
    };
    Object.defineProperty(Assembler.prototype, "and32", {
        get: function () {
            return this.op(20 /* AND32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "or32", {
        get: function () {
            return this.op(21 /* OR32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "xor32", {
        get: function () {
            return this.op(22 /* XOR32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "shl32", {
        get: function () {
            return this.op(23 /* SHL32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "shr32", {
        get: function () {
            return this.op(24 /* SHR32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "shr32u", {
        get: function () {
            return this.op(25 /* SHR32U */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "eq32", {
        get: function () {
            return this.op(26 /* EQ32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ne32", {
        get: function () {
            return this.op(27 /* NE32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "gt32", {
        get: function () {
            return this.op(28 /* GT32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "gt32u", {
        get: function () {
            return this.op(29 /* GT32U */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ge32", {
        get: function () {
            return this.op(30 /* GE32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ge32u", {
        get: function () {
            return this.op(31 /* GE32U */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "not32", {
        get: function () {
            return this.op(32 /* NOT32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "bnot32", {
        get: function () {
            return this.op(33 /* BNOT32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "neg32", {
        get: function () {
            return this.op(34 /* NEG32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "halt", {
        get: function () {
            return this.op(1 /* HALT */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ret32", {
        get: function () {
            return this.op(10 /* RET32 */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "ret", {
        get: function () {
            return this.op(11 /* RET */);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Assembler.prototype, "alloc32", {
        get: function () {
            return this.op(17 /* PUSH32_0 */);
        },
        enumerable: true,
        configurable: true
    });
    Assembler.prototype.load_arg32 = function (num) {
        return this.op(16 /* LOAD_ARG32 */).i32(num);
    };
    Assembler.prototype.label = function (name) {
        this.resolveLabel(name);
        return this;
    };
    Assembler.prototype.i32 = function (value) {
        this.irStreamWritter.appendInt32(value);
        return this;
    };
    Assembler.prototype.u32 = function (value) {
        this.irStreamWritter.appendUInt32(value);
        return this;
    };
    Assembler.prototype.address = function (value, isRelativeAddress) {
        if (isRelativeAddress === void 0) { isRelativeAddress = false; }
        this.writeAddress(value, isRelativeAddress);
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
        if (this.waitingForRelativeLabel.hasOwnProperty(id)) {
            this.waitingForRelativeLabel[id].forEach(function (offset) { return _this.irStreamWritter.writeAddress(address - offset, offset); });
        }
    };
    Assembler.prototype.writeAddress = function (id, isRelativeAddress) {
        if (isRelativeAddress === void 0) { isRelativeAddress = false; }
        var obj = isRelativeAddress ? this.waitingForRelativeLabel : this.waitingForLabel;
        if (this.labels.hasOwnProperty(String(id))) {
            if (isRelativeAddress) {
                this.irStreamWritter.appendAddress(this.labels[id] - this.irStreamWritter.getCurrentOffset());
            }
            else {
                this.irStreamWritter.appendAddress(this.labels[id]);
            }
            delete obj[id];
        }
        else {
            if (!obj.hasOwnProperty(id)) {
                obj[id] = [];
            }
            obj[id].push(this.irStreamWritter.getCurrentOffset());
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
        this.irStreamWritter.appendOpcode(10 /* RET32 */);
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
        this.irStreamWritter.appendOpcode(12 /* CALL */);
    };
    return IrTranslator;
})();
exports.IrTranslator = IrTranslator;
