# `@emoji-mart/vue` — Design Spec

**Date:** 2026-06-14  
**Status:** Approved

## Overview

Add a `packages/emoji-mart-vue` workspace to the monorepo that exports a Vue 3 `<EmojiPicker>` component, mirroring `@emoji-mart/react` in scope, structure, and build tooling. MVP ships without TypeScript types (`// @ts-nocheck`); typed follow-up is planned separately.

## Scope

- **In:** `Picker` wrapper component only
- **Out:** `Emoji` wrapper (the `<em-emoji>` custom element works in Vue natively without a wrapper)
- **Out:** TypeScript prop types (deferred to follow-up; same situation as the existing React package)

## Package structure

```
packages/emoji-mart-vue/
  vue.ts          # single source file
  package.json
  README.md
  LICENSE         # copy from root
```

Root `package.json` gets one new script: `"build:vue": "yarn workspace @emoji-mart/vue build"`.

## `package.json`

```json
{
  "name": "@emoji-mart/vue",
  "version": "1.0.0",
  "description": "Vue wrapper for Emoji Mart; the emoji picker for the web.",
  "license": "MIT",
  "source": "vue.ts",
  "main": "dist/main.js",
  "module": "dist/module.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "parcel build --no-autoinstall",
    "prepublishOnly": "yarn build"
  },
  "peerDependencies": {
    "emoji-mart": "^5.2",
    "vue": "^3.0"
  },
  "files": ["/dist", "LICENSE"]
}
```

## Component implementation (`vue.ts`)

```ts
// @ts-nocheck
import { defineComponent, h, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Picker } from 'emoji-mart'

export default defineComponent({
  setup(_, { attrs }) {
    const el = ref(null)
    const instance = ref(null)

    onMounted(() => {
      instance.value = new Picker({ ...attrs, ref: el.value })
    })

    watch(attrs, (newAttrs) => {
      instance.value?.update(newAttrs)
    }, { deep: true })

    onBeforeUnmount(() => {
      instance.value = null
    })

    return () => h('div', { ref: el })
  },
})
```

### Design decisions

**`attrs` instead of declared `props`**  
All attributes passed to the component fall through to `attrs`. We spread them directly into `new Picker()`. This avoids duplicating all ~30 PickerProps as Vue runtime prop declarations. No prop autocomplete in this MVP (same as the React package).

**`ref` over `useTemplateRef`**  
`useTemplateRef` is Vue 3.5+ and designed for SFC template refs. A plain `ref` passed as the `ref` prop to a VNode in a render function is the correct and simpler approach. Targets Vue `^3.0`.

**`onBeforeUnmount` cleanup**  
Nullifying `instance.value` on unmount matches the React wrapper's cleanup pattern (`instance.current = null`).

**`watch(attrs, ..., { deep: true })` for reactive updates**  
Equivalent to the React wrapper calling `instance.current.update(props)` on every render. `attrs` in Vue is reactive; watching it drives prop updates into the Picker instance. Deep watch is required because some props (e.g. `data`, `custom`) are objects — a shallow watch would miss inner mutations.

## Peer Dependencies

| Package | Range | Reason |
|---|---|---|
| `emoji-mart` | `^5.2` | Same as React wrapper |
| `vue` | `^3.0` | No 3.3+/3.5+ features used |

## Build

Parcel (`parcel build --no-autoinstall`), same as `@emoji-mart/react`. No additional Parcel plugins needed — the source is plain TypeScript with Vue imports, no `.vue` SFC files.

## Usage (README)

```sh
npm install --save emoji-mart @emoji-mart/data @emoji-mart/vue
```

```vue
<script setup>
import data from '@emoji-mart/data'
import EmojiPicker from '@emoji-mart/vue'
</script>

<template>
  <EmojiPicker :data="data" @emoji-select="console.log" />
</template>
```

## Follow-up (out of scope for MVP)

- Add `EmojiPickerProps` TypeScript interface + `DefineComponent<EmojiPickerProps>` type cast — gives full prop autocomplete in Volar
- Backport equivalent types to `@emoji-mart/react` (remove `// @ts-nocheck`)
- `Emoji` component wrapper if demand warrants it
