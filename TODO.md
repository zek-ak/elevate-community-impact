# Home Page Styling Update Plan

## Objective
Update the home page visual design to match a classic church aesthetic with navy blue tones while preserving navigation structure and functionality.

## Information Gathered
- **Current Design**: Uses gold/emerald accents with warm cream background
- **Project Setup**: React + TypeScript + Tailwind CSS + Framer Motion
- **Target Design**: Traditional church blue (#1a365d) with clean, classic styling
- **Files to modify**: 
  - tailwind.config.ts (color system)
  - src/index.css (CSS variables)
  - src/pages/Index.tsx (main page styling)
  - src/components/church/Header.tsx (styling only, not structure)
  - src/components/church/StatsCard.tsx
  - src/components/church/LeaderboardItem.tsx
  - src/components/church/ProgressRing.tsx

## Color System (Church Blue Theme)
- Primary: Deep Navy Blue (#1a365d)
- Primary Light: #2c5282
- Primary Dark: #1a202c
- Secondary: Warm Cream (#f7f5f0)
- Accent: Gold (#c6a052)
- Background: Off-white (#fafafa)
- Card Background: White (#ffffff)
- Text: Dark Gray (#2d3748)

## Plan

### Step 1: Update tailwind.config.ts
- Add church-blue color palette
- Keep existing font configuration (DM Serif Display + Plus Jakarta Sans)

### Step 2: Update src/index.css
- Replace CSS variables with church blue theme
- Update gradient and shadow definitions
- Keep animation utilities

### Step 3: Update src/components/church/Header.tsx
- Apply church blue styling to header
- Keep exact navigation structure unchanged

### Step 4: Update src/pages/Index.tsx
- Hero section: Deep blue gradient background
- Stats cards: White cards with subtle shadows
- Progress rings: Church blue color
- Buttons: Blue with gold hover accent
- Footer: Simple church-style footer

### Step 5: Update StatsCard, LeaderboardItem, ProgressRing
- Apply consistent card styling
- Subtle shadows, rounded corners
- Hover animations

### Step 6: Test and verify
- Ensure responsiveness
- Verify no breaking changes
- Check mobile layout

## Dependent Files to Edit
- tailwind.config.ts
- src/index.css
- src/pages/Index.tsx
- src/components/church/Header.tsx
- src/components/church/StatsCard.tsx
- src/components/church/LeaderboardItem.tsx
- src/components/church/ProgressRing.tsx

