# Client stage 05 — A component library: Material UI

**Branch:** `teach/ch03-client-05-mui`

## Goal

The same page (list + form) with Material Design styling, using MUI (Material UI), the library the book uses.
The behaviour does not change. Compare the JSX of `Users.jsx` and `Signup.jsx` with stage 04.

## New ideas

- **Component library.** Ready-made components (`Card`, `TextField`, `Button`, `List`, …) that already
  look right, work with the keyboard and screen readers, and follow one design.
- **Theme.** `createTheme` sets the colours (`primary`, `secondary`, and the book's own `openTitle` /
  `protectedTitle`), and `ThemeProvider` passes the theme to every component inside it.
- **`CssBaseline`** removes the browser's default styles (for example the 8px margin of `<body>`).
- **The `sx` prop** styles one element. Spacing numbers are theme units: `mt: 5` = `theme.spacing(5)` = 40px.
  A value can be a function of the theme: `color: (theme) => theme.palette.openTitle`.
- **`variant` vs `component`** on `Typography`: `variant="h6"` is how it looks, `component="h2"` is the
  HTML tag it becomes.
- **Importing an image.** `import seashellImg from '../assets/images/seashell.jpg'` gives the image's URL.
  In the production build the file name gets a content hash, so browsers never show an old cached image.
- **A font from npm.** `@fontsource/roboto` puts the font files in the bundle. The book loaded them from
  Google's servers.
- **Small shared components.** `FormError` shows the red error line in every form, so each page does not
  repeat that code.

## What changed

| File | What |
|---|---|
| `package.json` | `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` (MUI's styling engine), `@fontsource/roboto` |
| `src/main.jsx` | imports the Roboto weights |
| `src/App.jsx` | theme, `ThemeProvider`, `CssBaseline`, `<Home />` on top |
| `src/core/Home.jsx` | new: the book's home card with the seashell |
| `src/core/FormError.jsx` | new: error line with an icon |
| `src/assets/images/seashell.jpg` | the book's image |
| `src/user/Users.jsx` | `Paper`, `List`, `ListItem`, `Avatar` instead of `<ul>` / `<li>` |
| `src/user/Signup.jsx` | `Card` as a `<form>`, `TextField`, `Button` |

## Try it

1. Compare stage 04 and 05 side by side: `git diff teach/ch03-client-04-request-helper teach/ch03-client-05-mui -- src/user/Signup.jsx`.
   The logic (state, `handleSubmit`) has not changed; only the JSX has.
2. Click the "Email" label: the field gets the focus (the `id` links them). Type into it: the label moves up.
3. In `App.jsx` change `primary.main` to `'#2e7d32'` (green) and save: every primary button changes.
4. DevTools → Elements → a `Button`: MUI wrote the CSS classes (`css-…`) from the `sx` values.
5. `npm run build`: `dist/assets/` now also has the seashell image and the Roboto font files.

## Exercise

Add a `helperText="At least 6 characters"` to the password `TextField`. Then make the field turn red
while the password is shorter than 6 characters, with the `error` prop (`error={...}`).
