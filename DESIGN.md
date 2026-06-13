# Design System: Community Heroes

## 1. Visual Theme & Atmosphere

Community Heroes should feel like a premium Mobile Legends tournament platform built for mobile-first competition. The atmosphere is dark, sharp, and energetic without becoming noisy. The visual language combines three influences:

- **Linear** for precision, hierarchy, and calm dark surfaces
- **Supabase** for disciplined dark layering and restrained glow usage
- **Current Community Heroes DNA** for arena energy through gold and electric-cyan accents

The interface should feel more like a polished esports operations hub than an arcade poster. Use bold headlines, compact metadata, and disciplined spacing. Favor clarity, confidence, and competitive credibility over decorative effects.

### Core mood
- Competitive but formal
- Mobile-first and thumb-friendly
- Premium dark surfaces with strong contrast
- Gold for primary actions and achievement
- Cyan for live, informational, and system accents
- Minimal use of violet or pink, only for atmospheric gradients

### Product personality
- Tournament organizer friendly
- Squad captain focused
- Clean enough for trust and registration flows
- Energetic enough to feel esports-native

## 2. Color Palette & Roles

### Core Backgrounds
- **Arena Void** `#04060d`: Deep page background
- **Night Surface** `#081024`: Primary app shell background
- **Panel Surface** `#0a0e1f`: Default card and hero base
- **Elevated Surface** `#10162b`: Hovered or emphasized surfaces

### Text
- **Primary Text** `#f8fafc`: Main heading and body emphasis
- **Secondary Text** `#cbd5e1`: Standard paragraph text
- **Muted Text** `#94a3b8`: Metadata, placeholders, helper copy
- **Subtle Text** `#64748b`: Fine labels and dividers

### Brand & Accent
- **Hero Gold** `#facc15`: Primary brand accent, key CTA color
- **Gold Glow** `#f59e0b`: Warm extension of primary gradient
- **Electric Cyan** `#22d3ee`: Live states, active filters, informational accent
- **Arena Blue** `#60a5fa`: Cool secondary accent for links and informative UI

### Status
- **Success** `#10b981`
- **Warning** `#f59e0b`
- **Danger** `#ef4444`

### Borders & Overlays
- **Standard Border** `rgba(255,255,255,0.10)`
- **Subtle Border** `rgba(255,255,255,0.06)`
- **Strong Border** `rgba(255,255,255,0.16)`
- **Gold Border** `rgba(250,204,21,0.24)`
- **Glass Fill** `rgba(255,255,255,0.04)`
- **Elevated Fill** `rgba(255,255,255,0.06)`

### Gradients
- **Primary Gradient** `linear-gradient(135deg, #fef08a 0%, #facc15 38%, #f59e0b 100%)`
- **Electric Gradient** `linear-gradient(135deg, #67e8f9 0%, #60a5fa 45%, #818cf8 100%)`
- **Page Atmosphere** `radial-gradient(circle at top left, rgba(250,204,21,0.16), transparent 28%), radial-gradient(circle at top right, rgba(56,189,248,0.14), transparent 24%), linear-gradient(180deg, #081024 0%, #050816 40%, #04060d 100%)`

## 3. Typography Rules

### Font Families
- **Display**: `Rajdhani`, sans-serif
- **Body**: `Inter`, sans-serif
- **Monospace Optional**: system monospace only when needed for IDs, codes, or admin views

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Mobile Hero | Rajdhani | 28–34px | 700 | 1.00–1.05 | 0.04em | Compact, high-impact mobile headline |
| Desktop Hero | Rajdhani | 48–64px | 700 | 1.00–1.04 | 0.05em | Main marketing and page hero headline |
| Section Heading | Rajdhani | 22–32px | 700 | 1.05–1.15 | 0.05em | Major panels and sections |
| Card Title | Rajdhani | 18–22px | 700 | 1.10–1.20 | 0.04em | Compact card titles |
| Body Large | Inter | 16–18px | 400 | 1.60 | normal | Intro paragraphs |
| Body | Inter | 14–16px | 400 | 1.55–1.70 | normal | Main body text |
| UI Label | Inter | 12–13px | 600 | 1.40 | 0.08em | Labels, chips, support headings |
| Micro Label | Rajdhani | 9–11px | 700 | 1.20 | 0.18em | Overlines and stat labels |

### Typography principles
- Use Rajdhani for anything that should feel competitive or structural
- Use Inter for readability and form interactions
- Keep hero text dense and short
- Avoid oversized mobile body copy
- Prefer uppercase only for short labels, tabs, and overlines
- Never turn long paragraphs into uppercase text

## 4. Component Stylings

### Buttons

**Primary CTA**
- Use the gold gradient
- Text should be dark, never white
- Radius: `14px` mobile, `16px` desktop
- Weight: bold, uppercase for short labels
- Shadow should glow softly, not bloom heavily

