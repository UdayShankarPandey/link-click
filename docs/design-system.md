# Link Click — Design System Specification

## 1. Design Philosophy

Link Click's visual identity is **modern, minimal, premium, human, calm, and accessible**.

The UI is designed to celebrate visual content. The interface acts as a refined frame that complements community posts without competing for attention.

### Core Principles
- **Restraint over Flash**: Avoid excessive neon accents, heavy glowing gradients, laser effects, or distracting glassmorphism.
- **Subtle Elevation**: Depth is communicated primarily through clean border contrasts (`#1f1f25`, `#2a2a30`, `#2a2a32`) and soft surfaces, rather than heavy drop shadows.
- **Purposeful Motion**: Micro-interactions (like-pops, subtle fades, slide-ups) exist to confirm user intent and provide intuitive feedback, not for visual noise.
- **Human & Calm**: Warm dark tones (`#111113` canvas, `#E8A838` amber accent) create a cozy, high-end photographic studio aesthetic.
- **Accessibility First**: Color contrast, keyboard focus indicators, and screen reader attributes are integrated into every component by default.

---

## 2. Color System

Link Click uses a curated dark mode palette built with CSS variables under Tailwind CSS v4 `@theme`.

### Base Surfaces & Canvas
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-canvas` | `#111113` | Main app background canvas |
| `--color-surface` | `#1a1a1f` | Cards, forms, panels, navbar dropdowns |
| `--color-surface-raised` | `#222228` | Secondary containers, active item backgrounds |
| `--color-surface-overlay` | `#2a2a32` | Modal overlays, hover states on cards |

### Border Tokens
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-border` | `#2a2a30` | Primary container borders |
| `--color-border-subtle` | `#1f1f25` | Inner dividers, subtle list item borders |

### Brand & Accent Palette
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-amber` | `#E8A838` | Primary brand hero color, active tabs, primary buttons |
| `--color-amber-hover` | `#F0B84C` | Primary button hover state |
| `--color-amber-muted` | `#E8A83820` | Subtle active badges, icon background fills |
| `--color-amber-glow` | `#E8A83812` | Subdued focus rings and glow highlights |
| `--color-coral` | `#E85D5D` | Heart likes, engagement badges |
| `--color-teal` | `#3DBBA0` | Success badges, verified indicators |
| `--color-danger` | `#D35454` | Destructive buttons, error alerts |
| `--color-danger-muted` | `#D3545418` | Error alert background fill |

### Text & Content Scale
| Token | Hex Value | Contrast against Canvas | Usage |
| :--- | :--- | :--- | :--- |
| `--color-text-primary` | `#F5F0E8` | ~14.8:1 (AAA) | Main headings, body text, primary actions |
| `--color-text-secondary` | `#9A9690` | ~6.5:1 (AA) | Subtitles, labels, secondary metadata |
| `--color-text-tertiary` | `#8C8780` | ~4.6:1 (AA) | Captions, placeholders, character counts |
| `--color-text-inverse` | `#111113` | ~14.8:1 (AAA) | Text on primary Amber button fills |

---

## 3. Typography Scale

Link Click uses **Inter** via Google Fonts, rendered with antialiased font smoothing (`-webkit-font-smoothing: antialiased`).

| Element | Class Definition | Font Size / Weight | Line Height |
| :--- | :--- | :--- | :--- |
| **Page Header (H1)** | `text-2xl sm:text-3xl font-extrabold tracking-tight` | 24px–30px / 800 | `leading-tight` |
| **Section Header (H2)** | `text-lg sm:text-xl font-bold tracking-tight` | 18px–20px / 700 | `leading-snug` |
| **Card Title (H3)** | `text-base font-bold` | 16px / 700 | `leading-snug` |
| **Body Text** | `text-sm font-normal` | 14px / 400 | `leading-relaxed` |
| **Labels & Buttons** | `text-sm font-semibold` | 14px / 600 | `leading-none` |
| **Captions / Meta** | `text-xs font-medium` | 12px / 500 | `leading-normal` |

---

## 4. Spacing & Page Container Scale

