# Reflection

**Name / Andrew ID:**
Michael Chen / mc7

**Recitation group members (Task 2):**
N/A (didn't get to Task 2 in Reci)

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

One property I wrote for the intervals is that if the input intervals already don't overlap, the output should just sort the input. This property ended upkilling few/no mutants, but it is still a valid property because it still catches some bugs. A concrete example would be a bug where if the input is already disjoint/the input intervals already don't overlap, then the output is just the input intervals unchanged.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

In the wordle task, the singlePass mutant was flaky because of my generator rather than my "never credits a letter more times than the secret contains it" property. Using a the full alphabet for the random words, the generator failed to produce examples where a letter present in the secret is found in the guess at a position earlier than in the secret, but that letter is also present in the correct position in secret, but it gets marked grey because the letter was already 'consumed' for the previous yellow in its early occurrence. I fixed this by making the generator draw from a much smaller alphabet. 

Output before:

Running against 5 mutants (5 runs each)...

  ✔ allBlack       killed  by: guessing the secret gives all greens
      Counterexample: ["AAAAA"]
      AssertionError: expected [ 'B', 'B', 'B', 'B', 'B' ] to deeply equal [ 'G', 'G', 'G', 'G', 'G' ]
  ✘ greensOnly     SURVIVED
  ✔ ignoresCounts  killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["RAAAA","AARRA"]
      AssertionError: expected 2 to be less than or equal to 1
  ~ singlePass     flaky: killed in 3/5 runs  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAQAA","QAQAA"]
      AssertionError: expected 2 to be less than or equal to 1
  ✔ swapped        killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["HAAAA","AAKAA"]
      AssertionError: expected 1 to be less than or equal to 0

Mutation score: 3/5 killed (60%)

Output after:

Running against 5 mutants (5 runs each)...

  ✔ allBlack       killed  by: guessing the secret gives all greens
      Counterexample: ["AAAAA"]
      AssertionError: expected [ 'B', 'B', 'B', 'B', 'B' ] to deeply equal [ 'G', 'G', 'G', 'G', 'G' ]
  ✘ greensOnly     SURVIVED
  ✔ ignoresCounts  killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAAAB","AABBA"]
      AssertionError: expected 2 to be less than or equal to 1
  ✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAABA","AAAAA"]
      AssertionError: expected 5 to be less than or equal to 4
  ✔ swapped        killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAACA","AABAA"]
      AssertionError: expected 1 to be less than or equal to 0

Mutation score: 4/5 killed (80%)

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

In the wordle task, one counterexample for the singlePass mutation is ["AAABA","AAAAA"]. The matchGuess specification states that the i'th position should be yellow if "guess[i] occurs elsewhere in the secret, and that occurrence has not already been used by a green or by an earlier yellow (yellows are assigned left to right)." This input exposes a bug of not following the specification in the case where "that occurrence has already been used by a green" because the secret contains four A's, and an incorrect implementation would mark the fourth A in the guess as yellow, and the last A as grey, rather than following the specification and marking the guess's fourth A as grey and the fifth A as green.

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

One part of my team's project that could benefit from property-based testing is the calculation of whether a request would cause API usage to exceed the spending limit (this is not its own helper function in the code yet but could be turned into one). One conditional property would be that if no max cost is set, then this function should never return true. The generator would have to be able to generate an empty/none spending limit input, which a naive generator might miss. Another conditional property would be that if the original session cost is already at the max cost, the function should always return true, so the generator would need to be able to generate cases where the starting session cost is already the limit. A naive generator might simply return false if the incoming request cost is 0, making the assumption that the current cost isn't already at the limit.
