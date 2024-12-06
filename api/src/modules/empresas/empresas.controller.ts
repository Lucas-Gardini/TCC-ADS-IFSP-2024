import { Body, Controller, Delete, Get, Put, Req, Res } from "@nestjs/common";
import { EmpresaService } from "./empresas.service";
import { EmpresaDto, PartialEmpresaDto } from "./dto/empresa.dto";
import { AppCustomObjectResponse, AppDtoResponse, AppErrorResponse, Permissao } from "../../app.decorator";
import { Request, Response } from "express";
import { ePermissao } from "../auth/enums/role.enum";
import { ApiOperation } from "@nestjs/swagger";
import { HttpResponse } from "semantic-response";
import { Public } from "../auth/auth.guard";

/**
 * Controlador para operações relacionadas às empresas.
 * Oferece endpoints para criação, leitura, atualização e exclusão de empresas.
 */
@Controller("empresa")
export class EmpresaController {
	constructor(private readonly empresasService: EmpresaService) {}

	/**
	 * Obtém a empresa associada ao usuário atual.
	 * @param req Requisição HTTP.
	 * @param res Resposta HTTP.
	 * @returns Retorna um objeto `EmpresaDto` com os detalhes da empresa ou um erro.
	 */
	@ApiOperation({ summary: "Obtenção de empresa" })
	@AppDtoResponse(EmpresaDto)
	@AppErrorResponse()
	@Public()
	@Get()
	async getEmpresa(@Req() req: Request, @Res() res: Response) {
		const body = await this.empresasService.getEmpresa(req.session.data?.user?._id);

		res.status(body.status).json(body);
	}

	/**
	 * Atualiza os dados de uma empresa existente.
	 * @param empresaDto Dados atualizados da empresa.
	 * @param req Requisição HTTP.
	 * @param res Resposta HTTP.
	 * @returns Retorna o objeto `EmpresaDto` com os dados atualizados ou um erro.
	 */
	@ApiOperation({ summary: "Atualização de empresa" })
	@AppDtoResponse(EmpresaDto)
	@AppErrorResponse()
	@Permissao(ePermissao.MASTER, ePermissao.ADMIN)
	@Put()
	async putEmpresaUsuario(@Body() empresaDto: PartialEmpresaDto, @Req() req: Request, @Res() res: Response) {
		const body = await this.empresasService.updateEmpresa(empresaDto);

		res.status(body.status).json(body);
	}

	/**
	 * Solicita a exclusão de uma empresa.
	 * @param req Requisição HTTP.
	 * @param res Resposta HTTP.
	 * @returns Retorna uma mensagem de confirmação ou um erro.
	 */
	@ApiOperation({ summary: "Solicitação de exclusão de empresa" })
	@AppCustomObjectResponse("string")
	@AppErrorResponse()
	@Permissao(ePermissao.MASTER, ePermissao.ADMIN)
	@Delete()
	async deleteEmpresa(@Req() req: Request, @Res() res: Response) {
		res.status(200).json(
			HttpResponse.ok(
				"Todos os seus dados foram deletados :(. É recomendado que você reinicie a aplicação, caso deseje continuar utilizando-a.",
			),
		);
		await this.empresasService.deleteEmpresa();
		process.kill(process.pid, "SIGINT");
		throw new Error("Processo finalizado.");
	}
}
