var ast2ir = require('../../main/ast2ir');
describe('Ast to Constant', function () {
    var translator;
    beforeEach(function () {
        translator = new ast2ir.AstTranslator();
    });
    /*
    it('1 + 2', () => {
        var constantAstNode = new nodes.BinaryExpression(
            new nodes.LiteralExpression('1'),
            nodes.BinaryOperator.ADD,
            new nodes.LiteralExpression('2')
        );
        var addIrNode = translator.translateBinaryExpression(constantAstNode);
        assert.ok(addIrNode instanceof ir.Add);
    });
    */
});
