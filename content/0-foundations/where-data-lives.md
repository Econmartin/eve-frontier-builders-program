---
duration: 9 min
description: The places EVE Frontier data lives, and which one to reach for.
---

# Where data lives

Before you build anything, it helps to know where the facts about the world are kept. Some live on chain, some are served by the game's own services, and some only exist once someone collects them.

## On chain

The world's rules and the state of every structure live on [Sui](../glossary/sui.md) as the [World Contracts](../glossary/world-contracts.md). A [Smart Assembly](../glossary/smart-assembly.md), such as a storage unit or gate, is an object on chain that anyone can read.

You change on-chain state by sending a transaction. You read it in one of several ways:

{% tabs %}
{% tab title="GraphQL" %}
Ask for objects by type or owner and get back only the fields you need. A good first choice for tools and dashboards. See [GraphQL](../glossary/graphql.md).
{% endtab %}

{% tab title="gRPC" %}
Faster, streaming reads straight from a full node. Useful when you need high throughput, at the cost of more setup.
{% endtab %}

{% tab title="Events" %}
Every change emits events, such as a gate jump. Subscribe to them to react as things happen or to build a history.
{% endtab %}
{% endtabs %}

```excerpt
source: builder-documentation
file: tools/interfacing-with-the-eve-frontier-world.md
heading: Reading from the World
```

## The World API

The [World API](../glossary/world-api.md) serves world data from [Stillness](../glossary/stillness.md) over plain HTTP. It's the quickest way in if you don't want to query the chain yourself.

## Indexers

The chain answers narrow questions well, such as "what's in this storage unit?", but not broad ones, such as "every jump through this gate this week". For those, apps use an [indexer](../glossary/indexer.md), which follows the chain and keeps the answers ready. [Why indexers exist](why-indexers-exist.md) goes into this.

{% hint style="info" %}
Resource files, the game's static data, will be covered here once the guidance on where to get them is agreed.
{% endhint %}
