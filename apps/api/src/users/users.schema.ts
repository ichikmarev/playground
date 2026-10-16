import { z } from "zod";
import { optionalText } from "../common/schemas";

const phone = z
	.string()
	.trim()
	.regex(/^\+?[0-9 ()-]+$/, "Invalid phone number")
	.refine((value) => {
		const digits = value.replace(/\D/g, "").length;
		return digits >= 7 && digits <= 15;
	}, "Phone number must contain 7 to 15 digits");

export const createUserSchema = z.object({
	name: z.string().trim().min(1).max(100),
	email: z.string().trim().toLowerCase().pipe(z.email()),
	phone: optionalText(phone),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