### Spacing Scale
- `1` (4px), `1.5` (6px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `12` (48px).

### Page Max-Width Categories
Page container max-widths are categorized by functional purpose to optimize line-length readability and screen real estate:

| Page Category | Max Width Class | Target Width | Pages |
| :--- | :--- | :--- | :--- |
| **Auth** | `max-w-sm` | 384px | `Login`, `Register`, `CheckEmail`, `VerifyEmail` |
| **Form / Editor** | `max-w-2xl` | 672px | `CreatePost`, `EditPost` |
| **Detail** | `max-w-3xl` | 768px | `PostDetail` |
| **Feed & Profile** | `max-w-5xl` | 1024px | `Home`, `Profile`, `UserProfile` |
| **Admin Dashboard** | `max-w-6xl` | 1152px | `AdminUsers` |

---

## 5. Border Radius System

| Radius Token | CSS Value | Component Application |
| :--- | :--- | :--- |
| `rounded-md` | 6px | Small badges, sub-menu items, icon overlays |
| `rounded-lg` | 8px | Action icon buttons, avatar fallbacks, nav links |
| `rounded-xl` | 12px | Inputs, primary buttons, user avatars, dialog boxes |
| `rounded-2xl` | 16px | Post cards, form cards, modal containers |
| `rounded-full` | 9999px | Circle user avatars, floating action triggers |

---

## 6. Shadows & Elevation

Instead of heavy blur shadows, Link Click relies on surface elevation and border contrast:

- **Base Card**: `bg-surface border border-border`
- **Hover Card**: `border-surface-overlay` transition
- **Modal Overlay**: `fixed inset-0 bg-black/60 backdrop-blur-sm`
- **Modal Container**: `bg-surface-raised border border-border shadow-2xl rounded-2xl`

---

## 7. Motion Principles

Motion in Link Click is fast, subtle, and non-intrusive.

### Keyframe Animations (`index.css`)
- `fade-in`: `opacity: 0 -> 1`, `translateY(8px -> 0)` (350ms ease-out)
- `fade-in-scale`: `opacity: 0 -> 1`, `scale(0.95 -> 1)` (250ms ease-out)
- `slide-up`: `opacity: 0 -> 1`, `translateY(12px -> 0)` (300ms ease-out)
- `overlay-in`: `opacity: 0 -> 1` (200ms ease-out)
- `like-pop`: `scale(1 -> 1.3 -> 1)` (300ms ease-out)
- `shimmer`: Linear gradient animation for loading skeletons (1.5s infinite)

### Accessibility (Reduced Motion)
All animations respect `prefers-reduced-motion: reduce` by clamping animation and transition durations to `0.01ms`.

---

## 8. Button Variants

| Variant | Class Composition |
| :--- | :--- |
| **Primary** | `bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed` |
| **Secondary** | `bg-surface-raised hover:bg-surface-overlay text-text-primary border border-border font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed` |
| **Danger** | `bg-danger hover:bg-danger/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed` |
| **Ghost / Icon** | `p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer` |

### Focus State Standard
All interactive buttons must include:
`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas`

---

## 9. Form Standards

### Field Layout
- **Container**: `space-y-4` or `space-y-5`
- **Field Label**: `block text-sm font-medium text-text-secondary mb-1.5`
- **Text Input / Textarea**: `w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 transition-colors`
- **Dropdown Select**: Matches text input styling with `cursor-pointer` and styled options.
- **Error Banner**: `bg-danger-muted border border-danger/20 text-danger p-3 rounded-xl text-sm flex items-start gap-2`
- **Character Counter**: `text-right text-xs text-text-tertiary mt-1`

---

## 10. Card Standards

### Feed Post Card
- **Container**: `bg-surface rounded-2xl overflow-hidden border border-border hover:border-surface-overlay transition-colors duration-200 group`
- **Media Wrapper**: `relative aspect-16/10 bg-canvas overflow-hidden`
- **Body Content**: `p-4 sm:p-5`
- **Engagement Bar**: `px-4 sm:px-5 pb-4 flex items-center gap-5 border-t border-border/50 pt-3`

---

## 11. Accessibility Principles (WCAG 2.1 AA)

1. **Color Contrast**: All body text achieves ≥ 4.5:1 contrast against surface backgrounds. Tertiary text (`#8C8780`) satisfies AA requirements.
2. **Keyboard Focus**: Interactive elements display distinct focus indicators on keyboard navigation (`focus-visible`).
3. **Screen Readers**: Icon-only buttons contain `aria-label` or `title`. Tab controls use `role="tablist"` and `role="tab"`.
4. **Modal Trapping**: Modals trap focus and close cleanly via `Escape` key or backdrop clicks.

---

## 12. Responsive Philosophy

1. **Breakpoints**: Standard Tailwind breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
2. **Fluid Padding**: Use responsive padding (`px-4 sm:px-6 py-6 sm:py-8`) across all container wrappers.
3. **Touch Targets**: All mobile interactive elements feature at least 44x44px touch targets.
4. **Grid Degradation**: 3-column feeds on desktop collapse smoothly to 2-column on tablet and 1-column on mobile.
