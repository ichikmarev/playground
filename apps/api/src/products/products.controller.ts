import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { type CreateProductDto, createProductSchema } from "./products.schema";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	findAll() {
		return this.productsService.findAll();
	}

	@Get(":id")
	findById(@Param("id") id: string) {
		return this.productsService.findById(Number(id));
	}

	@Post()
	create(
		@Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDto,
	) {
		return this.productsService.create(body);
	}
}
