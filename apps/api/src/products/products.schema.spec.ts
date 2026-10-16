import { describe, expect, it } from "vitest";
import { createProductSchema } from "./products.schema";

const valid = {
	name: "Widget",
	price: 999,
	sku: "WDG-001",
	category: "Tools",
};

describe("createProductSchema", () => {
	it("accepts a minimal valid payload", () => {
		expect(createProductSchema.parse(valid)).toEqual(valid);
	});

	it("accepts optional fields and trims strings", () => {
		const result = createProductSchema.parse({
			...valid,
			name: "  Widget  ",
			description: " A widget ",
			brand: " Acme ",
		});
		expect(result).toEqual({
			...valid,
			description: "A widget",
			brand: "Acme",
		});
	});

	it("accepts a price of zero", () => {
		expect(createProductSchema.safeParse({ ...valid, price: 0 }).success).toBe(
			true,
		);
	});

	it("treats null and blank optional fields as absent", () => {
		const result = createProductSchema.parse({
			...valid,
			description: null,
			brand: "  ",
		});
		expect(result.description ?? undefined).toBeUndefined();
		expect(result.brand ?? undefined).toBeUndefined();
	});

	it("strips unknown keys", () => {
		const result = createProductSchema.parse({
			...valid,
			id: 123,
			rating: 5,
			stock_quantity: 1000,
		});
		expect(result).toEqual(valid);
	});

	it.each([
		["missing name", { ...valid, name: undefined }],
		["blank sku", { ...valid, sku: "  " }],
		["missing category", { ...valid, category: undefined }],
		["string price", { ...valid, price: "999" }],
		["float price", { ...valid, price: 9.99 }],
		["negative price", { ...valid, price: -1 }],
		["NaN price", { ...valid, price: Number.NaN }],
		["non-string brand", { ...valid, brand: 1 }],
	])("rejects %s", (_label, payload) => {
		expect(createProductSchema.safeParse(payload).success).toBe(false);
	});
});
