define([
    'barser/Barser'
], (
    B
) => {
    describe('Barser', () => {

        it('can verify string prefix', () => {  
            const input = 'hello, world';
            const parser = B.str('hello');
            const res = B.parse(parser, input);
            expect(res).toBeTruthy();
            expect(res.ok).toBe(true);
            expect(res.value).toBe('hello');
            expect(res.start).toEqual(0);
            expect(res.end).toEqual(5);
        });

        it('fails if string prefix cannot be verified', () => {
            const input = 'hello, world';
            const parser = B.str('hi');
            const res = B.parse(parser, input);
            expect(res).toBeTruthy();
            expect(res.ok).toBe(false);
            expect(res.failMsg).toBe('Expected: hi');
            expect(res.pos).toEqual(0);            
        });

        it('support many combinator', () => {
            const input = 'abcabcabcd';
            const parser = B.many(B.str('abc'));
            const res = B.parse(parser, input);
            expect(res.ok).toBeTruthy();
            expect(res.start).toBe(0);
            expect(res.end).toBe(9);
            expect(res.value).toEqual(['abc', 'abc', 'abc']);
        });

        it('can sequence parsers', () => {
            const input = 'abcccd';
            const parser = B.seq(B.str('a'), B.str('b'), B.many(B.str('c')), B.str('d'));
            const res = B.parse(parser, input);
            expect(res.ok).toBeTruthy();
            expect(res.start).toBe(0);
            expect(res.end).toBe(6);
            expect(res.value).toEqual(['a', 'b', ['c', 'c', 'c'], 'd']);
        });

        it('fails if sequenced parsers cannot handle input', () => {
            const input = 'abc';
            const parser = B.seq(B.str('a'), B.str('b'), B.str('d'));
            const res = B.parse(parser, input);
            expect(res.ok).toBe(false);
            expect(res.failMsg).toBe('Expected: d');
            expect(res.pos).toBe(2);
        });

        it('can select one of alternative parser', () => {
            const input = 'b';
            const parser = B.or(B.str('a'), B.str('b'), B.str('c'));
            const res = B.parse(parser, input);
            expect(res.ok).toBe(true);
            expect(res.start).toBe(0);
            expect(res.end).toBe(1);
            expect(res.value).toBe('b');
        });

        it('can retrieve matched range using slice', () => {
            const input = 'aaabbccc';
            const p1 = B.many(B.str('a'));
            const p2 = B.slice(B.many(B.str('b')));
            const p3 = B.many(B.str('c'));
            const parser = B.seq(p1, p2, p3);
            const res = B.parse(parser, input);
            expect(res.ok).toBe(true);
            expect(res.value).toEqual([
                ['a', 'a', 'a'],
                { value: ['b', 'b'], slice: new B.Slice(input, 3, 5) },
                ['c', 'c', 'c'],
            ]);
        });

        it('can map over valid result', () => {
            const input = "abc";
            const parser = B.map(B.str('abc'), (value) => value.toUpperCase());
            expect(B.parse(parser, input).value).toBe('ABC');
        });

        it('can use method notation', () => {
            expect(B.parse(B.str('abc').map(v => v.toUpperCase()), 'abc').value).toBe('ABC');
            expect(B.parse(B.str('a').many(), 'aaa').value).toEqual(['a', 'a', 'a']);
            expect(B.parse(B.str('a').seq(B.str('b')), 'ab').value).toEqual(['a', 'b']);
            expect(B.parse(B.str('x').or(B.str('y')), 'y').value).toEqual('y');
            expect(B.parse(B.str('x').slice(), 'x').value).toEqual({
                value: 'x',
                slice: new B.Slice('x', 0, 1)
            });
        });

        it('can match regular expression', () => {
            const input = "a   \t\t   c";
            const parser = B.str('a').seq(B.reg(/\s*/), B.str('c'));
            const res = B.parse(parser, input);
            expect(res.ok).toBe(true);
            expect(res.value).toEqual(['a', '   \t\t   ', 'c']);
        });

        it('defines version', () => {
            expect(B.version).toBe('0.0.1');
        });
    });
});
