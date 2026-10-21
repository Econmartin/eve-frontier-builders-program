---
duration: 6 min
description: Connecting assistants to tools and data through MCP, and doing it safely.
---

# MCP-enabled workflows

On its own, an assistant only knows what you paste in and what it was trained on. [MCP](../glossary/mcp.md) lets it reach tools and data directly: read a repository, search documentation, query an API, run a command.

## What it looks like

An MCP server is a small program that offers an assistant a set of tools. You add servers to your assistant's settings, and it calls their tools when a task needs them. For example:

- a **docs** server, so the assistant searches current documentation instead of guessing from training data
- a **GitHub** server, so it can read issues and code in other repositories, such as the world contracts
- a **filesystem** or **shell** server, so it can read your project and run builds

Check what MCP servers your tool supports and how to add them; the setup differs between tools.

## Where it helps in Frontier

The Frontier changes faster than any assistant's training data. Pointing an assistant at live sources keeps it current:

- the [world-contracts](https://github.com/evefrontier/world-contracts) repository for the latest contract code
- the [World API](../glossary/world-api.md) and [GraphQL](../glossary/graphql.md) for real world data while you prototype a tool

## Stay safe

{% hint style="danger" %}
An MCP server runs on your machine with whatever access you give it. Install servers only from sources you trust, and never give one access to a wallet, private key or recovery phrase.
{% endhint %}

- **Grant the least access that works.** A docs search doesn't need to write files.
- **Approve actions.** Most tools ask before an assistant calls a tool; keep that on for anything that changes files or sends data.
- **Treat what comes back as untrusted.** A web page or issue the assistant reads can contain instructions aimed at it. If the assistant suddenly wants to do something you didn't ask for, stop and check why.
