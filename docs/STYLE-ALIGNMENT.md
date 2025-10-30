# Style Alignment Documentation

## Overview

This document describes the style alignment performed across all views in the A-Cup application to ensure a consistent user experience and maintainable codebase.

## Design System

### Layout Pattern

All views now follow a consistent layout pattern:

```vue
<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Page Title</h1>
      <Button label="Action" icon="pi pi-plus" @click="action" />
    </div>
    
    <!-- Main content -->
  </div>
</template>
```

### Key Style Elements

#### Root Container
- **Class**: `p-4`
- **Purpose**: Consistent padding on all sides (1rem)
- **Responsive**: Uniform across all breakpoints

#### Page Headers
- **Layout**: `flex justify-between items-center mb-4`
- **Title Style**: `text-2xl font-bold`
- **Spacing**: Bottom margin of 1rem (`mb-4`)
- **Pattern**: Title on left, action button(s) on right

#### Content Sections
- No additional card wrappers for list views
- Direct DataTable or content grid after header
- Let PrimeVue components handle their own styling

## Files Changed

### List Views

#### 1. `src/views/profiles.vue`
**Before**:
```vue
<div class="profiles-container p-4 md:p-6">
  <div class="card">
    <DataTable :value="profiles">
      <template #header>
        <div class="flex justify-between">
          <h2 class="text-2xl">Profiles</h2>
          <Button />
        </div>
      </template>
    </DataTable>
  </div>
</div>
```

**After**:
```vue
<div class="p-4">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Profiles</h1>
    <Button label="New Profile" icon="pi pi-plus" @click="newProfile" />
  </div>
  <DataTable :value="profiles" responsiveLayout="scroll">
    <!-- columns -->
  </DataTable>
</div>
```

**Changes**:
- ✅ Removed custom container class and responsive padding
- ✅ Removed card wrapper around DataTable
- ✅ Moved header outside DataTable to match other views
- ✅ Changed `<h2>` to `<h1>` with `font-bold` class
- ✅ Added `items-center` to header flex layout
- ✅ Removed scoped styles section

#### 2. `src/views/outboundsView.vue`
**Status**: Already aligned ✓

Pattern:
```vue
<div class="p-4">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Outbounds</h1>
    <Button />
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- OutboundCard components -->
  </div>
</div>
```

#### 3. `src/views/ruleSets.vue`
**Status**: Already aligned ✓

Pattern:
```vue
<div class="p-4">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Rule Sets</h1>
    <div>
      <Button label="Delete Selected" />
      <Button label="New Rule Set" />
    </div>
  </div>
  <DataTable />
</div>
```

### Edit Views

#### 1. `src/views/editProfile.vue`
**Before**:
```vue
<div>
  <h1>{{ isNewProfile ? "Create Profile" : "Edit Profile" }}</h1>
  <ProfileEditor />
</div>
```

**After**:
```vue
<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">
    {{ isNewProfile ? "Create Profile" : "Edit Profile" }}
  </h1>
  <ProfileEditor />
</div>
```

**Changes**:
- ✅ Added `p-4` padding to root container
- ✅ Added `text-2xl font-bold mb-4` to heading

#### 2. `src/views/editOutbound.vue`
**Status**: Already aligned ✓

Pattern:
```vue
<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">
    {{ isNew ? "New Outbound" : "Edit Outbound" }}
  </h1>
  <OutboundEditor />
</div>
```

#### 3. `src/views/editRuleSet.vue`
**Status**: Already aligned ✓

Pattern:
```vue
<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">
    {{ isNew ? 'New Rule Set' : 'Edit Rule Set' }}
  </h1>
  <RuleSetEditor />
</div>
```

## Style Conventions

### Typography Hierarchy

| Element | Classes | Usage |
|---------|---------|-------|
| Page Title | `text-2xl font-bold` | Main page heading (h1) |
| Section Title | `text-xl font-semibold` | Section headings |
| Card Title | `text-lg font-medium` | Card/component titles |
| Body Text | (default) | Regular content |

### Spacing System (UnoCSS)

