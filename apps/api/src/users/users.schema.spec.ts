import { describe, expect, it } from "vitest";
import { createUserSchema } from "./users.schema";

describe("createUserSchema", () => {
	it("accepts a valid payload and normalizes it", () => {
		const result = createUserSchema.parse({
			name: "  Alice  ",
			email: " Alice@Example.COM ",
			phone: "+1-555-0101",
		});
		expect(result).toEqual({
			name: "Alice",
			email: "alice@example.com",
			phone: "+1-555-0101",
		});
	});

	it("allows phone to be omitted", () => {
		expect(
			createUserSchema.safeParse({ name: "Bob", email: "bob@example.com" })
				.success,
		).toBe(true);
	});

	it("strips unknown keys", () => {
		const result = createUserSchema.parse({
			name: "Eve",
			email: "eve@example.com",
			role: "admin",
			is_active: 0,
		});
		expect(result).toEqual({ name: "Eve", email: "eve@example.com" });
	});

	it.each([
		["missing name", { email: "a@example.com" }],
		["blank name", { name: "   ", email: "a@example.com" }],
		["missing email", { name: "A" }],
		["invalid email", { name: "A", email: "not-an-email" }],
		["non-string email", { name: "A", email: 42 }],
		["non-string phone", { name: "A", email: "a@example.com", phone: true }],
		["invalid phone", { name: "A", email: "a@example.com", phone: "call me" }],
		["null body", null],
	])("rejects %s", (_label, payload) => {
		expect(createUserSchema.safeParse(payload).success).toBe(false);
	});
});
