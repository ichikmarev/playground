import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module";

describe("POST endpoints (HTTP)", () => {
	let app: INestApplication;
	let baseUrl: string;

	const post = (path: string, body: unknown) =>
		fetch(`${baseUrl}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

	beforeAll(async () => {
		process.env.DATABASE_PATH = ":memory:";
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleRef.createNestApplication({ logger: false });
		await app.listen(0, "127.0.0.1");
		baseUrl = await app.getUrl();
	});

	afterAll(async () => {
		await app?.close();
	});

	describe("POST /users", () => {
		it("creates a user and ignores unknown fields", async () => {
			const res = await post("/users", {
				name: " Alice ",
				email: "Alice@Example.com",
				phone: "+1-555-0101",
				role: "admin",
			});
			expect(res.status).toBe(201);
			const user = await res.json();
			expect(user).toMatchObject({
				name: "Alice",
				email: "alice@example.com",
				phone: "+1-555-0101",
				role: "customer",
			});
		});

		it("returns 400 with issue details for an invalid payload", async () => {
			const res = await post("/users", { name: "", email: "nope" });
			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.message).toBe("Validation failed");
			expect(body.errors.map((e: { path: string }) => e.path)).toEqual(
				expect.arrayContaining(["name", "email"]),
			);
		});

		it("accepts a record round-tripped from GET (null optional fields)", async () => {
			const res = await post("/users", {
				name: "Dave",
				email: "dave@example.com",
				phone: null,
			});
			expect(res.status).toBe(201);
			expect((await res.json()).phone).toBeNull();
		});

		it("returns 400 for a wrongly typed field instead of a 500", async () => {
			const res = await post("/users", {
				name: "Bob",
				email: "bob@example.com",
				phone: true,
			});
			expect(res.status).toBe(400);
		});

		it("returns 409 for a duplicate email", async () => {
			const payload = { name: "Carol", email: "carol@example.com" };
			expect((await post("/users", payload)).status).toBe(201);
			const res = await post("/users", {
				...payload,
				email: "CAROL@example.com",
			});
			expect(res.status).toBe(409);
		});
	});

	describe("POST /products", () => {
		const product = {
			name: "Widget",
			price: 999,
			sku: "WDG-001",
			category: "Tools",
		};

		it("creates a product and ignores unknown fields", async () => {
			const res = await post("/products", {
				...product,
				rating: 5,
				stock_quantity: 1000,
			});
			expect(res.status).toBe(201);
			expect(await res.json()).toMatchObject({
				...product,
				description: null,
				brand: null,
				rating: 0,
				stock_quantity: 0,
			});
		});

		it.each([
			["string", "999"],
			["float", 9.99],
			["negative", -5],
		])("returns 400 for a %s price", async (_label, price) => {
			const res = await post("/products", {
				...product,
				sku: "WDG-BAD",
				price,
			});
			expect(res.status).toBe(400);
		});

		it("returns 400 for a missing required field", async () => {
			const { category: _omit, ...rest } = product;
			const res = await post("/products", { ...rest, sku: "WDG-002" });
			expect(res.status).toBe(400);
		});

		it("returns 409 for a duplicate SKU", async () => {
			const payload = { ...product, sku: "DUP-001" };
			expect((await post("/products", payload)).status).toBe(201);
			const res = await post("/products", { ...payload, name: "Other" });
			expect(res.status).toBe(409);
		});
	});
});
