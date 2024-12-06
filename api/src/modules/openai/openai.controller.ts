import { Body, Controller, Get, Post, Put, Res } from "@nestjs/common";
import { OpenaiService } from "./openai.service";
import { ChatBotDto, SaveConfigsDto } from "./openai.dto";
import { Response } from "express";

/**
 * Controlador responsável por gerenciar as rotas relacionadas ao serviço OpenAI.
 *
 * Este controlador é utilizado para definir as rotas e manipular as requisições associadas
 * ao serviço OpenAI, encapsulado na classe `OpenaiService`.
 */
@Controller("openai")
export class OpenaiController {
	/**
	 * Cria uma instância de `OpenaiController`.
	 *
	 * @param {OpenaiService} openaiService - Instância do serviço OpenAI utilizado para
	 * executar as operações relacionadas à API OpenAI.
	 */
	constructor(private readonly openaiService: OpenaiService) {}

	@Post("chat-bot")
	async chatBot(@Res() res: Response, @Body() chatDto: ChatBotDto) {
		const response = await this.openaiService.chatBot(chatDto);

		res.status(response.status).json(response);
	}

	@Get("configs")
	async getConfigs(@Res() res: Response) {
		const response = await this.openaiService.getConfigs();

		res.status(response.status).json(response);
	}

	@Put("configs")
	async setConfigs(@Res() res: Response, @Body() body: SaveConfigsDto) {
		const response = await this.openaiService.setConfigs(body);

		res.status(response.status).json(response);
	}
}
