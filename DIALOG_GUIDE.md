# Dialog Design Guide

## ✅ Best Practice: Use Separate Dialogs

For Shift Nook, we use **separate dialog components** for each entity type (Client, Jobsite, Worker, etc.) while maintaining **consistent styling** through shared SCSS mixins.

## Why Separate Dialogs?

1. **Type Safety**: Each dialog has its own TypeScript interface
2. **Clear Validation**: Different entities have different validation rules
3. **Maintainable**: Easy to modify one without breaking others
4. **Testable**: Simple, focused unit tests
5. **No Over-Engineering**: Keep it simple and clear

## Shared Styling Approach

Instead of a generic dialog, we share **styles** through SCSS mixins:

### 1. Use the Base Styles

```scss
// In your dialog component SCSS file:
@import '../../shared/styles/dialog-base';

.your-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  
  // Include the shared premium styles
  @include premium-dialog-base;
}
```

### 2. Standard Dialog Configuration

When opening any dialog, use this configuration:

```typescript
const dialogRef = this.dialog.open(YourDialogComponent, {
  width: '500px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  disableClose: false,
  autoFocus: true,
  panelClass: 'premium-dialog-container',
  position: { top: '80px' }
});
```

### 3. HTML Structure

All dialogs should follow this structure:

```html
<div class="your-dialog">
  <div class="dialog-header">
    <mat-icon class="header-icon">your_icon</mat-icon>
    <div class="header-text">
      <h2 mat-dialog-title>Your Title</h2>
      <p class="subtitle">Your subtitle</p>
    </div>
  </div>

  <mat-dialog-content>
    <form [formGroup]="yourForm" class="your-form">
      <div class="form-field">
        <label class="field-label">Field Name</label>
        <mat-form-field appearance="outline">
          <mat-icon matPrefix>icon_name</mat-icon>
          <input matInput formControlName="fieldName" placeholder="e.g. Example">
          @if (getErrorMessage('fieldName')) {
            <mat-error>{{ getErrorMessage('fieldName') }}</mat-error>
          }
        </mat-form-field>
      </div>
    </form>
  </mat-dialog-content>

  <mat-dialog-actions>
    <button mat-button (click)="onCancel()">Cancel</button>
    <button mat-flat-button color="primary" (click)="onSubmit()">
      Create
    </button>
  </mat-dialog-actions>
</div>
```

## When Would You Need a Generic Dialog?

Consider a generic/reusable dialog only if you have:

- **10+ very similar dialogs** (you currently have 2)
- **Only simple text inputs** (no complex dropdowns, date pickers, etc.)
- **Identical validation** across all uses
- **No special business logic** per dialog

For example, you might create a generic dialog for:
- Simple confirmation dialogs (already have this: ConfirmationDialogComponent ✅)
- Simple "yes/no" prompts
- Basic text input prompts

## Current Dialog Architecture ✅

```
src/app/shared/components/
├── confirmation-dialog/      ← Generic (simple yes/no)
├── client-dialog/            ← Specific (Client entity)
├── jobsite-dialog/           ← Specific (Jobsite entity)
└── worker-dialog/            ← Future: Specific (Worker entity)
```

## Creating a New Dialog (Step-by-Step)

1. **Generate the component**:
   ```bash
   ng generate component shared/components/worker-dialog --standalone
   ```

2. **Import the base styles** in the SCSS file:
   ```scss
   @import '../../styles/dialog-base';
   
   .worker-dialog {
     @include premium-dialog-base;
     max-width: 500px;
   }
   ```

3. **Use the standard HTML structure** (shown above)

4. **Create the TypeScript logic** with your specific validation

5. **Open with standard config** in your component

## Summary

✅ **DO**: Create separate dialogs for each entity (Client, Jobsite, Worker)  
✅ **DO**: Use shared SCSS mixins for consistent styling  
✅ **DO**: Follow the standard HTML structure  
✅ **DO**: Use the standard dialog configuration  

❌ **DON'T**: Create a generic form dialog with complex config objects  
❌ **DON'T**: Sacrifice type safety for reusability  
❌ **DON'T**: Over-engineer when you have < 5 dialogs  

Your current approach is perfect! 🎉

