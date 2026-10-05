# UI Coding Standards

These rules apply to all UI code throughout this project.

## Components

- **ONLY shadcn/ui components may be used for the UI.**
- **ABSOLUTELY NO custom components may be created.** Do not write bespoke UI components (wrappers, composites, "helper" components, or one-off widgets), even for small pieces.
- Build every screen by composing shadcn/ui components directly inside pages and layouts.
- If a piece of UI is needed, find the matching shadcn/ui component and add it with the CLI:

  ```bash
  npx shadcn@latest add <component>
  ```

- Components added by the CLI live in `components/ui/`. Use them as generated; do not hand-edit them to change their behaviour.
- Layout and spacing use Tailwind utility classes on the shadcn/ui components and on plain semantic HTML elements (`main`, `section`, `h1`, `ol`, ...). Do not introduce component abstractions to hold that markup.

## Date formatting

- All date formatting MUST be done with [date-fns](https://date-fns.org/). Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or manual string building.
- Dates are formatted as: ordinal day, abbreviated month, full year.

  | Example      |
  | ------------ |
  | 1st Sep 2025 |
  | 2nd Aug 2025 |
  | 3rd Jan 2026 |
  | 4th Jun 2024 |

- The date-fns format string for this is `"do MMM yyyy"`:

  ```ts
  import { format } from "date-fns";

  format(new Date(2025, 8, 1), "do MMM yyyy"); // "1st Sep 2025"
  ```
