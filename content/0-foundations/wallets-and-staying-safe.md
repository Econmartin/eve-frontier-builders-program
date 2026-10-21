---
description: How your EVE Frontier wallet works, and the habits that keep it safe.
---

# Wallets and staying safe

Everything you own on chain in EVE Frontier sits in a wallet, and that wallet is also how you prove who you are to the game and to tools other players build. In EVE Frontier, that wallet is [EVE Vault](../glossary/eve-vault.md).

## One wallet, two jobs

EVE Vault holds your [EVE Token](../glossary/eve-token.md) and other assets on [Sui](../glossary/sui.md). It also acts as your sign-in: when a player-made dApp wants to know who you are, it asks EVE Vault, and you approve or decline.

The in-game currency, [LUX](../glossary/lux.md), isn't in your wallet. It's tracked by the game and converts to and from EVE Token through an exchange service.

## No seed phrase

Most crypto wallets give you a list of words to write down. EVE Vault doesn't. It uses [zkLogin](../glossary/zklogin.md) to create your wallet from your EVE Frontier sign-in.

```excerpt
source: builder-documentation
file: eve-vault/wallets-and-identity.md
heading: Seamless Onboarding with zkLogin
```

## Staying safe

{% hint style="danger" %}
Install EVE Vault only from the [official releases](https://github.com/evefrontier/evevault/releases). A fake wallet extension can approve transactions you never meant to make.
{% endhint %}

- **Read every approval.** When a dApp asks EVE Vault to sign something, check what it's asking for before you approve. If you don't understand the request, decline it.
- **Be wary of links.** A message urging you to connect your wallet quickly is the most common way people lose assets.
- **Use testnet to experiment.** While you're learning, build and test against testnet, where nothing has real value.
