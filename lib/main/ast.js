var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//region Base
var AstNode = (function () {
    function AstNode(_loc) {
        this._loc = _loc;
    }
    Object.defineProperty(AstNode.prototype, "loc", {
        get: function () {
            return this._loc;
        },
        enumerable: true,
        configurable: true
    });
    return AstNode;
})();
exports.AstNode = AstNode;
var Program = (function (_super) {
    __extends(Program, _super);
    function Program(_declarations, loc) {
        _super.call(this, loc);
        this._declarations = _declarations;
    }
    Object.defineProperty(Program.prototype, "declarations", {
        get: function () {
            return this._declarations;
        },
        enumerable: true,
        configurable: true
    });
    return Program;
})(AstNode);
exports.Program = Program;
var SourceLocation = (function () {
    function SourceLocation(_source, _start, _end) {
        this._source = _source;
        this._start = _start;
        this._end = _end;
    }
    Object.defineProperty(SourceLocation.prototype, "source", {
        get: function () {
            return this._source;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SourceLocation.prototype, "start", {
        get: function () {
            return this._start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SourceLocation.prototype, "end", {
        get: function () {
            return this._end;
        },
        enumerable: true,
        configurable: true
    });
    return SourceLocation;
})();
exports.SourceLocation = SourceLocation;
var Position = (function () {
    function Position(_line, _column) {
        this._line = _line;
        this._column = _column;
    }
    Object.defineProperty(Position.prototype, "line", {
        get: function () {
            return this._line;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Position.prototype, "column", {
        get: function () {
            return this._column;
        },
        enumerable: true,
        configurable: true
    });
    return Position;
})();
exports.Position = Position;
//endregion
//region Enums
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["ADD"] = 0] = "ADD";
    BinaryOperator[BinaryOperator["SUB"] = 1] = "SUB";
    BinaryOperator[BinaryOperator["MUL"] = 2] = "MUL";
    BinaryOperator[BinaryOperator["DIV"] = 3] = "DIV";
    BinaryOperator[BinaryOperator["REM"] = 4] = "REM";
})(exports.BinaryOperator || (exports.BinaryOperator = {}));
var BinaryOperator = exports.BinaryOperator;
(function (Builtin) {
    Builtin[Builtin["ADD"] = 0] = "ADD";
    Builtin[Builtin["SUB"] = 1] = "SUB";
})(exports.Builtin || (exports.Builtin = {}));
var Builtin = exports.Builtin;
//endregion
//region Declarations
var Declaration = (function (_super) {
    __extends(Declaration, _super);
    function Declaration(loc) {
        _super.call(this, loc);
    }
    return Declaration;
})(AstNode);
exports.Declaration = Declaration;
//endregion
//region Statements
var Statement = (function (_super) {
    __extends(Statement, _super);
    function Statement(loc) {
        _super.call(this, loc);
    }
    return Statement;
})(Declaration);
exports.Statement = Statement;
var ExpressionStatement = (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement(_expression, loc) {
        _super.call(this, loc);
        this._expression = _expression;
    }
    Object.defineProperty(ExpressionStatement.prototype, "expression", {
        get: function () {
            return this._expression;
        },
        enumerable: true,
        configurable: true
    });
    return ExpressionStatement;
})(Statement);
exports.ExpressionStatement = ExpressionStatement;
var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement(_expression, loc) {
        _super.call(this, loc);
        this._expression = _expression;
    }
    Object.defineProperty(ReturnStatement.prototype, "expression", {
        get: function () {
            return this._expression;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReturnStatement.prototype, "hasExpression", {
        get: function () {
            return !!this._expression;
        },
        enumerable: true,
        configurable: true
    });
    return ReturnStatement;
})(Statement);
exports.ReturnStatement = ReturnStatement;
//endregion
//region Expressions
var Expression = (function (_super) {
    __extends(Expression, _super);
    function Expression(loc) {
        _super.call(this, loc);
    }
    return Expression;
})(AstNode);
exports.Expression = Expression;
var PrefixUnaryExpression = (function (_super) {
    __extends(PrefixUnaryExpression, _super);
    function PrefixUnaryExpression(_operator, _operand, loc) {
        _super.call(this, loc);
        this._operator = _operator;
        this._operand = _operand;
    }
    Object.defineProperty(PrefixUnaryExpression.prototype, "operator", {
        get: function () {
            return this._operator;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PrefixUnaryExpression.prototype, "operand", {
        get: function () {
            return this._operand;
        },
        enumerable: true,
        configurable: true
    });
    return PrefixUnaryExpression;
})(Expression);
exports.PrefixUnaryExpression = PrefixUnaryExpression;
var PostfixUnaryExpression = (function (_super) {
    __extends(PostfixUnaryExpression, _super);
    function PostfixUnaryExpression(_operator, _operand, loc) {
        _super.call(this, loc);
        this._operator = _operator;
        this._operand = _operand;
    }
    Object.defineProperty(PostfixUnaryExpression.prototype, "operator", {
        get: function () {
            return this._operator;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostfixUnaryExpression.prototype, "operand", {
        get: function () {
            return this._operand;
        },
        enumerable: true,
        configurable: true
    });
    return PostfixUnaryExpression;
})(Expression);
exports.PostfixUnaryExpression = PostfixUnaryExpression;
var BinaryExpression = (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression(_left, _operator, _right, loc) {
        _super.call(this, loc);
        this._left = _left;
        this._operator = _operator;
        this._right = _right;
    }
    Object.defineProperty(BinaryExpression.prototype, "left", {
        get: function () {
            return this._left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryExpression.prototype, "right", {
        get: function () {
            return this._right;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryExpression.prototype, "operator", {
        get: function () {
            return this._operator;
        },
        enumerable: true,
        configurable: true
    });
    return BinaryExpression;
})(Expression);
exports.BinaryExpression = BinaryExpression;
var ConditionnalExpression = (function (_super) {
    __extends(ConditionnalExpression, _super);
    function ConditionnalExpression(_test, _consequent, _alternate, loc) {
        _super.call(this, loc);
        this._test = _test;
        this._consequent = _consequent;
        this._alternate = _alternate;
    }
    Object.defineProperty(ConditionnalExpression.prototype, "test", {
        get: function () {
            return this._test;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConditionnalExpression.prototype, "consequent", {
        get: function () {
            return this._consequent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConditionnalExpression.prototype, "alternate", {
        get: function () {
            return this._alternate;
        },
        enumerable: true,
        configurable: true
    });
    return ConditionnalExpression;
})(Expression);
exports.ConditionnalExpression = ConditionnalExpression;
var LiteralExpression = (function (_super) {
    __extends(LiteralExpression, _super);
    function LiteralExpression(_raw, loc) {
        _super.call(this, loc);
        this._raw = _raw;
    }
    Object.defineProperty(LiteralExpression.prototype, "raw", {
        get: function () {
            return this._raw;
        },
        enumerable: true,
        configurable: true
    });
    return LiteralExpression;
})(Expression);
exports.LiteralExpression = LiteralExpression;
var IdentifierExpression = (function (_super) {
    __extends(IdentifierExpression, _super);
    function IdentifierExpression(_name, loc) {
        _super.call(this, loc);
        this._name = _name;
    }
    Object.defineProperty(IdentifierExpression.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return IdentifierExpression;
})(Expression);
exports.IdentifierExpression = IdentifierExpression;
var CallExpression = (function (_super) {
    __extends(CallExpression, _super);
    function CallExpression(_callee, _args, loc) {
        _super.call(this, loc);
        this._callee = _callee;
        this._args = _args;
    }
    Object.defineProperty(CallExpression.prototype, "callee", {
        get: function () {
            return this._callee;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CallExpression.prototype, "args", {
        get: function () {
            return this._args;
        },
        enumerable: true,
        configurable: true
    });
    return CallExpression;
})(Expression);
exports.CallExpression = CallExpression;
var BuiltinExpression = (function (_super) {
    __extends(BuiltinExpression, _super);
    function BuiltinExpression(_builtin, _args, loc) {
        _super.call(this, loc);
        this._builtin = _builtin;
        this._args = _args;
    }
    Object.defineProperty(BuiltinExpression.prototype, "builtin", {
        get: function () {
            return this._builtin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuiltinExpression.prototype, "args", {
        get: function () {
            return this._args;
        },
        enumerable: true,
        configurable: true
    });
    return BuiltinExpression;
})(Expression);
exports.BuiltinExpression = BuiltinExpression;
