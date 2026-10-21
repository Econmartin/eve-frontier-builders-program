---
duration: 7 min
description: Using an assistant to find and fix problems without losing track of your own code.
---

# Debugging and iterating with AI

An assistant can read an error faster than you can, but it can also "fix" a bug by hiding it. The loop below keeps you in charge of what changes.

## The loop

1. **Reproduce it.** Find the exact command that fails, such as `sui move build` or a test.
2. **Give the whole error.** Paste the full output, not a summary. Line numbers and type names matter.
3. **Ask for an explanation first.** "What is this error telling me, and why does it happen here?" If the explanation doesn't make sense to you, the fix won't either.
4. **Make one change.** Ask for the smallest fix, and read it before you accept it.
5. **Run it again.** Then go back to step 2 with whatever comes next.

If the same error comes back twice, stop and look for a wrong assumption rather than asking for a third fix.

## A Frontier example

Many Frontier flows hand you a value that must be dealt with before the transaction ends. Assistants often forget this and write code that won't build, or that compiles only because they removed the step that mattered.

```excerpt
source: builder-documentation
file: smart-contracts/move-patterns-in-frontier.md
heading: Hot potato
```

If an assistant's fix for an error like this is to drop the receipt or skip returning the [OwnerCap](../glossary/owner-cap.md), reject it. The right fix completes the flow: return or transfer the cap in the same transaction.

{% hint style="info" %}
The compiler is on your side. A Move error usually means the code really was wrong, so treat "make the error go away" as a different request from "make the code correct".
{% endhint %}
