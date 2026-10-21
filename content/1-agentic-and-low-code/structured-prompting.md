---
duration: 6 min
description: Writing prompts that give a coding assistant the context it needs to get Frontier code right.
---

# Structured prompting for builders

Most bad output from an assistant comes from a prompt that left something out. A structured prompt answers the questions the assistant would otherwise guess at.

## The five parts

1. **Goal**: what you want to exist when it's done, in one sentence.
2. **Context**: which [Smart Assembly](../glossary/smart-assembly.md), which network, and which files or examples to look at.
3. **Constraints**: what it must not do or change.
4. **Done**: how you'll know it worked, such as "builds with `sui move build`" or "the test passes".
5. **Plan first**: ask for a plan before any code, so you can correct it while that's cheap.

## An example

```text
Goal: a Smart Gate extension that only lets characters in my tribe jump.

Context: start from the gate extension in builder-scaffold/move-contracts.
Use the world-contracts source in ../world-contracts for the gate API.
This runs on localnet only for now.

Constraints: don't change the world contracts. Keep the extension in one
module. Don't add dependencies.

Done: `sui move build` succeeds and the existing gate tests still pass.

Before writing code, explain your plan and which world-contracts functions
you'll call.
```

Compare that with "write a gate that only lets my tribe through". The short version leaves the assistant to guess the API, the network and what "done" means, and it will guess.

{% hint style="warning" %}
Package IDs and object IDs are different on every network. If a prompt involves a real network, give the assistant the IDs for that network from the docs instead of letting it fill them in. [Stillness](../glossary/stillness.md) IDs are listed in the builder docs' Resources page.
{% endhint %}

## Keep the conversation short

Long conversations drift: the assistant loses track of early decisions and starts contradicting them. When a task is done, start a new conversation for the next one and restate the context.

{% hint style="success" %}
Keep a short notes file in your project describing what it is, how to build it and what to avoid. Many tools read a file like this automatically; if yours doesn't, paste it at the start of each conversation.
{% endhint %}
