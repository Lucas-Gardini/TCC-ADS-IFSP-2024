import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { BancoDeCurriculosService } from "./banco-de-curriculos.service";
import { BancoDeCurriculoDto } from "./dto/banco-de-curriculo.dto";
import { PastaDto } from "./dto/pasta.dto";
import { CurriculoDto } from "./dto/curriculo.dto";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { IServiceResponse } from "semantic-response";

const DEZ_MINUTOS_EM_SEGUNDOS = 600;

/**
 * Controlador responsável pela gestão dos bancos de currículos, pastas e currículos.
 * Fornece endpoints para criar, listar, atualizar e excluir bancos de currículos, pastas e currículos.
 * Também inclui um endpoint para extrair dados de currículos a partir de arquivos.
 *
 * @controller BancoDeCurriculosController
 */
@Controller("banco-de-curriculos")
export class BancoDeCurriculosController {
	constructor(
		@Inject(CACHE_MANAGER) private cacheService: Cache,
		private readonly bancoDeCurriculosService: BancoDeCurriculosService,
	) {}

	//#region CRUD - Banco de Currículos

	/**
	 * Lista todos os bancos de currículos.
	 * Utiliza cache para otimizar o desempenho das consultas.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @returns Uma lista de bancos de currículos
	 */
	@Get()
	async listarBancoDeCurriculos(@Req() req: Request, @Res() res: Response) {
		let body: IServiceResponse = await this.cacheService.get(`banco-de-curriculos`);
		if (!body) {
			body = await this.bancoDeCurriculosService.listarBancoDeCurriculos();
			await this.cacheService.set(`banco-de-curriculos`, body, { ttl: DEZ_MINUTOS_EM_SEGUNDOS });
		}

		res.status(body.status).json(body);
	}

	/**
	 * Obtém detalhes de um banco de currículos específico.
	 * Utiliza cache para otimizar o desempenho das consultas.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param id - ID do banco de currículos
	 * @returns Detalhes do banco de currículos
	 */
	@Get(":id")
	async obterBancoDeCurriculos(@Req() req: Request, @Res() res: Response, @Param("id") id: string) {
		let body: IServiceResponse = await this.cacheService.get(`banco-de-curriculos-${id}`);
		if (!body) {
			body = await this.bancoDeCurriculosService.obterBancoDeCurriculos(id);
			await this.cacheService.set(`banco-de-curriculos-${id}`, body, { ttl: DEZ_MINUTOS_EM_SEGUNDOS });
		}
		res.status(body.status).json(body);
	}

	/**
	 * Cria um novo banco de currículos.
	 * Limpa o cache associado após a criação.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param bancoDeCurriculoDto - Dados do banco de currículos a serem criados
	 * @returns Detalhes do banco de currículos criado
	 */
	@Post()
	async criarBancoDeCurriculos(@Req() req: Request, @Res() res: Response, @Body() bancoDeCurriculoDto: BancoDeCurriculoDto) {
		const body = await this.bancoDeCurriculosService.criarBancoDeCurriculos(bancoDeCurriculoDto);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
		}

