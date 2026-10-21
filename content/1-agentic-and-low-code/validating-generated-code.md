---
duration: 8 min
description: Using AI responsibly and checking what it writes before it reaches the live game.
---

# Validating generated code

Code from an assistant or a low-code tool is a draft. On chain, a mistake can lose real assets and can't be undone, so check generated code at least as carefully as code you wrote yourself.

## Before you trust it

- **Read it.** If you can't explain what a function does, ask until you can, or don't ship it.
- **Build it.** `sui move build` catches a lot. A build that only passes after the assistant deleted checks isn't a pass.
- **Check it against Frontier patterns.** Generated code that ignores how the world contracts expect to be used is the most common problem.
- **Test it locally, then on testnet.** Run it on localnet with the builder scaffold first, then testnet. Only then think about [Stillness](../glossary/stillness.md).

## The patterns to check

Extensions authorise themselves on an assembly with a typed witness. If generated code tries to get around this, it's wrong.

```excerpt
source: builder-documentation
file: smart-contracts/move-patterns-in-frontier.md
heading: Witness pattern (typed extension)
```

Also check that:

- every borrowed [OwnerCap](../glossary/owner-cap.md) is returned in the same transaction
- payment and reward happen in one transaction, never split across two
- quantities and access rules are enforced in Move, not only in a dApp's interface
- package and object IDs match the network you're deploying to

## Keep signing to yourself

{% hint style="danger" %}
Never let an assistant or a tool hold your keys or sign transactions for you. It can prepare a transaction; you read it in [EVE Vault](../glossary/eve-vault.md) and decide.
{% endhint %}
