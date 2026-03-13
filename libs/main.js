import { insertCar } from './car';
// ...

async function main() {
  const data = await readFile('data.json');

  for (const row of data) {
    await Promise.all([
      insertCar(row),
      // insertUser(row)
    ]);
  }
}

main();