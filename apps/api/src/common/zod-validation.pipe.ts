import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { z } from "zod";

@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
	constructor(private readonly schema: T) {}

	transform(value: unknown): z.output<T> {
		const result = this.schema.safeParse(value);
		if (!result.success) {
			throw new BadRequestException({
				message: "Validation failed",
				errors: result.error.issues.map((issue) => ({
					path: issue.path.join("."),
					message: issue.message,
				})),
			});
		}
		return result.data;
	}
}