		res.status(body.status).json(body);
	}

	/**
	 * Atualiza um banco de currículos existente.
	 * Limpa o cache associado após a atualização.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param bancoDeCurriculoDto - Dados do banco de currículos a serem atualizados
	 * @param id - ID do banco de currículos a serem atualizados
	 * @returns Detalhes do banco de currículos atualizado
	 */
	@Put(":id")
	async editarBancoDeCurriculos(
		@Req() req: Request,
		@Res() res: Response,
		@Body() bancoDeCurriculoDto: BancoDeCurriculoDto,
		@Param("id") id: string,
	) {
		const body = await this.bancoDeCurriculosService.editarBancoDeCurriculos(id, bancoDeCurriculoDto);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
			await this.cacheService.del(`banco-de-curriculos-${id}`);
		}

		res.status(body.status).json(body);
	}

	/**
	 * Exclui um banco de currículos específico.
	 * Limpa o cache associado após a exclusão.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param id - ID do banco de currículos a ser excluído
	 * @returns Status da operação de exclusão
	 */
	@Delete(":id")
	async deletarBancoDeCurriculos(@Req() req: Request, @Res() res: Response, @Param("id") id: string) {
		const body = await this.bancoDeCurriculosService.deletarBancoDeCurriculos(id);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
			await this.cacheService.del(`banco-de-curriculos-${id}`);
		}

		res.status(body.status).json(body);
	}
	//#endregion

	//#region CRUD - Pasta

	/**
	 * Lista todas as pastas associadas a um banco de currículos específico.
	 * Utiliza cache para otimizar o desempenho das consultas.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @returns Lista de pastas
	 */
	@Get(":idBancoCurriculo/pasta")
	async listarPastas(@Req() req: Request, @Res() res: Response, @Param("idBancoCurriculo") idBancoCurriculo: string) {
		let body: IServiceResponse = await this.cacheService.get(`pastas-${idBancoCurriculo}`);
		if (!body) {
			body = await this.bancoDeCurriculosService.listarPastas(idBancoCurriculo);
			await this.cacheService.set(`pastas-${idBancoCurriculo}`, body, { ttl: DEZ_MINUTOS_EM_SEGUNDOS });
		}
		res.status(body.status).json(body);
	}

	/**
	 * Obtém detalhes de uma pasta específica dentro de um banco de currículos.
	 * Utiliza cache para otimizar o desempenho das consultas.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param id - ID da pasta
	 * @returns Detalhes da pasta
	 */
	@Get(":idBancoCurriculo/pasta/:id")
	async obterPasta(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("id") id: string,
	) {
		// let body: IServiceResponse = await this.cacheService.get(`pasta-${idBancoCurriculo}-${id}`); removido cache
		let body: IServiceResponse = null;

		if (!body) {
			body = await this.bancoDeCurriculosService.obterPasta(idBancoCurriculo, id);
			await this.cacheService.set(`pasta-${idBancoCurriculo}-${id}`, body, { ttl: DEZ_MINUTOS_EM_SEGUNDOS });
		}
		res.status(body.status).json(body);
	}

	/**
	 * Cria uma nova pasta dentro de um banco de currículos específico.
	 * Limpa o cache associado após a criação.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param pastaDto - Dados da pasta a ser criada
	 * @returns Detalhes da pasta criada
	 */
	@Post(":idBancoCurriculo/pasta")
	async criarPasta(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Body() pastaDto: PastaDto,
	) {
		const body = await this.bancoDeCurriculosService.criarPasta(idBancoCurriculo, pastaDto);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
			await this.cacheService.del(`pastas-${idBancoCurriculo}`);
			await this.cacheService.del(`banco-de-curriculos-${idBancoCurriculo}`);

			if (pastaDto.pastaPai) await this.cacheService.del(`pasta-${idBancoCurriculo}-${pastaDto.pastaPai}`);
		}

		res.status(body.status).json(body);
	}

	/**
	 * Atualiza uma pasta existente dentro de um banco de currículos.
	 * Limpa o cache associado após a atualização.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param id - ID da pasta a ser atualizada
	 * @param pastaDto - Dados da pasta a ser atualizada
	 * @returns Detalhes da pasta atualizada
	 */
	@Put(":idBancoCurriculo/pasta/:id")
	async editarPasta(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("id") id: string,
		@Body() pastaDto: PastaDto,
	) {
		const body = await this.bancoDeCurriculosService.editarPasta(idBancoCurriculo, id, pastaDto);

		await this.cacheService.del(`banco-de-curriculos`);
		await this.cacheService.del(`banco-de-curriculos-${id}`);
		await this.cacheService.del(`banco-de-curriculos-${idBancoCurriculo}`);
		await this.cacheService.del(`pastas-${idBancoCurriculo}`);
		await this.cacheService.del(`pasta-${idBancoCurriculo}-${id}`);

		if (pastaDto.pastaPai) {
			await this.cacheService.del(`banco-de-curriculos-${pastaDto.pastaPai}`);
			await this.cacheService.del(`pasta-${idBancoCurriculo}-${pastaDto.pastaPai}`);
		}

		res.status(body.status).json(body);
	}

	/**
	 * Exclui uma pasta específica dentro de um banco de currículos.
	 * Limpa o cache associado após a exclusão.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param id - ID da pasta a ser excluída
	 * @returns Status da operação de exclusão
	 */
	@Delete(":idBancoCurriculo/pasta/:id")
	async deletarPasta(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("id") id: string,
		@Query("idPastaPai") idPastaPai?: string,
	) {
		const body = await this.bancoDeCurriculosService.deletarPasta(idBancoCurriculo, id);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
			await this.cacheService.del(`pastas-${idBancoCurriculo}`);
			await this.cacheService.del(`pasta-${idBancoCurriculo}-${id}`);

			if (idPastaPai) await this.cacheService.del(`pasta-${idBancoCurriculo}-${idPastaPai}`);
		}

		res.status(body.status).json(body);
	}
	//#endregion

	//#region CRUD - Currículo

	/**
	 * Lista todos os currículos dentro de uma pasta específica.
	 * Utiliza cache para otimizar o desempenho das consultas.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param idPasta - ID da pasta
	 * @returns Lista de currículos
	 */
	@Get(":idBancoCurriculo/pasta/:idPasta/curriculo")
	async listarCurriculos(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("idPasta") idPasta: string,
	) {
		let body: IServiceResponse = await this.cacheService.get(`curriculos-${idBancoCurriculo}-${idPasta}`);
		if (!body) {
			body = await this.bancoDeCurriculosService.listarCurriculos(idBancoCurriculo, idPasta);
			await this.cacheService.set(`curriculos-${idBancoCurriculo}-${idPasta}`, body, { ttl: DEZ_MINUTOS_EM_SEGUNDOS });
		}
		res.status(body.status).json(body);
	}

	/**
	 * Obtém detalhes de um currículo específico dentro de uma pasta.
	 * Utiliza cache para otimizar o desempenho das consultas.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param idPasta - ID da pasta
	 * @param id - ID do currículo
	 * @returns Detalhes do currículo
	 */
	@Get(":idBancoCurriculo/pasta/:idPasta/curriculo/:id")
	async obterCurriculo(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("idPasta") idPasta: string,
		@Param("id") id: string,
	) {
		let body: IServiceResponse = await this.cacheService.get(`curriculo-${idBancoCurriculo}-${idPasta}-${id}`);
		if (!body) {
			body = await this.bancoDeCurriculosService.obterCurriculo(idPasta, id);
			await this.cacheService.set(`curriculo-${idBancoCurriculo}-${idPasta}-${id}`, body, {
				ttl: DEZ_MINUTOS_EM_SEGUNDOS,
			});
		}
		res.status(body.status).json(body);
	}

	/**
	 * Cria um novo currículo dentro de uma pasta específica.
	 * Limpa o cache associado após a criação.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param idPasta - ID da pasta
	 * @param curriculoDto - Dados do currículo a ser criado
	 * @returns Detalhes do currículo criado
	 */
	@Post(":idBancoCurriculo/pasta/:idPasta/curriculo")
	async criarCurriculo(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("idPasta") idPasta: string,
		@Body() curriculoDto: CurriculoDto,
		@Query("idPastaPai") idPastaPai?: string,
	) {
		const body = await this.bancoDeCurriculosService.criarCurriculo(idPasta, curriculoDto, curriculoDto.documento);

		await this.cacheService.del(`curriculos-${idBancoCurriculo}-${idPasta}`);
		await this.cacheService.del(`pastas-${idBancoCurriculo}`);
		await this.cacheService.del(`pasta-${idBancoCurriculo}-${idPasta}`);
		await this.cacheService.del(`banco-de-curriculos-${idBancoCurriculo}`);
		await this.cacheService.del(`banco-de-curriculos`);

		if (idPastaPai) await this.cacheService.del(`pasta-${idBancoCurriculo}-${idPastaPai}`);

		res.status(body.status).json(body);
	}

	/**
	 * Atualiza um currículo existente dentro de uma pasta específica.
	 * Limpa o cache associado após a atualização.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param idPasta - ID da pasta
	 * @param id - ID do currículo a ser atualizado
	 * @param curriculoDto - Dados do currículo a ser atualizado
	 * @returns Detalhes do currículo atualizado
	 */
	@Put(":idBancoCurriculo/pasta/:idPasta/curriculo/:id")
	async editarCurriculo(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("idPasta") idPasta: string,
		@Param("id") id: string,
		@Body() curriculoDto: CurriculoDto,
	) {
		const body = await this.bancoDeCurriculosService.editarCurriculo(idPasta, id, curriculoDto);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
			await this.cacheService.del(`curriculos-${idBancoCurriculo}-${idPasta}`);
			await this.cacheService.del(`curriculo-${idBancoCurriculo}-${idPasta}-${id}`);
			await this.cacheService.del(`pastas-${idBancoCurriculo}`);
		}

		res.status(body.status).json(body);
	}

	/**
	 * Exclui um currículo específico dentro de uma pasta.
	 * Limpa o cache associado após a exclusão.
	 *
	 * @param req - Requisição HTTP
	 * @param res - Resposta HTTP
	 * @param idBancoCurriculo - ID do banco de currículos
	 * @param idPasta - ID da pasta
	 * @param id - ID do currículo a ser excluído
	 * @returns Status da operação de exclusão
	 */
	@Delete(":idBancoCurriculo/pasta/:idPasta/curriculo/:id")
	async deletarCurriculo(
		@Req() req: Request,
		@Res() res: Response,
		@Param("idBancoCurriculo") idBancoCurriculo: string,
		@Param("idPasta") idPasta: string,
		@Param("id") id: string,
		@Query("idPastaPai") idPastaPai?: string,
	) {
		const body = await this.bancoDeCurriculosService.deletarCurriculo(idPasta, id);

		if (body.status === 200 || body.status === 201) {
			await this.cacheService.del(`banco-de-curriculos`);
			await this.cacheService.del(`pastas-${idBancoCurriculo}`);
			await this.cacheService.del(`curriculos-${idBancoCurriculo}-${idPasta}`);
			await this.cacheService.del(`pastas-${idBancoCurriculo}`);
			await this.cacheService.del(`curriculo-${idBancoCurriculo}-${idPasta}-${id}`);

			if (idPastaPai) await this.cacheService.del(`pasta-${idBancoCurriculo}-${idPastaPai}`);
		}

		res.status(body.status).json(body);
	}

	@Get("curriculo/buscar-candidato/:bancoCurriculoId/:pastaId")
	async buscarCandidato(
		@Req() req: Request,
		@Res() res: Response,
		@Query("busca") busca: string,
		@Param("bancoCurriculoId") bancoCurriculoId: string,
		@Param("pastaId") pastaId: string,
	) {
		const body = await this.bancoDeCurriculosService.buscarCandidato(bancoCurriculoId, pastaId, busca);
		res.status(body.status).json(body);
	}
	//#endregion

	/**
	 * Extrai dados de um currículo a partir de um arquivo enviado.
	 *
	 * @param curriculo - Arquivo do currículo enviado
	 * @param res - Resposta HTTP
	 * @returns Dados extraídos do currículo
	 */
	@Post("curriculo/extrair")
	@UseInterceptors(FileInterceptor("curriculo"))
	async extrairDadosDoCurriculo(@UploadedFile() curriculo: Express.Multer.File, @Res() res: Response) {
		const body = await this.bancoDeCurriculosService.extrairDadosDoCurriculo(curriculo);

		res.status(body.status).json(body);
	}
}
