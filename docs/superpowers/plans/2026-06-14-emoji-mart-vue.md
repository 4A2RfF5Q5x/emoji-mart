# @emoji-mart/vue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `packages/emoji-mart-vue` workspace that exports a Vue 3 `<EmojiPicker>` component, mirroring `@emoji-mart/react` in scope and structure.

**Architecture:** A single `vue.ts` file uses `defineComponent` with `inheritAttrs: false` and a `setup` function that mounts the emoji-mart `Picker` class into a container `<div>` on `onMounted`, watches `attrs` for prop updates, and cleans up on `onBeforeUnmount`. All props flow through `attrs` to avoid duplicating the ~30 PickerProps as Vue runtime declarations.

**Tech Stack:** Vue 3 (`^3.0`), TypeScript (`// @ts-nocheck`), Parcel (build), Yarn workspaces (monorepo)

---

### Task 1: Create package scaffold

**Files:**
- Create: `packages/emoji-mart-vue/package.json`
- Create: `packages/emoji-mart-vue/LICENSE`

- [ ] **Step 1: Create the package directory and `package.json`**

Create `packages/emoji-mart-vue/package.json`:

```json
{
  "name": "@emoji-mart/vue",
  "version": "1.0.0",
  "description": "Vue wrapper for Emoji Mart; the emoji picker for the web.",
  "license": "MIT",
  "homepage": "https://missiveapp.com/open/emoji-mart",
  "repository": {
    "type": "git",
    "url": "https://github.com/missive/emoji-mart",
    "directory": "packages/emoji-mart-vue"
  },
  "source": "vue.ts",
  "types": "dist/index.d.ts",
  "main": "dist/main.js",
  "module": "dist/module.js",
  "scripts": {
    "build": "parcel build --no-autoinstall",
    "prepublishOnly": "yarn build"
  },
  "peerDependencies": {
    "emoji-mart": "^5.2",
    "vue": "^3.0"
  },
  "devDependencies": {
    "vue": "^3.0"
  },
  "files": [
    "/dist",
    "LICENSE"
  ]
}
```

- [ ] **Step 2: Create `LICENSE`**

Create `packages/emoji-mart-vue/LICENSE` with the same MIT text as `packages/emoji-mart-react/LICENSE`:

```
MIT License

Copyright (c) Missive.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Commit**

```bash
git add packages/emoji-mart-vue/package.json packages/emoji-mart-vue/LICENSE
git commit -m "feat(@emoji-mart/vue): add package scaffold"
```

---

### Task 2: Implement the Vue component

**Files:**
- Create: `packages/emoji-mart-vue/vue.ts`

**Background — why `ref: { current: el.value }`:**  
`packages/emoji-mart/src/components/HTMLElement/HTMLElement.ts:20` reads `props.ref.current` to get the container DOM node and calls `parent.appendChild(this)`. The shape must be `{ current: HTMLElement }` — a plain DOM node passed as `ref` would leave `.current` undefined and the Picker would never mount.

**Background — why `inheritAttrs: false`:**  
Without it Vue automatically forwards all `attrs` as HTML attributes on the root `<div>`, causing browser warnings for non-standard props like `perLine`, `onEmojiSelect`, `data`, etc.

**Background — why `() => ({ ...attrs })` as watch source:**  
`attrs` is a Vue reactive Proxy. Spreading it into a plain object as the getter ensures added/removed keys trigger the callback reliably. `{ deep: true }` handles nested object props like `data`, `custom`, `categories`.

- [ ] **Step 1: Create `vue.ts`**

Create `packages/emoji-mart-vue/vue.ts`:

```ts
// @ts-nocheck
import { defineComponent, h, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Picker } from 'emoji-mart'

export default defineComponent({
  name: 'EmojiPicker',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const el = ref(null)
    const instance = ref(null)

    onMounted(() => {
      instance.value = new Picker({ ...attrs, ref: { current: el.value } })
    })

    watch(() => ({ ...attrs }), (newAttrs) => {
      instance.value?.update(newAttrs)
    }, { deep: true })

    onBeforeUnmount(() => {
      instance.value = null
    })

    return () => h('div', { ref: el })
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add packages/emoji-mart-vue/vue.ts
git commit -m "feat(@emoji-mart/vue): implement EmojiPicker component"
```

---

### Task 3: Create README

**Files:**
- Create: `packages/emoji-mart-vue/README.md`

- [ ] **Step 1: Create `README.md`**

Create `packages/emoji-mart-vue/README.md`:

```markdown
# `@emoji-mart/vue`

A Vue 3 wrapper for [EmojiMart](https://missiveapp.com/open/emoji-mart).

## 🧑‍💻 Usage
\`\`\`sh
npm install --save emoji-mart @emoji-mart/data @emoji-mart/vue
\`\`\`

\`\`\`vue
<script setup>
import data from '@emoji-mart/data'
import EmojiPicker from '@emoji-mart/vue'
</script>

<template>
  <EmojiPicker :data="data" @emoji-select="console.log" />
</template>
\`\`\`

## 📚 Documentation
See https://github.com/missive/emoji-mart
```

- [ ] **Step 2: Commit**

```bash
git add packages/emoji-mart-vue/README.md
git commit -m "docs(@emoji-mart/vue): add README"
```

---

### Task 4: Wire up monorepo

**Files:**
- Modify: `package.json` (root) — add `build:vue` script

- [ ] **Step 1: Add `build:vue` to root `package.json` scripts**

In the root `package.json`, add one entry to the `"scripts"` object after `"build:react"`:

```json
"build:vue": "yarn workspace @emoji-mart/vue build",
```

The scripts block should look like:

```json
"scripts": {
  "dev": "yarn workspace @emoji-mart/website dev",
  "build": "yarn workspace emoji-mart build",
  "build:data": "yarn workspace @emoji-mart/data build",
  "build:react": "yarn workspace @emoji-mart/react build",
  "build:vue": "yarn workspace @emoji-mart/vue build",
  "build:website": "yarn workspace @emoji-mart/website build",
  "check:types": "tsc",
  "prettier": "prettier --check .",
  "prettier:fix": "prettier --write .",
  "test": "jest"
},
```

- [ ] **Step 2: Install dependencies**

From the repo root:

```bash
yarn install
```

Expected: Yarn resolves `vue` into the workspace and hoists it to `node_modules/vue`. No errors.

- [ ] **Step 3: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: register @emoji-mart/vue workspace and add build:vue script"
```

---

### Task 5: Build and verify

**Files:**
- Verify output: `packages/emoji-mart-vue/dist/main.js`
- Verify output: `packages/emoji-mart-vue/dist/module.js`
- Verify output: `packages/emoji-mart-vue/dist/index.d.ts`

- [ ] **Step 1: Run the build**

```bash
yarn build:vue
```

Expected: Parcel compiles `vue.ts`, outputs three files:
```
packages/emoji-mart-vue/dist/main.js      (CJS)
packages/emoji-mart-vue/dist/module.js    (ESM)
packages/emoji-mart-vue/dist/index.d.ts  (types)
```
No errors. Warnings about peer deps are acceptable.

- [ ] **Step 2: Sanity-check the output**

```bash
cat packages/emoji-mart-vue/dist/main.js
```

Expected: the file starts with a CJS wrapper (`"use strict";` or similar), contains `defineComponent`, and does **not** contain any inlined Vue runtime (Vue is a peer dep, not bundled).

Note: `dist/` is listed in `.gitignore` — build output is not committed. It is produced at publish time via `prepublishOnly`.
