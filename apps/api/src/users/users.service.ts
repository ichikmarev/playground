import { ConflictException, Injectable } from "@nestjs/common";
import { isUniqueConstraintError } from "../common/sqlite-errors";
import { DatabaseService } from "../database/database.service";
import type { CreateUserDto } from "./users.schema";

@Injectable()
export class UsersService {
	constructor(private readonly db: DatabaseService) {}

	findAll() {
		return this.db.query("SELECT * FROM users ORDER BY id ASC");
	}

	findById(id: number) {
		return this.db.get("SELECT * FROM users WHERE id = ?", [id]);
	}

	create(data: CreateUserDto) {
		try {
			const result = this.db.run(
				"INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
				[data.name, data.email, data.phone || null],
			);
			return this.db.get("SELECT * FROM users WHERE id = ?", [
				result.lastInsertRowid,
			]);
		} catch (error) {
			if (isUniqueConstraintError(error)) {
				throw new ConflictException("User with this email already exists");
			}
			throw error;
		}
	}
}
