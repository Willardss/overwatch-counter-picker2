# Overwatch Counter Picker


## Hero profile pictures

This app will automatically load hero portraits from:

`/public/images/heroes/<role>/<filename>.webp`

Where:
- `<role>` is one of: `tank`, `damage`, `support`
- `<filename>` follows the pattern: `Icon-<Hero_Name>.webp`

Special cases:
- Soldier: 76 → `Icon-Soldier_76.webp`
- D.Va → `Icon-DVa.webp`

Example path:
`public/images/heroes/damage/Icon-Widowmaker.webp`

If an image is missing, the UI falls back to `public/images/placeholder-hero.svg`.

