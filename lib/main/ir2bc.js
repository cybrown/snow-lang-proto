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
    Opcode[Opcode["JR"] = 16] = "JR";
    Opcode[Opcode["JRZ"] = 17] = "JRZ";
    Opcode[Opcode["JRNZ"] = 18] = "JRNZ";
    Opcode[Opcode["LOAD_ARG32"] = 19] = "LOAD_ARG32";
    Opcode[Opcode["PUSH32_0"] = 20] = "PUSH32_0";
    Opcode[Opcode["STORE32"] = 21] = "STORE32";
    Opcode[Opcode["LOAD_LOCAL32"] = 22] = "LOAD_LOCAL32";
    Opcode[Opcode["AND32"] = 23] = "AND32";
    Opcode[Opcode["OR32"] = 24] = "OR32";
    Opcode[Opcode["XOR32"] = 25] = "XOR32";
    Opcode[Opcode["SHL32"] = 26] = "SHL32";
    Opcode[Opcode["SHR32"] = 27] = "SHR32";
    Opcode[Opcode["SHR32U"] = 28] = "SHR32U";
    Opcode[Opcode["EQ32"] = 29] = "EQ32";
    Opcode[Opcode["NE32"] = 30] = "NE32";
    Opcode[Opcode["GT32"] = 31] = "GT32";
    Opcode[Opcode["GT32U"] = 32] = "GT32U";
    Opcode[Opcode["GE32"] = 33] = "GE32";
    Opcode[Opcode["GE32U"] = 34] = "GE32U";
    Opcode[Opcode["NOT32"] = 35] = "NOT32";
    Opcode[Opcode["BNOT32"] = 36] = "BNOT32";
    Opcode[Opcode["NEG32"] = 37] = "NEG32";
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
    Assembler.prototype.getCurrentAddress = function () {
        return this.irStreamWritter.getCurrentOffset();
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
    Assembler.prototype.op = function (opcode) {
        if (typeof opcode === 'string') {
            this.irStreamWritter.appendOpcode(Opcode[opcode]);
        }
        else {
            this.irStreamWritter.appendOpcode(opcode);
        }
        return this;
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
    Assembler.prototype.getBuffer = function () {
        return this.irStreamWritter.toBuffer();
    };
    return Assembler;
})();
exports.Assembler = Assembler;
var AssemblerHelper = (function () {
    function AssemblerHelper() {
        this.assembler = new Assembler();
    }
    AssemblerHelper.prototype.const_p = function (value) {
        this.assembler.op(2 /* CONST32 */).address(value);
        return this;
    };
    AssemblerHelper.prototype.const_i32 = function (value) {
        this.assembler.op(2 /* CONST32 */).i32(value);
        return this;
    };
    AssemblerHelper.prototype.const_u32 = function (value) {
        this.assembler.op(2 /* CONST32 */).u32(value);
        return this;
    };
    Object.defineProperty(AssemblerHelper.prototype, "add32", {
        get: function () {
            this.assembler.op(3 /* ADD32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "sub32", {
        get: function () {
            this.assembler.op(4 /* SUB32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "mul32", {
        get: function () {
            this.assembler.op(5 /* MUL32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "div32", {
        get: function () {
            this.assembler.op(6 /* DIV32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "div32u", {
        get: function () {
            this.assembler.op(7 /* DIV32U */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "mod32", {
        get: function () {
            this.assembler.op(8 /* MOD32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "mod32u", {
        get: function () {
            this.assembler.op(9 /* MOD32U */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    AssemblerHelper.prototype.store32 = function (offset) {
        this.assembler.op(21 /* STORE32 */).i32(offset);
        return this;
    };
    AssemblerHelper.prototype.load_local32 = function (offset) {
        this.assembler.op(22 /* LOAD_LOCAL32 */).i32(offset);
        return this;
    };
    AssemblerHelper.prototype.jp = function (address) {
        this.assembler.op(13 /* JP */).address(address);
        return this;
    };
    AssemblerHelper.prototype.jpz = function (address) {
        this.assembler.op(14 /* JPZ */).address(address);
        return this;
    };
    AssemblerHelper.prototype.jpnz = function (address) {
        this.assembler.op(15 /* JPNZ */).address(address);
        return this;
    };
    AssemblerHelper.prototype.jr = function (address) {
        this.assembler.op(16 /* JR */).address(address, true);
        return this;
    };
    AssemblerHelper.prototype.jrz = function (address) {
        this.assembler.op(17 /* JRZ */).address(address, true);
        return this;
    };
    AssemblerHelper.prototype.jrnz = function (address) {
        this.assembler.op(18 /* JRNZ */).address(address, true);
        return this;
    };
    AssemblerHelper.prototype.call = function (argc) {
        this.assembler.op(12 /* CALL */).i32(argc);
        return this;
    };
    Object.defineProperty(AssemblerHelper.prototype, "and32", {
        get: function () {
            this.assembler.op(23 /* AND32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "or32", {
        get: function () {
            this.assembler.op(24 /* OR32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "xor32", {
        get: function () {
            this.assembler.op(25 /* XOR32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "shl32", {
        get: function () {
            this.assembler.op(26 /* SHL32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "shr32", {
        get: function () {
            this.assembler.op(27 /* SHR32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "shr32u", {
        get: function () {
            this.assembler.op(28 /* SHR32U */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "eq32", {
        get: function () {
            this.assembler.op(29 /* EQ32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "ne32", {
        get: function () {
            this.assembler.op(30 /* NE32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "gt32", {
        get: function () {
            this.assembler.op(31 /* GT32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "gt32u", {
        get: function () {
            this.assembler.op(32 /* GT32U */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "ge32", {
        get: function () {
            this.assembler.op(33 /* GE32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "ge32u", {
        get: function () {
            this.assembler.op(34 /* GE32U */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "not32", {
        get: function () {
            this.assembler.op(35 /* NOT32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "bnot32", {
        get: function () {
            this.assembler.op(36 /* BNOT32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "neg32", {
        get: function () {
            this.assembler.op(37 /* NEG32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "halt", {
        get: function () {
            this.assembler.op(1 /* HALT */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "ret32", {
        get: function () {
            this.assembler.op(10 /* RET32 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "ret", {
        get: function () {
            this.assembler.op(11 /* RET */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AssemblerHelper.prototype, "alloc32", {
        get: function () {
            this.assembler.op(20 /* PUSH32_0 */);
            return this;
        },
        enumerable: true,
        configurable: true
    });
    AssemblerHelper.prototype.load_arg32 = function (num) {
        this.assembler.op(19 /* LOAD_ARG32 */).i32(num);
        return this;
    };
    AssemblerHelper.prototype.label = function (name) {
        this.assembler.resolveLabel(name);
        return this;
    };
    AssemblerHelper.prototype.get = function () {
        return this.assembler.getBuffer();
    };
    return AssemblerHelper;
})();
exports.AssemblerHelper = AssemblerHelper;
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