| Class | Value | Usage |
|-------|-------|-------|
| `p-4` | 1rem (16px) | Standard page padding |
| `mb-4` | 1rem (16px) | Standard bottom margin |
| `gap-4` | 1rem (16px) | Standard grid/flex gap |
| `mr-2` | 0.5rem (8px) | Small right margin |

### Layout Patterns

#### List View Header
```vue
<div class="flex justify-between items-center mb-4">
  <h1 class="text-2xl font-bold">Title</h1>
  <Button />
</div>
```

#### Edit View Header
```vue
<h1 class="text-2xl font-bold mb-4">
  {{ isNew ? "Create" : "Edit" }} Entity
</h1>
```

#### Grid Layout
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

## Removed Anti-Patterns

### ❌ Inconsistent Container Classes
```vue
<!-- BEFORE -->
<div class="profiles-container p-4 md:p-6">
<div class="custom-container max-w-1400px">
```

```vue
<!-- AFTER -->
<div class="p-4">
```

### ❌ Unnecessary Card Wrappers
```vue
<!-- BEFORE -->
<div class="card">
  <DataTable>
    <template #header>
      <div>Title and actions</div>
    </template>
  </DataTable>
</div>
```

```vue
<!-- AFTER -->
<div class="flex justify-between items-center mb-4">
  <h1>Title</h1>
  <Button />
</div>
<DataTable />
```

### ❌ Inconsistent Heading Levels
```vue
<!-- BEFORE -->
<h2 class="text-2xl">Profiles</h2>
<h1>Edit Profile</h1>
```

```vue
<!-- AFTER -->
<h1 class="text-2xl font-bold">Profiles</h1>
<h1 class="text-2xl font-bold mb-4">Edit Profile</h1>
```

### ❌ Component-Specific Style Overrides
```vue
<!-- BEFORE -->
<style scoped>
.profiles-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
```

```vue
<!-- AFTER -->
<!-- No scoped styles needed - use utility classes -->
```

## Benefits

### Consistency
- ✅ All views follow the same layout pattern
- ✅ Predictable structure for developers
- ✅ Uniform user experience

### Maintainability
- ✅ Less custom CSS to maintain
- ✅ Easier to understand component structure
- ✅ Consistent spacing and typography

### Scalability
- ✅ New views can follow established patterns
- ✅ Utility-first approach with UnoCSS
- ✅ Easy to apply theme changes globally

### Performance
- ✅ Reduced CSS bundle size (fewer custom styles)
- ✅ Better tree-shaking with utility classes
- ✅ No style conflicts between components

## Testing Checklist

After style alignment, verify:
- [ ] All list views display correctly
- [ ] Headers are properly aligned
- [ ] Action buttons are positioned consistently
- [ ] Edit views have proper spacing
- [ ] Responsive behavior works on mobile
- [ ] DataTables render without layout issues
- [ ] No visual regressions
- [ ] Dark mode compatibility maintained

## Future Considerations

### Potential Enhancements
1. **Max Width Container**: Consider adding optional max-width wrapper for very wide screens
2. **Loading States**: Standardize loading indicator placement
3. **Empty States**: Define consistent empty state patterns
4. **Error States**: Standardize error message display
5. **Breadcrumbs**: Add breadcrumb navigation for nested routes

### Style Guide
Consider creating a comprehensive style guide document covering:
- Color palette and usage
- Component variants
- Animation standards
- Accessibility requirements
- Icon usage guidelines

## Migration Guide

For future views or components:

1. **Start with the pattern**:
   ```vue
   <template>
     <div class="p-4">
       <!-- content -->
     </div>
   </template>
   ```

2. **Add consistent header**:
   ```vue
   <div class="flex justify-between items-center mb-4">
     <h1 class="text-2xl font-bold">Title</h1>
     <Button />
   </div>
   ```

3. **Use utility classes** instead of custom CSS

4. **Follow PrimeVue conventions** for component usage

5. **Test responsive behavior** at different breakpoints

## References

- **UnoCSS Documentation**: https://unocss.dev/
- **PrimeVue Documentation**: https://primevue.org/
- **Vue 3 Style Guide**: https://vuejs.org/style-guide/
- **Project Structure**: See `AGENTS.md` for overall architecture