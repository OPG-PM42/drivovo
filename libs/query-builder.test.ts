import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Query, pool } from "./query-builder";

describe("Query", () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  function mockPool(rows: unknown[] = []) {
    return mock.method(pool, "query", () =>
      Promise.resolve({ rows }),
    );
  }

  it("where by one column", async () => {
    const fn = mockPool([{ id: "1", brand: "Toyota" }]);

    const rows = await new Query("cars").where({ brand: "Toyota" });

    assert.equal(fn.mock.calls.length, 1);
    assert.equal(
      fn.mock.calls[0].arguments[0],
      "SELECT * FROM cars WHERE brand=$1",
    );
    assert.deepEqual(fn.mock.calls[0].arguments[1], ["Toyota"]);
    assert.deepEqual(rows, [{ id: "1", brand: "Toyota" }]);
  });

  it("where by multiple columns", async () => {
    const fn = mockPool([]);

    await new Query("cars").where({ brand: "BMW", status: "active" });

    assert.equal(
      fn.mock.calls[0].arguments[0],
      "SELECT * FROM cars WHERE brand=$1 AND status=$2",
    );
    assert.deepEqual(fn.mock.calls[0].arguments[1], ["BMW", "active"]);
  });

  it("where({}) selects all", async () => {
    const fn = mockPool([]);

    await new Query("cars").where({});

    assert.equal(fn.mock.calls[0].arguments[0], "SELECT * FROM cars");
    assert.deepEqual(fn.mock.calls[0].arguments[1], []);
  });

  it("where skips undefined values", async () => {
    const fn = mockPool([]);

    await new Query("cars").where({ a: undefined, b: "x" });

    assert.equal(
      fn.mock.calls[0].arguments[0],
      "SELECT * FROM cars WHERE b=$1",
    );
    assert.deepEqual(fn.mock.calls[0].arguments[1], ["x"]);
  });

  it("no where selects all", async () => {
    const fn = mockPool([]);

    await new Query("cars");

    assert.equal(fn.mock.calls[0].arguments[0], "SELECT * FROM cars");
    assert.deepEqual(fn.mock.calls[0].arguments[1], []);
  });

  it("order", async () => {
    const fn = mockPool([]);

    await new Query("cars").where({ brand: "BMW" }).order("price");

    assert.equal(
      fn.mock.calls[0].arguments[0],
      "SELECT * FROM cars WHERE brand=$1 ORDER BY price",
    );
    assert.deepEqual(fn.mock.calls[0].arguments[1], ["BMW"]);
  });

  it("limit", async () => {
    const fn = mockPool([]);

    await new Query("cars").where({ brand: "BMW" }).limit(10);

    assert.equal(
      fn.mock.calls[0].arguments[0],
      "SELECT * FROM cars WHERE brand=$1 LIMIT 10",
    );
    assert.deepEqual(fn.mock.calls[0].arguments[1], ["BMW"]);
  });

  it("limit(0)", async () => {
    const fn = mockPool([]);

    await new Query("cars").limit(0);

    assert.equal(fn.mock.calls[0].arguments[0], "SELECT * FROM cars LIMIT 0");
    assert.deepEqual(fn.mock.calls[0].arguments[1], []);
  });
});
