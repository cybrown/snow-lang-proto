var ir2bc = require('./ir2bc');
var CPU = (function () {
    function CPU() {
        this.pc = 0;
        this.sp = -1;
        this.fp = 0;
        this.debug = false;
        this.stack = new Array(100);
    }
    CPU.prototype.pop = function () {
        return this.stack[this.sp--];
    };
    CPU.prototype.push = function (value) {
        this.stack[++this.sp] = value;
    };
    CPU.prototype.readOpcode = function () {
        var value = this.bytecode.readUInt8(this.pc);
        this.pc++;
        return value;
    };
    CPU.prototype.readInt = function () {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    };
    CPU.prototype.readAddress = function () {
        var value = this.bytecode.readInt32BE(this.pc);
        this.pc += 4;
        return value;
    };
    CPU.prototype.getResult = function () {
        return this.stack[this.sp];
    };
    CPU.prototype.run = function (bc) {
        this.bytecode = bc;
        while (this.pc < this.bytecode.length) {
            var opcode = this.readOpcode();
            if (opcode === 1 /* HALT */) {
                break;
            }
            this.runBytecode(opcode);
        }
    };
    CPU.prototype.runBytecode = function (opcode) {
        if (this.debug) {
            console.log('[%s] %s', this.pc - 1, ir2bc.Opcode[opcode]);
            console.log(this.stack.slice(0, this.sp + 1));
        }
        switch (opcode) {
            case 4 /* CONST */:
                this.runConst();
                break;
            case 2 /* ADD */:
                this.runAdd();
                break;
            case 3 /* SUB */:
                this.runSub();
                break;
            case 10 /* MUL */:
                this.runMul();
                break;
            case 7 /* CALL */:
                this.runCall();
                break;
            case 5 /* RET */:
                this.runRet();
                break;
            case 6 /* RETVOID */:
                this.runRetvoid();
                break;
            case 8 /* JP */:
                this.runJp();
                break;
            case 9 /* JPZ */:
                this.runJpz();
                break;
            case 11 /* LOAD_ARG */:
                this.runLoadArg();
                break;
            default:
                throw new Error('Unsupported bytecode: ' + opcode + ' (' + ir2bc.Opcode[opcode] + ')@' + (this.pc - 1));
        }
        if (this.debug) {
            console.log(this.stack.slice(0, this.sp + 1));
        }
    };
    CPU.prototype.runConst = function () {
        var value = this.readInt();
        this.push(value);
    };
    CPU.prototype.runAdd = function () {
        var right = this.pop();
        var left = this.pop();
        var value = left + right;
        this.push(value);
    };
    CPU.prototype.runSub = function () {
        var right = this.pop();
        var left = this.pop();
        var value = left - right;
        this.push(value);
    };
    CPU.prototype.runMul = function () {
        var right = this.pop();
        var left = this.pop();
        var value = left * right;
        this.push(value);
    };
    CPU.prototype.runCall = function () {
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
    };
    CPU.prototype.runRet = function () {
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
    };
    CPU.prototype.runRetvoid = function () {
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
    };
    CPU.prototype.runJp = function () {
        this.pc = this.readAddress();
    };
    CPU.prototype.runJpz = function () {
        var dest = this.readAddress();
        if (this.pop() === 0) {
            this.pc = dest;
        }
    };
    CPU.prototype.runLoadArg = function () {
        var offset = this.readInt();
        this.push(this.stack[this.fp - offset - 3]);
    };
    return CPU;
})();
exports.CPU = CPU;
