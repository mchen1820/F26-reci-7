import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.
const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer({min: -30, max: 30}), fc.integer()).map(([a,b]):Interval => (a <= b ? [a,b] : [b, a]));
const intervalList = fc.array(interval);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.
  
  //Pattern: invariant. The result is sorted by start.
  it('output is sorted by start', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        let prev = -Infinity;
        for (const [start, end] of mergeIntervals(xs)) {
          expect(start).toBeGreaterThanOrEqual(prev);
          prev = start;
        }
      })
    )
  })

  //Pattern: differential. The result covers the same points of the number line as the input.
  it('output covers same points as input', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        // and a != b?
        const covered = (intervals: Interval[], x: number) => intervals.some(([a,b]) => a <= x && x <= b);
        const out = mergeIntervals(xs);
        
        for (let x = -30; x <= 30; x += 0.5) {
          expect(covered(out, x)).toBe(covered(xs, x));
        }
      })
    )
  })

  //Pattern: metamorphic. Changing the order of the intervals in an input should not affect the output.
  it('shuffling input returns same output', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const reversed = [...xs].reverse();
        const out = mergeIntervals(xs);
        const revOut = mergeIntervals(reversed);
        expect(out).toEqual(revOut);
      })
    )
  })

  //Pattern: algebraic. Merging an interval that's already merged should have no effect on the result.
  it('merging an already merged interval should return same output', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        fc.pre(xs.length > 0);
        const out = mergeIntervals(xs);
        const mergedOut = mergeIntervals([...xs, xs[0]]);
        expect(out).toEqual(mergedOut);
      })
    )
  })

  //Pattern: conditional. If the input intervals already don't overlap, the output should just sort the input.
  it('output for a disjoint input is just sorted input', () => {
    const disjointSorted: fc.Arbitrary<Interval[]> = fc.uniqueArray(fc.integer({min: -20, max: 20})).map(nums => {
      const sorted = [...nums].sort((a,b) => a - b);
      const out: Interval[] = [];
      for (let i = 0; i + 1 < sorted.length; i += 2) {
        out.push([sorted[i], sorted[i+1]]);
      }
      return out;
    })

    const sortedShuffled = disjointSorted.chain(sorted => fc.tuple(fc.constant(sorted), 
      fc.shuffledSubarray(sorted, {minLength: sorted?.length, maxLength: sorted.length})));

    fc.assert(
      fc.property(sortedShuffled, ([sorted, shuffled]) => {
        expect(mergeIntervals(shuffled)).toEqual(sorted);
      })
    )
  })
});
