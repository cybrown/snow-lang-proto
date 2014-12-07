import assert = require('assert');

import parser = require('../../../main/parser/index');
import ast = require('../../../main/ast');

describe('Expression statement', () => {

    describe ('Integer literals', () => {
        it ('1', () => {
            var exprStm = <ast.ExpressionStatement> parser.parse('1;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = <ast.ExpressionStatement> exprStm;
            assert.ok(expr instanceof ast.ExpressionStatement);
        });
    });
});
