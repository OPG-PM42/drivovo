import { Component, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';

export interface ImageFormControls {
  url:    FormControl<string | null>;
  alt:    FormControl<string | null>;
  width:  FormControl<number | null>;
  height: FormControl<number | null>;
}

@Component({
  selector: 'app-image-array-editor',
  standalone: true,
  imports: [ReactiveFormsModule, TuiButton, TuiTextfield],
  templateUrl: './image-array-editor.component.html',
  styleUrl: './image-array-editor.component.scss',
})
export class ImageArrayEditorComponent {
  readonly formArray = input.required<FormArray<FormGroup<ImageFormControls>>>();
  readonly addRow = output<void>();
}
