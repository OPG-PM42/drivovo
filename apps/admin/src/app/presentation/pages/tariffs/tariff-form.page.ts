import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { TuiForm } from '@taiga-ui/layout';
import { tariffCreateSchema, TariffEntity } from '@drivovo/domain';
import { HasDirtyForm } from '../../guards/dirty-form.guard';
import { GetTariffByIdUseCase } from '../../../application/use-cases/get-tariff-by-id.use-case';
import { CreateTariffUseCase } from '../../../application/use-cases/create-tariff.use-case';
import { UpdateTariffUseCase } from '../../../application/use-cases/update-tariff.use-case';

interface PriceFormControls {
  value:    FormControl<number | null>;
  currency: FormControl<string | null>;
}

interface OptionFormControls {
  name:      FormControl<string | null>;
  price:     FormGroup<PriceFormControls>;
  carId:     FormControl<string | null>;
  countryId: FormControl<string | null>;
}

@Component({
  selector: 'app-tariff-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiButton,
    ...TuiError,
    TuiLoader,
    TuiTextfield,
    ...TuiSelect,
    TuiForm,
  ],
  templateUrl: './tariff-form.page.html',
  styleUrl: './tariff-form.page.scss',
})
export class TariffFormPage implements OnInit, HasDirtyForm {
  readonly typeOptions: TariffEntity['type'][] = ['leasing', 'subscription'];

  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly getTariffById = inject(GetTariffByIdUseCase);
  private readonly createTariff = inject(CreateTariffUseCase);
  private readonly updateTariff = inject(UpdateTariffUseCase);

  readonly loadingTariff = signal(false);
  readonly saving = signal(false);
  readonly apiError = signal('');

  readonly form = this.fb.group({
    name: ['', Validators.required],
    type: ['leasing' as TariffEntity['type'], Validators.required],
    options: this.fb.array<FormGroup<OptionFormControls>>([]),
  });

  get optionsArray() {
    return this.form.controls.options;
  }

  get isEdit(): boolean {
    return !!this.route.snapshot.params['id'];
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadingTariff.set(true);
      this.getTariffById.execute(id).subscribe({
        next: (tariff) => {
          this.form.patchValue({ name: tariff.name, type: tariff.type });
          tariff.options.forEach((opt) => this.optionsArray.push(this.buildOptionGroup(opt)));
          this.loadingTariff.set(false);
        },
        error: () => this.loadingTariff.set(false),
      });
    }
  }

  addOption(): void {
    this.optionsArray.push(
      this.buildOptionGroup({ name: '', price: { value: 0, currency: 'USD' } }),
    );
  }

  private buildOptionGroup(opt: {
    name: string;
    price: { value: number; currency: string };
    carId?: string;
    countryId?: string;
  }): FormGroup<OptionFormControls> {
    return this.fb.group({
      name: [opt.name, Validators.required],
      price: this.fb.group({
        value: [opt.price.value, [Validators.required, Validators.min(0)]],
        currency: [opt.price.currency, Validators.required],
      }),
      carId: [opt.carId ?? null],
      countryId: [opt.countryId ?? null],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const coerced = {
      ...raw,
      options: raw.options.map((opt) => ({
        name: opt.name,
        price: { value: Number(opt.price.value) || 0, currency: opt.price.currency },
        ...(opt.carId ? { carId: opt.carId } : {}),
        ...(opt.countryId ? { countryId: opt.countryId } : {}),
      })),
    };
    const parsed = tariffCreateSchema.safeParse(coerced);
    if (!parsed.success) {
      this.apiError.set('Validation failed: ' + parsed.error.issues.map((i) => i.message).join(', '));
      return;
    }

    this.saving.set(true);
    this.apiError.set('');
    const id = this.route.snapshot.params['id'];
    const op$ = id
      ? this.updateTariff.execute(id, parsed.data)
      : this.createTariff.execute(parsed.data);

    op$.subscribe({
      next: () => {
        this.form.markAsPristine();
        this.router.navigate(['/tariffs']);
      },
      error: (err) => {
        this.saving.set(false);
        this.apiError.set(err.error?.message ?? 'Save failed');
      },
    });
  }
}
