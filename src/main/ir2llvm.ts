import ir = require('./ir');
import types = require('./types');

export class Ir2llvm {

    private _typeTranslator = new IrType2llvm();
    private _result = '';

    translate (node: ir.IrNode): void {
        if (node instanceof ir.IntegerConstant) {
            this.translateIntegerConstant(<ir.IntegerConstant> node);
        } else if (node instanceof ir.Func) {
            this.translateFunc(<ir.Func> node);
        } else if (node instanceof ir.BasicBlock) {
            this.translateBasicBlock(<ir.BasicBlock> node);
        } else if (node instanceof ir.ReturnValue) {
            this.translateReturnValue(<ir.ReturnValue> node);
        } else {
            throw new Error('Unknown node type');
        }
    }

    get (): string {
        return this._result;
    }

    private translateIntegerConstant (node: ir.IntegerConstant): void {
        this._result += '\n  ' + this.inline(node) + ' = ' + this._typeTranslator.translate(node.type) + ' ' + node.value;
    }

    private translateFunc (node: ir.Func): void {
        var name = node.name;
        if (name == null) {
            name = 'func' + node.id;
        }
        this._result = 'define ' + this._typeTranslator.translate(node.type.returnType) + ' @' + name + '(';
        var argIndex = 0;
        this._result += (<types.Type[]> node.type.argumentsType)
            .map(type => this._typeTranslator.translate(type) + ' %arg' + argIndex++)
            .join(', ');
        this._result += ') {';
        node.blocks.forEach(block => this.translate(block));
        this._result += '\n}';
    }

    private translateBasicBlock (node: ir.BasicBlock): void {
        node.values.forEach(node => {
            this.translate(node);
        });
        this.translate(node.terminal);
    }

    private translateReturnValue(node: ir.ReturnValue): void {
        this.translate(node.value);
        this._result += '\n  ret ' + this._typeTranslator.translate(node.value.type) + ' ' + this.inline(node.value);
    }

    private inline(node: ir.IrNode): string {
        return '%node.' + node.id;
    }
}

export class IrType2llvm {

    translate (type: types.Type): string {
        if (type instanceof types.Integer) {
            return this.translateTypeInteger(<types.Integer> type);
        } else {
            throw new Error('Unknown type');
        }
    }

    private translateTypeInteger (type: types.Integer): string {
        return 'i' + type.bits;
    }
}