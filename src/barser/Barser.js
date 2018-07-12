define([], () => {

    class Slice {
        constructor(str, start, end) {
            this.str = str;
            this.start = start;
            this.end = end;
        }

        toString() {
            return this.str.substring(this.start, this.end);
        }
    }

    const slice = (str, start, end) => new Slice(str, start, end);

    class Result {
        constructor(ok) {
            this.ok = ok;
        }
    }

    class SuccessResult extends Result {
        constructor(value, start, end) {
            super(true);
            this.value = value;
            this.start = start;
            this.end = end;
        }
    }

    class Parser {
        constructor(name, fn) {
            this.name = name;
            this.fn = fn;
        }
    }

    const success = (value, start, end) => new SuccessResult(value, start, end);

    const successWithSlice = (str, start, end) => new SuccessResult(slice(str, start, end), start, end);

    class FailureResult extends Result {
        constructor(failMsg, pos) {
            super(false);
            this.failMsg = failMsg;
            this.pos = pos;
        }
    }

    const failure = (failMsg, pos) => new FailureResult(failMsg, pos);

    // Basic parsers
    // ------------------------------------------------------

    const successful = new Parser('successful', (str, pos) => success(null, pos, pos));

    const str = (s) => new Parser(s,
        (str, pos) => (str.startsWith(s, pos)
            ? success(s, pos, pos + s.length)
            : failure(`Expected: ${s}`, pos))
    );

    const many = (parser) => new Parser(parser.name + '*',
        (str, pos) => {
            const value = [];
            let end = pos;
            let r = parser.fn(str, end);
            while (r.ok) {
                value.push(r.value);
                end = r.end;
                r = parser.fn(str, end);
            }
            return success(value, pos, end);
        }
    )

    const seq = (...parsers) => new Parser(parsers.map(p => p.name).join('\u2192'),
        (str, pos) => {
            const value = [];
            const res = parsers.reduce((acc, curr) => {
                if (acc.ok) {
                    const r = curr.fn(str, acc.end);
                    if (r.ok) {
                        value.push(r.value);
                    }
                    return r;
                } else {
                    return acc;
                }
            }, successful.fn(str, pos));
            if (res.ok) {
                return success(value, pos, res.end);
            }
            return res;
        }
    )

    const or = (...parsers) => (
        (str, pos) => {

        }
    )

    // Execution
    // ------------------------------------------------------
    const parse = (parser, string) => parser.fn(string, 0)

    // Module export
    // ------------------------------------------------------
    return {
        version: '0.0.1',

        // Types
        Slice,

        // helpers
        slice,

        // Basic parsers
        successful,
        str,
        many,
        seq,

        // Execution methods
        parse,
    }
});
