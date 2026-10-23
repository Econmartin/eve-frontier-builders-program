---
duration: 15 min
description: A low-code example that builds a Smart Storage Unit vending machine without writing Move by hand.
---

# Frontier Flow

Low-code tools let you describe what you want by arranging blocks and filling in settings, then generate the code for you. Every one of them ends in the same place: real Move code that extends a [Smart Assembly](glossary:smart-assembly).

```glossary
term: move
```

## The storage unit

A vending machine is a storage unit with rules: put the right item in, get a reward out.

```excerpt
source: builder-documentation
file: smart-assemblies/storage-unit/README.md
heading: Introduction
```

## Try it

Set the price and the reward, see exactly which Move lines each node produces, and build the package.

```exercise
id: feral-vending
title: Feral Data vending machine
intro: Select a node to see the Move lines it produces. Change the payment or reward value, watch the code change, then build it.
nodes:
  exchange: The function a player's transaction calls. It takes their Feral Data and returns EU-40.
  accept: Checks the payment is Feral Data and exactly the price, then puts it in the storage unit.
  dispense: Takes the reward out of the storage unit.
  complete: Hands the reward back to the player, which ends the exchange.
  payment: The price, in Feral Data. It becomes a constant that the payment check compares against.
  reward: How much EU-40 the machine gives. It becomes a constant the withdrawal uses.
```

{% hint style="info" %}
A successful build means the compiler accepts the code. It doesn't mean the code has been deployed.
{% endhint %}

## Before you deploy anything

Before you trust code a tool generated for you:

1. **Read it.** If you can't explain a line, find out before going further.
2. **Build it** with `sui move build`, and don't accept a build that only passes because checks were removed.
3. **Test it on localnet,** then on testnet.
4. **Only then** think about [Stillness](glossary:stillness).

{% hint style="danger" %}
Never share a private key or recovery phrase with anyone, and never paste one into a website, chat or AI assistant. EVE Vault doesn't give you one, but other Sui wallets and tools do.
{% endhint %}
