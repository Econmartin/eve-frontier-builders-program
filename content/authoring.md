---
description: How to write glossary terms and library sections, in GitBook or in Git.
---

# Writing for this space

Pages here are Markdown. Edit them in GitBook or in the repository; Git Sync keeps both in step. Lessons on the site pull these pages in, so a change here shows up in every lesson that uses the page.

## Where things go

| Folder | What it holds | How lessons use it |
| --- | --- | --- |
| `glossary/` | One page per term. The page description is the one-line definition. | Inline term links, and definition cards |
| `library/pillar-N/` | Short sections, filed by pillar, that more than one lesson needs. | Dropped in whole |

Give every page a description in GitBook's page settings. For a glossary term it's the definition shown on hover.

## Linking a glossary term

Link the term to its page, the same way you link any other page.

```markdown
A [Smart Assembly](../../glossary/smart-assembly.md) is a structure players can extend.
```

## Hints

Use GitBook's hint block. The `info`, `success`, `warning` and `danger` styles are supported.

```markdown
{% hint style="danger" %}
Never share a recovery phrase.
{% endhint %}
```

## Tabs

```markdown
{% tabs %}
{% tab title="macOS" %}
Steps for macOS.
{% endtab %}
{% tab title="Windows" %}
Steps for Windows.
{% endtab %}
{% endtabs %}
```

## Quoting the EVE Frontier builder docs

A section can quote the official builder docs instead of copying them:

````markdown
```excerpt
source: builder-documentation
file: eve-vault/wallets-and-identity.md
heading: Seamless Onboarding with zkLogin
```
````

GitBook shows this as a small code block. The site replaces it with that section, pinned to the version recorded in `vendor/manifest.json`. A file has to be in the snapshot first, so ask an engineer to add new ones.

## What isn't supported

Other GitBook blocks, such as cards, steppers and embeds, don't appear on the site yet. The site build fails if a page uses one, so the problem shows up before it goes live.
