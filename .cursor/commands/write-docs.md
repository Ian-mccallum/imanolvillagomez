# Write Documentation

## Overview

**Documentation is your legacy.** Based on everything above, create documentation that will guide developers and maintainers for years to come. Every word should earn its place. Clear documentation helps preserve the creative vision and technical decisions.

## Your Mission

Review ALL work completed above and document it comprehensively. Don't wait to be told—if it was built, it needs world-class documentation. Leave no feature, component, or creative decision undocumented.

## Steps

1. **Identify what was built above**
   - New components, pages, features
   - Creative layouts, animations, interactions
   - Video-related functionality
   - Changes to existing functionality
   - Configuration or setup changes

2. **Determine documentation needed**
   - Architecture/Design → `documentation/architecture.md`
   - Component Usage → `documentation/components.md` (or component README)
   - How-to Guides → `documentation/guides/` (create if needed)
   - Feature Documentation → Update relevant `documentation/*.md` files
   - Code Comments → Inline documentation in source files

3. **Write with clarity and verification**
   - Every claim verified against actual code
   - Code examples that **actually work**—test them
   - Visual examples where helpful (screenshots, diagrams)
   - If you can't verify it, don't write it

4. **Organize appropriately**
   - Update existing docs in `documentation/` folder
   - Create new docs if structure doesn't exist
   - Cross-reference related documentation
   - Keep documentation index (`documentation/README.md`) updated

5. **Validate & ship**
   - Review for accuracy and clarity
   - Ensure code examples are current
   - Check that links work
   - Update documentation index if new files created

## Documentation Checklist

- [ ] Purpose clearly explained (what and why)
- [ ] Code examples that **actually work**—test them
- [ ] Visual examples where helpful (component usage, layouts)
- [ ] Cross-references to related pages
- [ ] Creative decisions documented (why this design/approach)
- [ ] Technical decisions explained (performance, accessibility)
- [ ] Usage examples for components/features
- [ ] Troubleshooting tips if applicable

## Documentation Structure

### Existing Documentation Files

- `documentation/README.md` - Documentation index
- `documentation/getting-started.md` - Setup and quick start
- `documentation/architecture.md` - System architecture
- `documentation/project-structure.md` - Directory structure
- `documentation/development-guide.md` - Development workflow

### Where to Document What

- **Components** → Component file comments + `documentation/components.md` (if exists)
- **Pages** → Page file comments + update relevant guide
- **Hooks** → Hook file comments + `documentation/development-guide.md`
- **Services/API** → Service file comments + `documentation/services-api.md` (if exists)
- **Styling** → `documentation/styling-guide.md` (if exists)
- **Video Features** → Feature-specific docs or architecture.md
- **Creative Decisions** → Architecture or feature-specific docs

## Writing Guidelines

### For Components

```markdown
## ComponentName

**Purpose**: [What it does and why it exists]

**Usage**:
\`\`\`tsx
<ComponentName prop1="value" prop2={value} />
\`\`\`

**Props**:
- `prop1` (string): Description
- `prop2` (number): Description

**Examples**:
[Real usage examples from the codebase]

**Creative Notes**:
[Why this design/approach was chosen]
```

### For Features

```markdown
## Feature Name

**Overview**: [What this feature does]

**User Experience**: [How users interact with it]

**Technical Implementation**: [How it's built]

**Creative Decisions**: [Design choices and rationale]

**Performance Considerations**: [Optimizations made]

**Accessibility**: [A11y features included]
```

### For Video-Related Features

```markdown
## Video Feature Name

**Video Hosting**: [Where videos are stored]
**Embedding Strategy**: [How videos are embedded]
**Performance**: [Lazy loading, optimization]
**Accessibility**: [Captions, keyboard controls]
**Mobile Experience**: [Touch controls, bandwidth]
```

## Code Documentation Standards

### Inline Comments

- Explain **why**, not **what** (code should be self-explanatory)
- Document creative/design decisions
- Note performance considerations
- Explain complex logic or algorithms

### Component Documentation

- JSDoc comments for exported components
- Prop types/interfaces documented
- Usage examples in comments
- Creative rationale where relevant

## References

- `documentation/README.md` - Documentation index
- `documentation/architecture.md` - Architecture decisions
- `documentation/development-guide.md` - Development practices

**Document everything above. Write docs that help maintain the creative vision and technical excellence. Make it easy for future developers (including yourself) to understand and extend the work.**
