---
description: How to write and edit lessons, in GitBook or in Git.
---

# Writing lessons

Lessons are Markdown files in this space. Edit them in GitBook or in the repository; Git Sync keeps both in step. The builder portal builds its lesson pages from the same files.

## Where things go

| Folder | What it holds |
| --- | --- |
| `0-foundations/` to `4-move-in-frontier/` | One folder per pillar. The pillar's `README.md` is its overview page and every other file is a module. |
| `glossary/` | One page per term. |
| `SUMMARY.md` | The sidebar. GitBook updates it when you add or move a page. |

To start a module that isn't written yet, open its page and replace the "isn't written yet" hint.

## Every page

Give each page a description in GitBook's page settings. It appears under the title, in search results and in the portal's lesson lists.

## Linking a glossary term

Link the term to its glossary page, the same way you link any other page. The portal shows the term's description when a reader hovers or focuses the link.

```markdown
A [Smart Assembly](../glossary/smart-assembly.md) is a structure players can extend.
```

## Hints

Use GitBook's hint block. The `info`, `success`, `warning` and `danger` styles are supported.

```markdown
{% hint style="info" %}
Nothing in this lesson touches the live game.
{% endhint %}
```

## Quoting the EVE Frontier builder docs

Quote a section of the official builder docs instead of copying it. Add a code block with the language `excerpt`, the file, and the heading of the section you want.

````markdown
```excerpt
source: builder-documentation
file: eve-vault/wallets-and-identity.md
heading: Seamless Onboarding with zkLogin
```
````

GitBook shows this as a small code block. The portal replaces it with that section, pinned to the version of the docs recorded in `vendor/manifest.json`. A file has to be in the snapshot before a lesson can quote it, so ask an engineer to add new files.

## Exercises

Interactive exercises are built in the portal. Place one with a code block with the language `exercise` and the exercise's ID.

````markdown
```exercise
id: feral-vending
```
````

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

## What isn't supported

Other GitBook blocks, such as cards, steppers and embeds, don't appear in the portal yet. The portal build fails if a page uses one, so the problem shows up before the lesson goes live.
