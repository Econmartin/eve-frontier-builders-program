---
description: Everything the Builder Program site teaches from, editable in GitBook or in Git.
---

# Builder Program curriculum

This folder is the GitBook space and the source of the site's Learn pages. Git Sync keeps the two in step, so edit in whichever you prefer. GitBook is for editing: lessons use blocks only the site can show, which GitBook displays as code.

| File | What it is | Address on the site |
| --- | --- | --- |
| `glossary.md` | Every term, A to Z, on one page | `/glossary` |
| `glossary/{term}.md` | The full article for a term that needs more than a definition | `/glossary/{term}` |
| `lessons/{lesson}.md` | A lesson | `/courses/{course}/{module}/{lesson}` |
| `courses/{course}.yaml` | A course: title, description, `pillar`, and its `modules` in order | `/courses/{course}` |
| `modules/{module}.yaml` | A module: title, description, and its `lessons` in order | `/courses/{course}/{module}` |
| `pathways/{pathway}.yaml` | A pathway: title, description, `audience`, the answers it suits under `for:`, and its `courses` in order | `/pathways/{pathway}` |
| `index.yaml` | The Courses and Pathways pages: their text, and which courses and pathways appear, in order | `/courses`, `/pathways` |
| `questions.yaml` | Questions the reader answers, with the text each answer brings | Asked on the Pathways page and in lessons |

GitBook shows the Markdown pages listed in `SUMMARY.md`; add a new lesson or article there too. The YAML files aren't shown in GitBook, so edit courses, modules and pathways in Git.

Courses, modules and pathways refer to each other by file name, without the extension. A module can sit in more than one course and a lesson in more than one module; each place gets its own address, and search engines are pointed at the first. File names become addresses, so keep them short, lowercase and hyphenated, and don't rename one that's already live.

[Writing for this space](authoring.md) covers the formatting.
