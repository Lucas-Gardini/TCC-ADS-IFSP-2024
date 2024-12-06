import { Controller, Get, Inject, Query, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { HttpResponse } from "semantic-response";
import { AppCustomObjectResponse } from "./app.decorator";
import { AppService } from "./app.service";
import { Public } from "./modules/auth/auth.guard";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

/**
 * Controlador para rotas extras da aplicação.
 */
@Controller()
@ApiTags("Rotas Extras")
export class AppController {
	/**
	 * Cria uma instância de `AppController`.
	 * @param appService - Serviço da aplicação para lógica de negócios.
	 * @param cacheService - Serviço de cache para gerenciar o cache.
	 */
	constructor(
		private readonly appService: AppService,
		@Inject(CACHE_MANAGER) private cacheService: Cache,
	) {}

	/**
	 * Obtém o status do serviço. Se não houver status em cache, um número aleatório será gerado e armazenado no cache.
	 * @param res - Resposta HTTP para enviar o status do serviço.
	 */
	@AppCustomObjectResponse({ cached: Number })
	@Public()
	@Get("status")
	async getSession(@Res() res: Response) {
		const cachedStatus = await this.cacheService.get("status");

		if (!cachedStatus) {
			const randomNumber = Math.floor(Math.random() * 1000);
			await this.cacheService.set("status", randomNumber, { ttl: 50 });
		}

		const body = HttpResponse.ok(
			{
				cached: await this.cacheService.get("status"),
			},
			"Serviço Online!",
		);

		res.status(body.status).json(body);
	}

	/**
	 * Limpa o cache do servidor se o ID de redefinição de cache corresponder ao valor esperado.
	 * @param cacheResetId - ID de redefinição de cache fornecido pelo usuário.
	 * @param res - Resposta HTTP para enviar o resultado da operação de limpeza do cache.
	 */
	@ApiOperation({ summary: "Limpa o cache do servidor." })
	@AppCustomObjectResponse("Cache limpo com sucesso!")
	@Public()
	@Get("clear-cache")
	async clearCache(@Query("cache-reset-id") cacheResetId: string, @Res() res: Response) {
		if (cacheResetId !== process.env.CACHE_RESET_ID) {
			return res.status(401).json({ message: "Você não tem permissão para limpar o cache." });
		}

		await this.cacheService.reset();

		const body = HttpResponse.ok("Cache limpo com sucesso!");

		res.status(body.status).json(body);
	}
}
