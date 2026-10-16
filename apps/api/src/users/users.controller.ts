import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { type CreateUserDto, createUserSchema } from "./users.schema";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	findById(@Param("id") id: string) {
		return this.usersService.findById(Number(id));
	}

	@Post()
	create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto) {
		return this.usersService.create(body);
	}
}
