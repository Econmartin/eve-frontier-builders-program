---
duration: 8 min
description: Choosing an AI coding tool and giving it a Frontier environment it can actually work in.
---

# Setting up AI-assisted development

An AI coding assistant is only as useful as what it can see and run. Before you pick a tool, set up the environment it will work in: a local Sui network, the Frontier example code, and the docs.

## Kinds of tool

{% tabs %}
{% tab title="In your editor" %}
Assistants built into your code editor, such as Cursor or GitHub Copilot. They see the files you have open, suggest code as you type, and can make edits across a project when you ask.
{% endtab %}

{% tab title="In your terminal" %}
Agents that run in a terminal, such as Claude Code. They read the whole repository, run commands like `sui move build`, read the output and try again. Good for multi-step work such as "build this extension and fix whatever fails".
{% endtab %}

{% tab title="In a chat window" %}
General chat assistants. Useful for explaining a concept or an error, but they can't see your project or run anything, so you copy context in and code out by hand.
{% endtab %}
{% endtabs %}

Any of these works for Frontier. Start with whichever fits how you already work; the habits in this pillar apply to all of them.

## Give it somewhere to run code

An assistant that can build and test its own code catches most of its own mistakes. The quickest way to give it that is the builder scaffold running on a local network.

```excerpt
source: builder-documentation
file: quickstart/environment-setup.md
heading: "Recommended: Docker (any OS)"
```

Once that's running, open the `builder-scaffold` folder in your tool. The example Move contracts and dApps in it are the best context you can give an assistant: real Frontier code it can read and copy patterns from.

## Give it the right sources

Assistants are trained on older code and often mix up Sui's APIs across versions, or invent Frontier functions that don't exist. Point yours at the source of truth:

- [world-contracts](https://github.com/evefrontier/world-contracts), the [World Contracts](../glossary/world-contracts.md) themselves
- [builder-scaffold](https://github.com/evefrontier/builder-scaffold), working examples for each [Smart Assembly](../glossary/smart-assembly.md)
- [builder-documentation](https://github.com/evefrontier/builder-documentation), the official builder docs

Clone the first two next to your project so the assistant can search them.

{% hint style="danger" %}
Never paste a private key, a recovery phrase or the contents of a `.env` file into an assistant. Anything you paste may be stored by the tool's provider.
{% endhint %}
