import nodes = require('./../ast');

export declare class JisonParser {
    yy: any;
    parse(source: string): nodes.Program;
}

export declare var parser: JisonParser;
