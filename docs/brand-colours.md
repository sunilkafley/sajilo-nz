# Sajilo NZ brand colour foundation

The shared CSS tokens in `frontend/src/public-layout.css` give public pages a common starting palette. Existing `--green`, `--mint`, and `--line` variables alias these tokens so existing journeys retain their styles.

| Token | Colour | Intended use |
| --- | --- | --- |
| `--brand-ink` | `#10284b` | Primary text and headings |
| `--brand-navy` | `#102e50` | Dark section backgrounds |
| `--brand-teal` | `#006e6c` | Links, controls, and accents |
| `--brand-mint` | `#e8f5f2` | Soft accent surfaces |
| `--brand-surface` | `#ffffff` | Main surfaces and cards |
| `--brand-line` | `#e2eaeb` | Subtle borders |

This is a foundation for incremental adoption, not a claim that every existing hard-coded colour has been migrated. Check text and control contrast against their actual backgrounds when applying these tokens.
