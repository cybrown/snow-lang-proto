declare var module: any;

import nodes = require('./../ast');
import parser = require('./jison-parser');

var parse: parser.JisonParser = parser.parser;

parse.yy.nodes = nodes;

export = parse;
