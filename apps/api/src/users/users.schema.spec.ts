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

	it.each([
		["omitted", {}],
		["null", { phone: null }],
		["empty", { phone: "" }],
		["blank", { phone: "   " }],
	])("treats %s phone as absent", (_label, extra) => {
		const result = createUserSchema.parse({
			name: "Bob",
			email: "bob@example.com",
			...extra,
		});
		expect(result.phone ?? undefined).toBeUndefined();
	});

	it.each([
		"+1-555-0101",
		"(555) 123-4567",
		"+44 20 7946 0958",
		"5551234",
	])("accepts phone %s", (phone) => {
		expect(
			createUserSchema.safeParse({ name: "A", email: "a@example.com", phone })
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
		[
			"too few phone digits",
			{ name: "A", email: "a@example.com", phone: "(((123)))" },
		],
		[
			"too many phone digits",
			{ name: "A", email: "a@example.com", phone: "1234567890123456" },
		],
		["null body", null],
	])("rejects %s", (_label, payload) => {
		expect(createUserSchema.safeParse(payload).success).toBe(false);
	});
});
