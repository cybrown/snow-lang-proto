import types = require('../../main/types');
import assert = require('assert');

describe ('Type serialization', () => {

    describe ('Void', () => {

        it ('void', () => {
            var _void = types.Void.instance;
            assert.equal(_void.serialize(), 'V');
        });
    });

    describe ('Integers', () => {

        it ('32 bits signed integer', () => {
            var int32 = types.Integer.INT32;
            assert.equal(int32.serialize(), 'I32');
        });

        it ('64 bits signed integer', () => {
            var int64 = types.Integer.INT64;
            assert.equal(int64.serialize(), 'I64');
        });

        it ('32 bits unsigned integer', () => {
            var uint32 = types.Integer.UINT32;
            assert.equal(uint32.serialize(), 'U32');
        });

        it ('64 bits unsigned integer', () => {
            var uint64 = types.Integer.UINT64;
            assert.equal(uint64.serialize(), 'U64');
        });
    });

    describe ('Floats', () => {

        it ('32 bits float', () => {
            var float32 = types.Float.FLOAT32;
            assert.equal(float32.serialize(), 'F32');
        });

        it ('64 bits float', () => {
            var float64 = types.Float.FLOAT64;
            assert.equal(float64.serialize(), 'F64');
        });
    });

    describe ('Array', () => {

        it ('Array of 32 signed integers', () => {
            var arr = new types.Array(types.Integer.INT32);
            assert.equal(arr.serialize(), '[I32]');
        });

        it ('Array of array of 32 signed integers', () => {
            var arr = new types.Array(new types.Array(types.Integer.INT32));
            assert.equal(arr.serialize(), '[[I32]]');
        });
    });

    describe ('Tuple', () => {

        it ('Tuple of 32 signed integers and 64 bit float', () => {
            var tuple = new types.Tuple([types.Integer.INT32, types.Float.FLOAT64]);
            assert.equal(tuple.serialize(), '(I32,F64)');
        });

        it ('Tuple of 32 signed integer and Tuple of 64 bit float and 32 bits unsigned integer', () => {
            var tuple = new types.Tuple([types.Integer.INT32, new types.Tuple([types.Float.FLOAT64, types.Integer.UINT32])]);
            assert.equal(tuple.serialize(), '(I32,(F64,U32))');
        });
    });

    describe ('Func', () => {

        it ('no args returns void', () => {
            var func = new types.Func([], types.Void.instance);
            assert.equal(func.serialize(), 'F()=>V');
        });

        it ('int32 returns void', () => {
            var func = new types.Func([types.Integer.INT32], types.Void.instance);
            assert.equal(func.serialize(), 'F(I32)=>V');
        });

        it ('no args returns int32', () => {
            var func = new types.Func([], types.Integer.INT32);
            assert.equal(func.serialize(), 'F()=>I32');
        });

        it ('Tuple of uint32 and int64 return Tuple of float64 and (function that return int64 with 2 int32 parameters)', () => {
            var func = new types.Func(
                [
                    new types.Tuple([
                        types.Integer.UINT32,
                        types.Integer.INT64
                    ])
                ]
            , new types.Tuple([
                    types.Float.FLOAT64,
                    new types.Func([
                        types.Integer.INT32,
                        types.Integer.INT32
                    ], types.Integer.INT64)
                ]));
            assert.equal(func.serialize(), 'F((U32,I64))=>(F64,F(I32,I32)=>I64)');
        });
    });

    describe ('Structure', () => {

        it ('Structure of valueA as int32 and valueB as float64', () => {
            var struct = new types.Structure({
                valueA: types.Integer.INT32,
                valueB: types.Float.FLOAT64
            });
            assert.equal(struct.serialize(), 'S(valueA:I32,valueB:F64)');
        });
    });

    describe ('Optionnal', () => {

        it ('Optionnal of int32', () => {
            var opt = new types.Optionnal(types.Integer.INT32);
            assert.equal(opt.serialize(), 'O(I32)');
        });
    });
});
