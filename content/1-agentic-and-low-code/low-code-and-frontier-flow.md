---
duration: 15 min
description: Building on EVE Frontier with visual and configuration-driven tools.
---

# Low code and Frontier Flow

[Low code](../glossary/low-code.md) tools let you describe what you want by arranging blocks and filling in settings, then generate the code for you. They're a way in for builders who don't write Move yet, and a fast way for those who do to try an idea.

## From idea to contract

Every low-code tool for the Frontier ends in the same place: real [Move](../glossary/move.md) code that extends a [Smart Assembly](../glossary/smart-assembly.md).

```excerpt
source: builder-documentation
file: smart-assemblies/introduction.md
heading: Programmable Assemblies
```

The useful mental model is a chain: **concept → node → Move lines → compiled package**. A node on a canvas, such as "accept a payment", stands for a few specific lines of generated Move. Changing a setting on the node changes those lines, and moving the node around the canvas changes nothing.

## Frontier Flow

[Frontier Flow](https://github.com/Scetrov/frontier-flow) is a community tool for building Frontier logic as a flow of connected nodes. It validates the flow, generates Move from it and compiles the result in your browser.

## Try it: a vending machine

The exercise below uses the same idea on a small scale. A player puts Feral Data into a Smart Storage Unit and gets EU-40 back. You set the price and the reward, see exactly which Move lines each node produces, and build the package.

```excerpt
source: builder-documentation
file: smart-assemblies/storage-unit/README.md
heading: Introduction
```

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
A successful build means the compiler accepts the code. It doesn't mean the code has been deployed, or that the vending machine's economics make sense. Those are separate steps, covered later.
{% endhint %}
