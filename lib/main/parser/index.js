var nodes = require('./../ast');
var parser = require('./jison-parser');
var parse = parser.parser;
parse.yy.nodes = nodes;
module.exports = parse;
