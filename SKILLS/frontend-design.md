---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

## Skill Overview

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## When to Use This Skill

Use this skill when:
- Building web components, pages, or applications
- Creating UI designs for sinking fund platform
- Designing user interfaces for any web application
- Implementing visual improvements or redesigns

## Design Thinking Process

Before coding, understand the context and commit to a BOLD aesthetic direction:

### 1. Understand Purpose
- What problem does this interface solve?
- Who uses it?
- What are the key actions users need to perform?

### 2. Choose Aesthetic Direction
Pick an extreme direction and execute with precision:
- **Brutally minimal**: Stark, functional, high contrast
- **Maximalist chaos**: Vibrant, layered, unexpected
- **Retro-futuristic**: Neon, cyberpunk, analog-digital blend
- **Organic/Natural**: Earthy, flowing, botanical
- **Luxury/refined**: Elegant, gold accents, premium feel
- **Playful/toy-like**: Colorful, rounded, playful interactions
- **Editorial/magazine**: Typography-focused, sophisticated layouts
- **Brutalist/raw**: Exposed structure, industrial feel
- **Art deco/geometric**: Geometric patterns, bold shapes
- **Soft/pastel**: Gentle colors, dreamy atmosphere
- **Industrial/utilitarian**: Functional, stark, purpose-driven

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

### 3. Identify Constraints
- Technical requirements (framework, performance, accessibility)
- Browser support needs
- Mobile responsiveness requirements
- Loading time targets

### 4. Differentiation
What makes this **UNFORGETTABLE**?
- What's the one thing someone will remember?
- How can this stand out from competitors?
- What unexpected design choice can we make?

## Implementation Guidelines

### Core Principles

1. **Production-Grade Code**
   - Must be functional and working
   - Follow best practices (accessibility, performance)
   - Clean, maintainable code structure

2. **Visually Striking**
   - Create memorable interfaces
   - Avoid generic templates
   - Make unexpected, characterful design choices

3. **Cohesive Design**
   - Clear aesthetic point-of-view
   - Consistent use of chosen direction
   - Intentional at every level

4. **Meticulous Details**
   - Refine every interaction
   - Polish every animation
   - Perfect every spacing decision

## Frontend Aesthetics Guidelines

### Typography

**Choose Characterful Fonts**
- Avoid: Arial, Inter (as body), Roboto, system fonts
- Prefer: Distinctive pairings that elevate aesthetics
- Pattern: Unique display font + refined body font

**Recommended Font Pairings**:
- Display: DM Serif Display, Playfair Display, Space Grotesk (varied usage)
- Body: Inter (only if distinctive pairing), Georgia, Merriweather
- Monospace: JetBrains Mono, Fira Code, SF Mono

**Usage**:
- Headlines: Display font (distinctive, memorable)
- Body: Body font (readable, refined)
- Financial data: Monospace (tabular-nums, precision)

### Color & Theme

**Commit to Cohesive Aesthetic**
- Use CSS variables for consistency
- Dominant colors with sharp accents
- Avoid timid, evenly-distributed palettes

**Color Theory**:
- **Primary**: Main background/brand color (60-70% usage)
- **Accent**: 1-2 punchy colors for CTAs/highlights (15-20%)
- **Neutral**: Supporting colors for text/structure (10-20%)

**Example: Sinking Fund Platform**
```css
:root {
  --color-primary: #F6F5EC;      /* Warm cream (dominant) */
  --color-accent: #6B8E6B;       /* Sage green (punchy) */
  --color-secondary: #C4956A;    /* Terracotta (accent) */
  --color-text: #1A1A1A;         /* Charcoal (neutral) */
}
```

### Motion & Animations

**Prioritize Impact Over Quantity**
- High-impact moments over scattered micro-interactions
- One well-orchestrated page load vs. many tiny animations
- Use scroll-triggering and hover states that surprise

**Animation Strategy**:
1. **Page Load**: Staggered reveals with animation-delay
2. **Hover States**: Transform, scale, color shifts
3. **Scroll**: Parallax, fade-ins, element appearances
4. **Micro-interactions**: Button presses, form inputs

