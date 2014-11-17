//region Base
export class AstNode {

    constructor (private _loc: SourceLocation) {}

    get loc() { return this._loc; }
}

export class Program extends AstNode {

    constructor (private _declarations: Declaration[], loc?: SourceLocation) {
        super(loc);
    }

    get declarations () { return this._declarations; }
}

export class SourceLocation {

    constructor (
        private _source: string,
        private _start: Position,
        private _end: Position
    ) {}

    get source() { return this._source; }
    get start() { return this._start; }
    get end() { return this._end; }
}

export class Position {

    constructor (
        private _line: number,
        private _column: number
    ) {}

    get line() { return this._line; }
    get column() { return this._column; }
}
//endregion

//region Enums
export enum BinaryOperator {
    ADD, SUB, MUL, DIV, REM
}

export enum Builtin {
    ADD,
    SUB
}
//endregion

//region Declarations
export class Declaration extends AstNode {

    constructor (loc?: SourceLocation) {
        super(loc);
    }
}
//endregion

//region Statements
export class Statement extends Declaration {

    constructor (loc?: SourceLocation) {
        super(loc);
    }
}

export class ExpressionStatement extends Statement {

    constructor (private _expression: Expression, loc?: SourceLocation) {
        super(loc);
    }

    get expression () { return this._expression; }
}
//endregion

//region Expressions
export class Expression extends AstNode {

    constructor (loc: SourceLocation) {
        super(loc);
    }
}

export class PrefixUnaryExpression extends Expression {

    constructor (
        private _operator: BinaryOperator,
        private _operand: Expression,
        loc?: SourceLocation
    ) {
        super(loc);
    }

    get operator () { return this._operator; }
    get operand () { return this._operand; }
}

export class PostfixUnaryExpression extends Expression {

    constructor (
        private _operator: BinaryOperator,
        private _operand: Expression,
        loc?: SourceLocation
    ) {
        super(loc);
    }

    get operator () { return this._operator; }
    get operand () { return this._operand; }
}

export class BinaryExpression extends Expression {

    constructor (
        private _left: Expression,
        private _operator: BinaryOperator,
        private _right: Expression,
        loc?: SourceLocation
    ) {
        super(loc);
    }

    get left () { return this._left; }
    get right () { return this._right; }
    get operator () { return this._operator; }
}

export class ConditionnalExpression extends Expression {

    constructor (
        private _test: Expression,
        private _consequent: Expression,
        private _alternate: Expression,
        loc?: SourceLocation
        ) {
        super(loc);
    }

    get test () { return this._test; }
    get consequent () { return this._consequent; }
    get alternate () { return this._alternate; }
}

export class LiteralExpression extends Expression {

    constructor (
        private _raw: string,
        loc?: SourceLocation
    ) {
        super(loc);
    }

    get raw() { return this._raw; }
}

export class IdentifierExpression extends Expression {

    constructor (
        private _name: string,
        loc?: SourceLocation
    ) {
        super(loc);
    }

    get name() { return this._name; }
}

export class CallExpression extends Expression {

    constructor (
        private _callee: Expression,
        private _args: Expression[],
        loc?: SourceLocation
        ) {
        super(loc);
    }

    get callee() { return this._callee; }
    get args() { return this._args; }
}

export class BuiltinExpression extends Expression {

    constructor (
        private _builtin: Builtin,
        private _args: Expression[],
        loc?: SourceLocation
        ) {
        super(loc);
    }

    get builtin() { return this._builtin; }
    get args() { return this._args; }
}
//endregion
