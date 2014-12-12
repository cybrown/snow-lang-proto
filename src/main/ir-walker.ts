import ir = require('./ir');

export class IrWalker {

    constructor (public delegate: IrWalkerDelegate) {

    }

    walk (node: ir.IrNode) {
        if (node instanceof ir.Module) {
            this.delegate.walkModuleBegin(<ir.Module> node);
            (<ir.Module> node).funcs.forEach(func => this.walk(func));
            this.delegate.walkModuleEnd(<ir.Module> node);
        } else if (node instanceof ir.Func) {
            this.delegate.walkFuncBegin(<ir.Func> node);
            (<ir.Func> node).blocks.forEach(block => this.walk(block));
            this.delegate.walkFuncEnd(<ir.Func> node);
        } else if (node instanceof ir.BasicBlock) {
            this.delegate.walkBasicBlockBegin(<ir.BasicBlock> node);
            (<ir.BasicBlock> node).values.forEach(value => this.walk(value));
            this.walk((<ir.BasicBlock> node).terminal);
            this.delegate.walkBasicBlockEnd(<ir.BasicBlock> node);
        } else if (node instanceof ir.Jump) {
            this.delegate.walkJumpBegin(<ir.Jump> node);
            this.delegate.walkJumpEnd(<ir.Jump> node);
        } else if (node instanceof ir.ConditionalJump) {
            this.delegate.walkConditionalJumpBegin(<ir.ConditionalJump> node);
            this.walk((<ir.ConditionalJump> node).condition);
            this.delegate.walkConditionalJumpEnd(<ir.ConditionalJump> node);
        } else if (node instanceof ir.ReturnVoid) {
            this.delegate.walkReturnVoidBegin(<ir.ReturnVoid> node);
            this.delegate.walkReturnVoidEnd(<ir.ReturnVoid> node);
        } else if (node instanceof ir.ReturnValue) {
            this.delegate.walkReturnValueBegin(<ir.ReturnValue> node);
            this.walk((<ir.ReturnValue> node).value);
            this.delegate.walkReturnValueEnd(<ir.ReturnValue> node);
        } else if (node instanceof ir.Call) {
            this.delegate.walkCallBegin(<ir.Call> node);
            (<ir.Call> node).args.forEach(arg => this.walk(arg));
            this.delegate.walkCallEnd(<ir.Call> node);
        } else if (node instanceof ir.IntegerConstant) {
            this.delegate.walkIntegerConstantBegin(<ir.IntegerConstant> node);
            this.delegate.walkIntegerConstantEnd(<ir.IntegerConstant> node);
        } else if (node instanceof ir.Add) {
            this.delegate.walkAddBegin(<ir.Add> node);
            this.walk((<ir.Add> node).left);
            this.walk((<ir.Add> node).right);
            this.delegate.walkAddEnd(<ir.Add> node);
        } else if (node instanceof ir.Sub) {
            this.delegate.walkSubBegin(<ir.Sub> node);
            this.walk((<ir.Sub> node).left);
            this.walk((<ir.Sub> node).right);
            this.delegate.walkSubEnd(<ir.Sub> node);
        } else {
            throw new Error('IrWalkerError: Unknown type to walk: ' + Object.getPrototypeOf(node).constructor.name);
        }
    }
}

export interface IrWalkerDelegate {
    walkModuleBegin (node: ir.Module): void;
    walkModuleEnd (node: ir.Module): void;
    walkFuncBegin (node: ir.Func): void;
    walkFuncEnd (node: ir.Func): void;
    walkBasicBlockBegin (node: ir.BasicBlock): void;
    walkBasicBlockEnd (node: ir.BasicBlock): void;
    walkJumpBegin (node: ir.Jump): void;
    walkJumpEnd (node: ir.Jump): void;
    walkConditionalJumpBegin (node: ir.ConditionalJump): void;
    walkConditionalJumpEnd (node: ir.ConditionalJump): void;
    walkReturnVoidBegin (node: ir.ReturnVoid): void;
    walkReturnVoidEnd (node: ir.ReturnVoid): void;
    walkReturnValueBegin (node: ir.ReturnValue): void;
    walkReturnValueEnd (node: ir.ReturnValue): void;
    walkCallBegin (node: ir.Call): void;
    walkCallEnd (node: ir.Call): void;
    walkIntegerConstantBegin (node: ir.IntegerConstant): void;
    walkIntegerConstantEnd (node: ir.IntegerConstant): void;
    walkAddBegin (node: ir.Add): void;
    walkAddEnd (node: ir.Add): void;
    walkSubBegin (node: ir.Sub): void;
    walkSubEnd (node: ir.Sub): void;
}