**Secondary CTA**
- Dark translucent background
- Thin white border
- White text with gold hover accent
- Same height as primary for paired actions

**Danger CTA**
- Solid red background with restrained emphasis
- Reserve for destructive actions only

### Cards
- Background should be translucent dark, not flat black
- Borders should be subtle and crisp
- Use large radii: `18px` to `28px` depending on component size
- Depth should come from border contrast and soft shadow, not exaggerated glassmorphism

### Hero Panels
- Hero cards should feel like command centers
- Keep content tight on mobile
- Stats should appear as grouped bands, not detached floating cards
- Actions should sit below hierarchy, not interrupt it

### Inputs
- Background: translucent dark fill
- Border: subtle white alpha
- Radius: `16px`
- Placeholder: muted slate
- Focus: gold or cyan ring depending on context

### Pills & Chips
- Use pills for filters, statuses, and metadata only
- Mobile pills must prefer one-line rails or compact grouped grids
- Avoid oversized pills that force multiple lines when the content can fit horizontally

### Navigation
- Sidebar should remain the single navigation system on mobile and desktop
- Top bar should be compact, with strong account and notification affordances
- Do not duplicate navigation at the bottom if sidebar already exists

## 5. Layout Principles

### Spacing
- Base unit: `8px`
- Tight mobile rhythm: `8 / 12 / 16 / 20 / 24`
- Desktop rhythm: `12 / 16 / 24 / 32 / 48 / 64`

### Density
- Community Heroes should be denser than a marketing site, but cleaner than a dashboard overload
- Mobile must feel trimmed and efficient
- Avoid large empty hero regions on phones
- Avoid stacking too many detached cards above the fold

### Alignment
- Keep left alignment for most content
- Use centered layouts only for isolated auth or empty states
- Group related stats into bands, not separate floating containers

### Width behavior
- Mobile layouts should fit important information in one screen without feeling cramped
- Desktop should breathe more, but preserve the same hierarchy

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 | Page gradient background only | Body and shell |
| Level 1 | Dark translucent fill + subtle border | Default cards |
| Level 2 | Slightly lighter fill + stronger border | Hover or focused card |
| Level 3 | Gold or cyan accent border + soft glow | Primary callout, live state, active CTA |

### Depth rules
- Use glow as emphasis, not ambient default
- Gold glow means reward, action, or primary status
- Cyan glow means live, active, or informational state
- Avoid heavy blur stacks that make text feel soft

## 7. Do's and Don'ts

### Do
- Design mobile first
- Keep the first screen useful and content-forward
- Use grouped information bands for stats
- Make tournament and scrim surfaces feel formal and trustworthy
- Use gold for action, cyan for live/info, red for destructive only
- Keep headings strong and compact
- Make captain workflows obvious and low-friction

### Don’t
- Don’t let pills or stat boxes become oversized on phones
- Don’t stack detached mini-cards when one grouped panel would work better
- Don’t use decorative FPS language like “loadout” when the product is MLBB tournament focused
- Don’t overload screens with gradients, glows, and badges at the same time
- Don’t use huge empty areas above the fold on mobile
- Don’t duplicate navigation systems

## 8. Responsive Behavior

### Breakpoints
- **Mobile**: under `640px`
- **Tablet**: `640px–1024px`
- **Desktop**: above `1024px`

### Mobile-first behavior
- Shrink headline sizes aggressively on phones
- Keep stat groups in one row when conceptually linked
- Prefer horizontal rails for filters before allowing a second line
- Reduce hero padding and card height before shrinking text too far
- Keep important actions within thumb reach and within the first viewport

### Desktop behavior
- Preserve the same hierarchy, only with more breathing room
- Avoid reintroducing detached card clutter just because more width exists
- Group related metadata consistently across both mobile and desktop

## 9. Agent Prompt Guide

### Best-fit reference sources
- Use **Linear** for structural precision and mobile-friendly dark hierarchy
- Use **Supabase** for dark restraint and border-led depth
- Do not copy these brands directly; adapt them to Community Heroes gold/cyan identity

### Quick prompt examples
- "Use DESIGN.md to redesign the login page as a mobile-first MLBB landing page with free tournaments, scrimmages, and prize events."
- "Use DESIGN.md to simplify the tournament hero so stats feel grouped and realistic on mobile."
- "Use DESIGN.md to refactor squad pages into a formal esports management interface with tighter spacing."
- "Use DESIGN.md to make filter pills fit on one row or horizontal rail before wrapping."

### Implementation notes for this project
- Respect the current `Rajdhani + Inter` font pairing
- Keep the existing gold-and-cyan palette foundation
- Prioritize mobile readability over cinematic empty space
- Favor one strong hero, one grouped stats area, and one clear action row
