import ir = require('./ir');
import irWalker = require('./ir-walker');

export class Typer {

    type (node: ir.IrNode) {
        var walker = new irWalker.IrWalker(new TyperDelegate());
        walker.walk(node);
    }
}

class TyperDelegate implements irWalker.IrWalkerDelegate {

    walkModuleBegin(node: ir.Module):void {
    }

    walkModuleEnd(node: ir.Module):void {
    }

    walkFuncBegin(node: ir.Func):void {
    }

    walkFuncEnd(node: ir.Func):void {
    }

    walkBasicBlockBegin(node: ir.BasicBlock):void {
    }

    walkBasicBlockEnd(node: ir.BasicBlock):void {
    }

    walkJumpBegin(node: ir.Jump):void {
    }

    walkJumpEnd(node: ir.Jump):void {
    }

    walkConditionalJumpBegin(node: ir.ConditionalJump):void {
    }

    walkConditionalJumpEnd(node: ir.ConditionalJump):void {
    }

    walkReturnVoidBegin(node: ir.ReturnVoid):void {
    }

    walkReturnVoidEnd(node: ir.ReturnVoid):void {
    }

    walkReturnValueBegin(node: ir.ReturnValue):void {
    }

    walkReturnValueEnd(node: ir.ReturnValue):void {
    }

    walkCallBegin(node: ir.Call):void {
    }

    walkCallEnd(node: ir.Call):void {
    }

    walkIntegerConstantBegin(node: ir.IntegerConstant):void {
    }

    walkIntegerConstantEnd(node: ir.IntegerConstant):void {
    }

    walkAddBegin(node: ir.Add):void {
    }

    walkAddEnd(node: ir.Add):void {
        // TODO Verification
        node.type = node.left.type;
    }

    walkSubBegin(node: ir.Sub):void {
    }

    walkSubEnd(node: ir.Sub):void {
    }
}