**Implementation**:
- HTML/CSS: Use CSS-only solutions
- React: Use Framer Motion for complex sequences
- Avoid: Over-animation (causes motion sickness)

**Example: Staggered Reveal**
```css
.staggered-reveal > * {
  animation: fadeInUp 0.5s ease-out backwards;
}

.staggered-reveal > *:nth-child(1) { animation-delay: 0.1s; }
.staggered-reveal > *:nth-child(2) { animation-delay: 0.2s; }
.staggered-reveal > *:nth-child(3) { animation-delay: 0.3s; }
.staggered-reveal > *:nth-child(4) { animation-delay: 0.4s; }
```

### Spatial Composition

**Break Predictable Patterns**
- Asymmetry over centered symmetry
- Overlap elements for depth
- Diagonal flow over horizontal grids
- Generous negative space OR controlled density
- Grid-breaking elements

**Techniques**:
- **Offset layouts**: Elements not perfectly aligned
- **Layered content**: Cards overlapping sections
- **Hero transitions**: Large elements crossing section boundaries
- **Diagonal sections**: Split sections at angles
- **Floating elements**: Cards or content that break the grid

### Backgrounds & Visual Details

**Create Atmosphere and Depth**
- Avoid default solid colors
- Add contextual effects matching aesthetic

**Creative Effects**:
- Gradient meshes
- Noise textures
- Geometric patterns
- Layered transparencies
- Dramatic shadows
- Decorative borders
- Custom cursors
- Grain overlays

**Example: Grain Overlay**
```css
.grain-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}
```

## What to Avoid (Anti-Patterns)

**Never Use Generic Aesthetics**:
- ❌ Overused fonts: Arial, Inter, Roboto, system fonts
- ❌ Cliched color schemes: Purple gradients on white
- ❌ Predictable layouts: Standard card grids, centered hero
- ❌ Cookie-cutter design: Bootstrap-like, Material-default

