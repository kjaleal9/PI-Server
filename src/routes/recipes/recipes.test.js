const request = require("supertest");
const app = require("../../app");
const sql = require("mssql");

const {
  createConnectionPool,
  closeConnectionPool,
} = require("../../sql");

describe("Test GET /recipes", () => {
  beforeAll(async () => {
    await createConnectionPool();
  });
  afterAll(async () => {
    await closeConnectionPool();
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/recipes");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/materials");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/parameters");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/equipment");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/parameters");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/recipes");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/recipes");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/recipes");
    expect(response.statusCode).toBe(200);
  });
  test("It should respond with 200 success", async () => {
    const response = await request(app).get("/api/recipes");
    expect(response.statusCode).toBe(200);
  });
 
});
