import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-array-editor',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="images-header">
      <strong>Images</strong>
      <button mat-stroked-button type="button" (click)="addRow.emit()">
        <mat-icon>add</mat-icon> Add image
      </button>
    </div>
    @for (group of formArray.controls; track $index) {
      <div class="image-row" [formGroup]="asGroup(group)">
        <mat-form-field appearance="outline" class="url-field">
          <mat-label>URL</mat-label>
          <input matInput formControlName="url" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Alt</mat-label>
          <input matInput formControlName="alt" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="small-field">
          <mat-label>W</mat-label>
          <input matInput type="number" formControlName="width" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="small-field">
          <mat-label>H</mat-label>
          <input matInput type="number" formControlName="height" />
        </mat-form-field>
        <button mat-icon-button type="button" color="warn" (click)="formArray.removeAt($index)">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    }
  `,
  styles: `
    .images-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .image-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .url-field { flex: 2; min-width: 200px; }
    .small-field { width: 80px; }
  `,
})
export class ImageArrayEditorComponent {
  @Input({ required: true }) formArray!: FormArray;
  @Output() readonly addRow = new EventEmitter<void>();

  asGroup(c: unknown): FormGroup {
    return c as FormGroup;
  }
}