**Avoid Common "AI Slop"**:
- ❌ Space Grotesk in every project (it's overused)
- ❌ Indigo/Purple primary color everywhere
- ❌ Rounded corners everywhere without intention
- ❌ Same component library across all projects

**Design Specificity**:
- ✅ Vary between light/dark themes per project
- ✅ Vary aesthetics between projects
- ✅ Unexpected font choices that fit context
- ✅ Context-specific character and details

## Match Implementation Complexity to Vision

### Minimalist Designs
- Restraint, precision, careful attention
- Small details matter most
- Typography as primary visual element
- Subtle animations (not flashy)
- Perfect spacing and alignment

### Maximalist Designs
- Elaborate code with extensive animations
- Many layers and visual effects
- Bold, chaotic, memorable
- Complex interactions
- Rich textures and gradients

**Elegance comes from executing the vision well**, not from following trends.

## Sinking Fund Platform - Example Design

### Chosen Aesthetic: **Modern Ledger**

**Concept**: Sophisticated, editorial-inspired interface treating financial data with elegance. Like high-end accounting meets contemporary design.

### Design Decisions

**Color Palette**:
- Primary: Warm cream (#F6F5EC) - dominant background
- Accent: Sage green (#6B8E6B) - CTAs and highlights
- Secondary: Terracotta (#C4956A) - secondary actions
- Text: Deep charcoal (#1A1A1A) - high contrast

**Typography**:
- Display: DM Serif Display (sophisticated, financial)
- Body: Inter (readable, clean)
- Monospace: JetBrains Mono (financial precision)

**Visual Elements**:
- Cards with subtle top border accent (sage)
- Generous spacing (16px-24px)
- Soft shadows (no harsh outlines)
- Rounded corners (12px-16px)
- Hover lift effect (subtle transformation)

**Animations**:
- Page load: Staggered card reveals
- Hover: TranslateY -2px, shadow increase
- Button: Active scale 0.98
- Cards: Transition 0.3s cubic-bezier

### Component Examples

**Card Component**:
```tsx
function Card({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-white border border-black/[0.06] shadow-sm',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border-2 border-sage/30'
  }

  return (
    <div className={cn('relative rounded-xl p-6 transition-all', styles[variant])}>
      {/* Subtle accent border top */}
      <div className="absolute top-0 left-6 right-6 h-0.5 bg-sage/60" />
      {children}
    </div>
  )
}
```

**Button Component**:
```tsx
function Button({ variant = 'primary', children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg',
        variant === 'primary' && 
          'bg-sage text-white hover:bg-sage-hover hover:shadow-accent active:scale-[0.98]',
        variant === 'outline' && 
          'border-2 border-sage text-sage hover:bg-sage-dim active:scale-[0.98]'
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Data Table Component**:
```tsx
function DataTable({ data, columns }) {
  return (
    <table className="w-full border-collapse separate border-spacing-0">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-charcoal-muted">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-black/[0.02] transition-colors">
            {columns.map((col) => (
              <td key={col.key} className="px-4 py-4 bg-white border-b border-black/[0.06]">
                <span className="font-mono tabular-nums">{col.render(row)}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Implementation Checklist

- [ ] Chosen aesthetic direction is clear and bold
- [ ] Typography is distinctive and not generic
- [ ] Color palette is cohesive and intentional
- [ ] Animations enhance UX without being overwhelming
- [ ] Layout breaks predictable patterns
- [ ] Backgrounds create atmosphere and depth
- [ ] Code is production-grade and functional
- [ ] Details are meticulously refined
- [ ] Design is memorable and differentiates from competitors

## Creative Constraints

**You are capable of extraordinary creative work. Don't hold back!**

- Show what can be created when thinking outside the box
- Commit fully to chosen aesthetic direction
- Vary designs between projects (no convergence)
- Make unexpected choices that feel genuinely designed
- Elegance through execution, not complexity

**Remember**: The goal is production-grade interfaces that users love and remember, not just functional applications. Design with intention, precision, and creativity.

---

## Examples of Unexpected Design Choices

### Instead of: Standard centered hero
```tsx
// Predictable
<div className="text-center py-20">
  <h1>Welcome</h1>
</div>

// Unexpected - Diagonal split
<div className="relative overflow-hidden">
  <div className="transform -rotate-6 bg-sage text-white p-20">
    <h1>Welcome</h1>
  </div>
</div>
```

### Instead of: Standard card grid
```tsx
// Predictable
<div className="grid grid-cols-3 gap-6">
  {cards.map(card => <Card key={card.id}>{card}</Card>)}
</div>

// Unexpected - Asymmetric layout
<div className="grid grid-cols-12 gap-6">
  <Card className="col-span-7 row-span-2" />
  <Card className="col-span-5" />
  <Card className="col-span-5" />
  <Card className="col-span-4" />
</div>
```

### Instead of: Standard form inputs
```tsx
// Predictable
<input className="border rounded p-3" />

// Unexpected - Floating label with animation
<div className="relative">
  <input className="peer border-b-2 border-charcoal focus:border-sage" />
  <label className="absolute transition-all peer-focus:-top-2 peer-focus:text-xs">
    Email
  </label>
</div>
```

---

## References and Inspiration

When stuck for ideas, reference:

- **Magazine layouts**: Editorial design, asymmetric grids
- **Financial apps**: Bloomberg, Monzo, N26 (for data presentation)
- **E-commerce**: High-end brands (unique interactions)
- **Art movements**: Bauhaus, Art Deco, Brutalism

**Key principle**: Take inspiration, don't copy. Make it your own.

---

## Notes for OpenCode Agents

**When using this skill**:
1. Read the skill instructions fully
2. Understand the project context
3. Choose a specific aesthetic direction
4. Execute with precision and creativity
5. Avoid generic choices and AI slop
6. Test and refine until it's production-grade

**Remember**: Users remember distinctive design. Make each project unforgettable.

---

**Skill Version**: 1.0  
**Last Updated**: January 2025
