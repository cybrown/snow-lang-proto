import assert = require('assert');

import parser = require('../../../main/parser/index');
import ast = require('../../../main/ast');

describe('Literals', () => {

    describe ('Integer literals', () => {
        it ('1', () => {
            var exprStm = <ast.ExpressionStatement> parser.parse('1;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = <ast.LiteralExpression> exprStm.expression;
            assert.ok(expr instanceof ast.LiteralExpression);
            assert.strictEqual('1', expr.raw);
        });

        it ('42', () => {
            var exprStm = <ast.ExpressionStatement> parser.parse('42;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = <ast.LiteralExpression> exprStm.expression;
            assert.ok(expr instanceof ast.LiteralExpression);
            assert.strictEqual('42', expr.raw);
        });
    });

    describe ('Float literals', () => {
        it ('3.14', () => {
            var exprStm = <ast.ExpressionStatement> parser.parse('3.14;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = <ast.LiteralExpression> exprStm.expression;
            assert.ok(expr instanceof ast.LiteralExpression);
            assert.strictEqual('3.14', expr.raw);
        });
    });
});
