const MOCK_CARS = [
  {
    id: '1',
    name: 'Camry 3.5',
    brand: 'Toyota',
    images: [{ url: 'https://example.com/cars/camry.jpg', alt: 'Toyota Camry', width: 1280, height: 720, parentId: '1' }],
    description: 'Reliable full-size sedan with a smooth V6 engine.',
    driveType: 'FWD',
    type: 'sedan',
    url: 'toyota-camry-35',
    acceleration: '6.4',
    power: '249',
    engine: { type: 'petrol', capacity: '3.5', fuel_consumption: '9.5' },
    interiorTrim: 'leather',
    status: 'available',
    color: 'white',
    price: { value: 35000, currency: 'USD', countryId: 'us', carId: '1' },
  },
  {
    id: '2',
    name: 'Model 3 Long Range',
    brand: 'Tesla',
    images: [{ url: 'https://example.com/cars/model3.jpg', alt: 'Tesla Model 3', width: 1280, height: 720, parentId: '2' }],
    description: 'All-electric sedan with long-range battery and autopilot.',
    driveType: 'AWD',
    type: 'sedan',
    url: 'tesla-model-3-lr',
    acceleration: '4.2',
    power: '358',
    engine: { type: 'electric', capacity: '0', fuel_consumption: '0' },
    interiorTrim: 'vegan leather',
    status: 'available',
    color: 'black',
    price: { value: 47000, currency: 'USD', countryId: 'us', carId: '2' },
  },
  {
    id: '3',
    name: 'X5 xDrive40i',
    brand: 'BMW',
    images: [{ url: 'https://example.com/cars/x5.jpg', alt: 'BMW X5', width: 1280, height: 720, parentId: '3' }],
    description: 'Luxury mid-size SUV with adaptive suspension.',
    driveType: 'AWD',
    type: 'suv',
    url: 'bmw-x5-xdrive40i',
    acceleration: '5.3',
    power: '340',
    engine: { type: 'petrol', capacity: '3.0', fuel_consumption: '10.8' },
    interiorTrim: 'merino leather',
    status: 'order',
    color: 'gray',
    price: { value: 65000, currency: 'USD', countryId: 'us', carId: '3' },
  },
];

const FILTERABLE_FIELDS = ['brand', 'type', 'status', 'driveType', 'color'];

export const createMockCarRepository = () => ({
  find: async (query = {}) =>
    MOCK_CARS.filter((car) =>
      FILTERABLE_FIELDS.every((field) => {
        const value = query[field];
        return !value ? true : car[field] === value;
      })
    ),
});
