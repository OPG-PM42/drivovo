import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface ImageFormControls {
  url:    FormControl<string | null>;
  alt:    FormControl<string | null>;
  width:  FormControl<number | null>;
  height: FormControl<number | null>;
}

@Component({
  selector: 'app-image-array-editor',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './image-array-editor.component.html',
  styleUrl: './image-array-editor.component.scss',
})
export class ImageArrayEditorComponent {
  @Input({ required: true }) formArray!: FormArray<FormGroup<ImageFormControls>>;
  @Output() readonly addRow = new EventEmitter<void>();
}
