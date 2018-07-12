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

        it('defines version', () => {
            expect(B.version).toBe('0.0.1');
        });
    });
});
