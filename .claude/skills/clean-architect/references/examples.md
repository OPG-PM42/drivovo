# Примеры архитектурной декомпозиции

## Пример 1: Фича "Каталог автомобилей"

### Domain слой
Уже есть: `CarEntity`, `Image`, `Price`.
- Новое: не требуется.

### Application слой
```
libs/catalog/src/
├── use-cases/
│   ├── get-cars.use-case.ts        GetCarsUseCase
│   └── get-car-by-id.use-case.ts   GetCarByIdUseCase
├── ports/
│   └── car.repository.ts           CarRepository (интерфейс)
├── dto/
│   └── car-list.dto.ts             CarListDto, CarFilterDto
└── mappers/
    └── car.mapper.ts               Entity ↔ DTO
```

### Infrastructure слой
```
apps/web/infrastructure/
├── repositories/
│   └── http-car.repository.ts      Реализация CarRepository через fetch
└── mappers/
    └── car-api.mapper.ts           API response → CarEntity
```

### Presentation слой
```
apps/web/ui/
├── components/
│   ├── CarList.tsx                  Список автомобилей
│   └── CarCard.tsx                  Карточка автомобиля
└── states/
    └── catalog.state.ts            MobX store для каталога
```

### Порядок реализации
1. Domain — проверить что CarEntity покрывает все нужные поля
2. Application — создать Use Cases, Ports, DTOs
3. Infrastructure — реализовать HTTP-репозиторий
4. Presentation — компоненты + state

---

## Пример 2: Фича "Оформление кредита"

### Domain слой
Уже есть: `CreditEntity`, `TariffEntity`, `UserEntity`, `Money`.
- Новое: Domain Service `CreditCalculator` — расчёт ежемесячного платежа.

### Application слой
```
libs/credit/src/
├── use-cases/
│   ├── create-credit.use-case.ts    CreateCreditUseCase
│   ├── calculate-payment.use-case.ts CalculatePaymentUseCase
│   └── get-tariffs.use-case.ts      GetTariffsUseCase
├── ports/
│   ├── credit.repository.ts         CreditRepository (интерфейс)
│   └── tariff.repository.ts         TariffRepository (интерфейс)
├── dto/
│   ├── create-credit.dto.ts         CreateCreditDto
│   └── payment-calculation.dto.ts   PaymentCalculationDto
└── index.ts
```

### Infrastructure слой
```
apps/backend/infrastructure/
├── repositories/
│   ├── db-credit.repository.ts      CreditRepository → DB
│   └── db-tariff.repository.ts      TariffRepository → DB
└── controllers/
    └── credit.controller.ts         Fastify routes
```

### Presentation слой
```
apps/web/ui/
├── components/
│   ├── CreditForm.tsx               Форма оформления
│   ├── TariffSelector.tsx           Выбор тарифа
│   └── PaymentCalculator.tsx        Калькулятор платежей
└── states/
    └── credit.state.ts              MobX store
```

---

## Пример 3: Добавление новой Entity "DealerEntity"

### Domain слой
```
libs/domain/src/entities/dealer.ts
```
```typescript
export interface DealerEntity {
  id: string;
  name: string;
  address: string;
  country: CountryEntity;
  phone: string;
  email: string;
  workingHours: WorkingHours;  // → новый Value Object
}
```

```
libs/domain/src/value-object/working-hours.ts
```
```typescript
export interface WorkingHours {
  open: string;   // "09:00"
  close: string;  // "18:00"
  days: number[]; // [1,2,3,4,5] — пн-пт
}
```

Обновить barrel-файлы: `entities/index.ts`, `value-object/index.ts`, `src/index.ts`.

### Чек-лист для новой Entity
- [ ] Интерфейс с суффиксом `Entity`
- [ ] Поле `id: string`
- [ ] Файл в `libs/domain/src/entities/`
- [ ] Экспорт в `entities/index.ts`
- [ ] Реэкспорт из `src/index.ts`
- [ ] Value Objects вынесены отдельно если переиспользуются
