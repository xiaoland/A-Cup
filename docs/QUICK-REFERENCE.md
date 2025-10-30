# Quick Reference Guide

## 🎯 What Was Done

1. ✅ Created Navigation Bar component
2. ✅ Created Home Page with dashboard
3. ✅ Integrated navigation into App.vue
4. ✅ Aligned all view styles for consistency
5. ✅ Created comprehensive documentation

## 📁 Files Created

```
src/components/common/NavigationBar.vue    - Navigation bar component
src/views/Home.vue                        - Home page/dashboard

docs/ui-components.md                     - Component documentation
docs/navigation-structure.txt             - Visual structure
docs/CHANGELOG-UI.md                      - UI implementation changelog
docs/STYLE-ALIGNMENT.md                   - Style alignment guide
docs/style-comparison.txt                 - Before/after comparison
docs/IMPLEMENTATION-SUMMARY.md            - Complete summary
docs/QUICK-REFERENCE.md                   - This file
```

## 📝 Files Modified

```
src/App.vue                - Added navigation and layout
src/router/index.ts        - Imported Home view
src/views/profiles.vue     - Style alignment
src/views/editProfile.vue  - Style alignment
```

## 🎨 Style Pattern (Copy-Paste Template)

### For List Views:
```vue
<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Page Title</h1>
      <Button label="New Item" icon="pi pi-plus" @click="createNew" />
    </div>
    
    <DataTable :value="items">
      <!-- columns -->
    </DataTable>
  </div>
</template>
```

### For Edit Views:
```vue
<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">
      {{ isNew ? "Create" : "Edit" }} Item
    </h1>
    
    <EditorComponent 
      :modelValue="item"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>
```

## 🚀 How to Use

### Running the Application:
```bash
# Development
pnpm dev

# Build
pnpm run build

# Preview
pnpm run preview

# Deploy
pnpm run deploy
```

### Navigation Structure:
```
/ (Home)                    - Dashboard with stats
├── /profiles               - Profile list
│   ├── /profiles/new       - Create profile
│   └── /profiles/:id       - Edit profile
├── /outbounds              - Outbound list
│   ├── /outbounds/new      - Create outbound
│   └── /outbounds/edit/:id - Edit outbound
└── /rulesets               - Rule set list
    ├── /rulesets/new       - Create rule set
    └── /rulesets/edit/:id  - Edit rule set
```

## 🎯 Key Components

### NavigationBar
- **Location**: `src/components/common/NavigationBar.vue`
- **Props**: None
- **Features**: Logo, menu items, user controls, logout
- **Usage**: Automatically included in `App.vue`

### Home Page
- **Location**: `src/views/Home.vue`
- **Route**: `/`
- **Features**: Welcome text, stats cards, quick start guide
- **API Calls**: Fetches profiles, outbounds, and rulesets counts

## 📊 View Consistency Matrix

| View | Root Class | Header Pattern | Title Style | Status |
|------|-----------|----------------|-------------|---------|
| profiles.vue | `p-4` | flex header | `text-2xl font-bold` | ✅ |
| outboundsView.vue | `p-4` | flex header | `text-2xl font-bold` | ✅ |
| ruleSets.vue | `p-4` | flex header | `text-2xl font-bold` | ✅ |
| editProfile.vue | `p-4` | h1 mb-4 | `text-2xl font-bold` | ✅ |
| editOutbound.vue | `p-4` | h1 mb-4 | `text-2xl font-bold` | ✅ |
| editRuleSet.vue | `p-4` | h1 mb-4 | `text-2xl font-bold` | ✅ |

## 🛠️ Utility Classes Reference

```css
/* Spacing */
p-4       → padding: 1rem (16px)
mb-4      → margin-bottom: 1rem (16px)
gap-4     → gap: 1rem (16px)
mr-2      → margin-right: 0.5rem (8px)

/* Typography */
text-2xl  → font-size: 1.5rem (24px)
text-xl   → font-size: 1.25rem (20px)
font-bold → font-weight: 700

/* Layout */
flex                  → display: flex
justify-between       → justify-content: space-between
items-center         → align-items: center
grid                 → display: grid
grid-cols-1          → grid-template-columns: repeat(1, 1fr)
md:grid-cols-3       → @media (min-width: 768px) { ... }
```

## 🎨 Color System (From Stats Cards)

```javascript
Profiles:  #3b82f6 (Blue)
Outbounds: #10b981 (Green)
Rule Sets: #f59e0b (Orange)
```

## ✅ Checklist for New Views

- [ ] Add `p-4` padding to root container
- [ ] Use consistent header pattern
- [ ] Apply `text-2xl font-bold` to h1 title
- [ ] Use utility classes instead of custom CSS
- [ ] Test on mobile and desktop
- [ ] Check dark mode compatibility
- [ ] Add to router if needed
- [ ] Update navigation if needed

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ui-components.md` | Detailed component docs |
| `STYLE-ALIGNMENT.md` | Style guide and patterns |
| `CHANGELOG-UI.md` | Change history |
| `IMPLEMENTATION-SUMMARY.md` | Complete overview |
| `QUICK-REFERENCE.md` | This file |

## 🐛 Diagnostics

```bash
# Check for errors
pnpm run type-check

# Current status: ✅ 0 errors, 0 warnings
```

## 🔗 Related Files

- **Router**: `src/router/index.ts`
- **App Layout**: `src/App.vue`
- **User Store**: `src/stores/user.ts`
- **Project Config**: `AGENTS.md`

---

**Quick Start**: Just copy the style patterns above for any new view!
