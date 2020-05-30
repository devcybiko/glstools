var test = require('unit.js');
var { List, Entry } = require('../index');
var { log } = require('../js/log');

describe('testing gls.List', function () {
    it('handles Simple Lists One', function () {
        let results = null;
        let expected = new List();
        expected.add(new Entry("key1", "value1"));
        expected.add(new Entry("key2", "value2"));

        results = List.parse(`
        (
            key1: value1
            key2: value2
        )
        `);
        test.value(results).is(expected);
    });
    it('handles Simple Lists Two', function () {
        let results = List.parse(`
        (   key1: value1
        key2: value2
        )
        `);
        let expected = new List();
        expected.add(new Entry("key1", "value1"));
        expected.add(new Entry("key2", "value2"));

        test.value(results).is(expected);
    });
    it('handles Simple Lists Three', function () {
        let expected = new List();
        expected.add(new Entry("key", "value"));
        expected.add(new Entry("key1", new List(new Entry("key2", "value2"))));
        let results = List.parse(`
        (
            key: value
            key1: (
                key2:value2
            )
        )
        `);
        test.value(results).is(expected);
    });
    it('handles A Complex List', function () {
        let txt = `(
            0: value0
            key1 : (
                key2: [\\
                        class:foo, \\
                        action:bar("string"\\\\, "value");, \\
                        text:This is a test, \\
                        color:RED]   
                key5 : (
                    key6 : value6, and more
                    key_number_7:   value_7 plus more stuff
                )
            )
            key8: the final value of 8!
        )
        `;
        results = List.parse(txt);
        expected = new List("0", "value0")
            .add("key1", new List("key2",
                new List("class", "foo")
                    .add("action", `bar("string", "value");`)
                    .add("text", "This is a test")
                    .add("color", "RED"))
                .add("key5", new List("key6", "value6, and more")
                    .add("key_number_7", "value_7 plus more stuff")))
            .add("key8", "the final value of 8!");
        test.value(results).is(expected);

        let results$ = results.toString();
        let expected$ = expected.toString();
        test.value(results$).is(expected$);

        let keys = [];
        let values = [];
        let expectedKeys = [
            '0',
            'class',
            'action',
            'text',
            'color',
            'key6',
            'key_number_7',
            'key8'
        ];
        let expectedValues = [
            'value0',
            'foo',
            'bar("string", "value");',
            'This is a test',
            'RED',
            'value6, and more',
            'value_7 plus more stuff',
            'the final value of 8!'
        ]
        results.visit(entry => { if (typeof (entry.getValue()) === 'string') keys.push(entry.getKey()) });
        results.visit(entry => { if (typeof (entry.getValue()) === 'string') values.push(entry.getValue()) });
        test.value(keys).is(expectedKeys);
        test.value(values).is(expectedValues);

    });
});
