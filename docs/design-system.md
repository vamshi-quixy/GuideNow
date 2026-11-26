# GuideNow design system (code)

Tokens live in [`app/design-tokens.css`](../app/design-tokens.css) as Tailwind v4 `@theme` variables, so each token becomes a Tailwind utility.

**Source of truth:** Figma "Test Agent (DS)". It covers Foundations / Typography, Color and Spacing. The Figma system is still a work in progress. Only add tokens here after they exist in Figma.

## Typography

The font is DM Sans, loaded with `next/font` in `app/layout.tsx`. Like Figma, it is rendered at a fixed optical size of 14. Each class sets the font size, line height and weight together.

| Class          | Size / line height | Weight | Figma role               |
| -------------- | ------------------ | ------ | ------------------------ |
| `text-display` | 32 / 40            | 600    | Display / Page Title     |
| `text-h1`      | 28 / 36            | 600    | Heading 1                |
| `text-h2`      | 24 / 32            | 600    | Heading 2                |
| `text-h3`      | 20 / 28            | 600    | Heading 3 (card / panel) |
| `text-body-lg` | 18 / 28            | 400    | Body Large               |
| `text-body-md` | 16 / 24            | 400    | Body Medium (default)    |
| `text-body-sm` | 14 / 20            | 500    | Body Small / Label       |
| `text-caption` | 12 / 16            | 400    | Caption / Helper         |
| `text-micro`   | 8 / 12             | 500    | Micro                    |

The `body` element defaults to `text-body-md`. To change the weight, add a `font-*` class, for example `text-body-md font-medium`.

## Color

Use the **semantic** tokens in product UI. Use primitives only when no semantic token fits.

### Semantic

Each semantic token only works with the utility it is meant for. For example, `text-primary` exists, but `bg-primary` does not.

| Figma group  | Utilities                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text/\*       | `text-primary` `text-secondary` `text-tertiary` `text-disabled` `text-inverse` `text-link` `text-success` `text-warning` `text-error`                                  |
| Background/\* | `bg-page` `bg-surface` `bg-surface-secondary` `bg-elevated` `bg-hover` `bg-selected` `bg-disabled` `bg-inverse`                                                       |
| Border/\*     | `border-subtle` `border-default` `border-strong` `border-hover` `border-focus` `border-disabled` `border-success` `border-error`                                       |
| Action/\*     | `action-primary` `action-primary-hover` `action-primary-pressed` `action-primary-disabled` `action-secondary` `action-secondary-hover` `action-secondary-pressed` `action-danger` `action-danger-hover`. Use any color utility, e.g. `bg-action-primary hover:bg-action-primary-hover` |
| Status/\*     | `status-{success,warning,error,info}-{bg,text,icon}`, e.g. `bg-status-error-bg text-status-error-text`                                                                |
| Focus / Selection | `ring-focus-ring`, `bg-selection-bg`, `border-selection-border`                                                                                                  |

### Primitives

These work with any color utility (`bg-`, `text-`, `border-`, `ring-`, `fill-` and so on).

- `brand-{50…900}`: primary purple. `brand-600` (#502b7f) is the main brand color.
- `peach-{50…900}`, `pink-{50…900}`: secondary palettes. `pink-*` replaces Tailwind's default pink.
- `neutral-{0,50…950}`: replaces Tailwind's default neutral.
- `success-`, `warning-`, `error-`, `info-` `{50,100,500,600,700}`.
- Brand gradient: `bg-linear-to-r from-gradient-start to-gradient-end` (peach-500 → pink-500).

## Components

### Button: [`components/ui/button.tsx`](../components/ui/button.tsx)

Figma: Button / Standard (node 369:73).

```tsx
import { Button } from "@/components/ui/button";

<Button>Save</Button>                                  // primary, md
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="tertiary">Learn more</Button>
<Button variant="danger" loading>Delete</Button>
<Button type="submit" disabled>Save</Button>
```

| Prop       | Values                                                      | Default     |
| ---------- | ----------------------------------------------------------- | ----------- |
| `variant`  | `primary` `secondary` `tertiary` `danger`                   | `primary`   |
| `size`     | `sm` (28px) `md` (36px) `lg` (44px)                         | `md`        |
| `loading`  | Shows a spinner beside the label and blocks clicks          | `false`     |
| `disabled` | Disabled style; wins over `loading`                         | `false`     |

Any native `<button>` attribute also works. `type` defaults to `"button"`. Hover, Pressed and Focus come from CSS (`:hover`, `:active`, `:focus-visible`), so they aren't props.

### Input field: [`components/ui/input-field.tsx`](../components/ui/input-field.tsx)

Figma: Input Field / Text (component set 414:647).

```tsx
import { InputField } from "@/components/ui/input-field";

<InputField label="Website URL" name="url" placeholder="Enter a URL" />
<InputField label="Website URL" required helperText="Use the full link, e.g. https://example.com" />
<InputField label="Website URL" error="Enter a full URL starting with https://" />
<InputField label="Website URL" success="Looks good" />
<InputField label="Website URL" readOnly defaultValue="https://example.com" />
```

| Prop         | Effect                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| `label`      | Required. Linked to the input.                                         |
| `required`   | Adds a red `*` after the label and sets the native `required`.         |
| `helperText` | Grey hint under the field. Hidden while `error` or `success` is shown. |
| `error`      | Red border and message; sets `aria-invalid`. 2px red border on focus.  |
| `success`    | Green border and message.                                              |
| `disabled`, `readOnly` | Grey field styles.                                           |
| `className`  | Applies to the wrapper (label + field + message).                      |

Every other native `<input>` attribute goes to the input. The message is linked with `aria-describedby`. Hover, Focused and Filled come from CSS, so they aren't props. The field fills its container's width.

## Spacing

We use Tailwind's default spacing scale (`--spacing: 0.25rem`, so 1 step = 4px). The Figma spacing variables are named after the same Tailwind steps, so **Figma `Spacing/N` = Tailwind `N`**. For example, `Spacing/4` with `Spacing/3` becomes `p-4 gap-3`. Figma variable names can't contain dots, so decimal steps use a dash in Figma: `Spacing/0-5` → `p-0.5`.

Stick to these steps:

| Figma / utility | px | Figma / utility | px |
| --------------- | -- | --------------- | -- |
| `0.5`           | 2  | `7`             | 28 |
| `1`             | 4  | `8`             | 32 |
| `1.5`           | 6  | `10`            | 40 |
| `2`             | 8  | `12`            | 48 |
| `2.5`           | 10 | `14`            | 56 |
| `3`             | 12 | `16`            | 64 |
| `4`             | 16 | `18`            | 72 |
| `5`             | 20 | `20`            | 80 |
| `6`             | 24 | `22.5`          | 90 |
