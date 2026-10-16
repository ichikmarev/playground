import { ConflictException, Injectable } from "@nestjs/common";
import { isUniqueConstraintError } from "../common/sqlite-errors";
import { DatabaseService } from "../database/database.service";
import type { CreateProductDto } from "./products.schema";

@Injectable()
export class ProductsService {
	constructor(private readonly db: DatabaseService) {}

	findAll() {
		return this.db.query("SELECT * FROM products ORDER BY id ASC");
	}

	findById(id: number) {
		return this.db.get("SELECT * FROM products WHERE id = ?", [id]);
	}

	create(data: CreateProductDto) {
		try {
			const result = this.db.run(
				"INSERT INTO products (name, description, price, sku, category, brand) VALUES (?, ?, ?, ?, ?, ?)",
				[
					data.name,
					data.description || null,
					data.price,
					data.sku,
					data.category,
					data.brand || null,
				],
			);
			return this.db.get("SELECT * FROM products WHERE id = ?", [
				result.lastInsertRowid,
			]);
		} catch (error) {
			if (isUniqueConstraintError(error)) {
				throw new ConflictException("Product with this SKU already exists");
			}
			throw error;
		}
	}
}
