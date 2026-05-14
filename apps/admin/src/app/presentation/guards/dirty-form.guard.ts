import { CanDeactivateFn } from '@angular/router';

export interface HasDirtyForm {
  isDirty(): boolean;
}

export const dirtyFormGuard: CanDeactivateFn<HasDirtyForm> = (component) => {
  if (!component.isDirty()) return true;
  return confirm('You have unsaved changes. Leave anyway?');
};
