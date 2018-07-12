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

    const reg = (regexp) => {
        const r = RegExp(regexp, 'y');
        return new Parser(regexp + '',
            (str, pos) => {
                r.lastIndex = pos;
                const res = r.exec(str);
                if (res) {
                    return success(res[0], pos, pos + res[0].length);
                }
                return failure(`Expected regexp: ${regexp}`, pos);
            }
        );
    };

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

    const or = (...parsers) => {
        const name = parsers.map(p => p.name).join('|');
        return new Parser(name,
            (str, pos) => {
                for (let i = 0; i < parsers.length; i++) {
                    const parser = parsers[i];
                    const res = parser.fn(str, pos);
                    if (res.ok) {
                        return res;
                    }
                }
                return failure(`Expected: ${name}`, pos);
            }
        );
    }

    const slice = (parser) => new Parser(parser.name,
        (str, pos) => {
            const res = parser.fn(str, pos);
            if (res.ok) {
                return success({ value: res.value, slice: new Slice(str, res.start, res.end) }, res.star, res.end);
            }
            return res;
        }
    );

    const map = (parser, fn) => new Parser(parser.name,
        (str, pos) => {
            const res = parser.fn(str, pos);
            if (res.ok) {
                return success(fn(res.value), res.start, res.end);
            }
            return res;
        }
    );

    const lazy = (parserFn) => new Parser('Lazy',
      (str, pos) => {
          const parser = parserFn();
          return parser.fn(str, pos);
      }
    );

    const end = new Parser('$(End)',
        (str, pos) => (pos === str.length
            ? success('', pos, pos)
            : failure(`Expected end of input`, pos))
    );

    // Convenience methods
    Parser.prototype.many = function() {
        return many(this);
    }

    Parser.prototype.or = function(...parsers) {
        return or(this, ...parsers);
    }

    Parser.prototype.seq = function(...parsers) {
        return seq(this, ...parsers);
    }

    Parser.prototype.slice = function() {
        return slice(this);
    }

    Parser.prototype.map = function(fn) {
        return map(this, fn);
    }

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

        // Basic parsers
        successful,
        str,
        reg,
        many,
        seq,
        or,
        slice,
        map,
        lazy,
        end,

        // Execution methods
        parse,
    }
});
