import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";

import { Public } from "./auth.guard";
import { AuthService } from "./auth.service";
import { UsuarioDto, LoginDto, UpdateUserDto } from "./dto/usuario.dto";
import { AppErrorResponse, AppDtoResponse, AppTextResponse, Permissao } from "../../app.decorator";
import { ePermissao } from "./enums/role.enum";
import { HttpResponse } from "semantic-response";

/**
 * Controlador responsável pelas rotas de autenticação e gerenciamento de usuários.
 */
@ApiTags("Autenticação e Usuários")
@Controller("auth")
export class AuthController {
	/**
	 * Construtor padrão do `AuthController`.
	 *
	 * @param authService Serviço que fornece funcionalidades relacionadas à autenticação e gerenciamento de usuários.
	 */
	constructor(private readonly authService: AuthService) {}

	/**
	 * Obtém as informações do usuário atual.
	 * @param req - Requisição HTTP que contém os dados da sessão do usuário.
	 * @param res - Resposta HTTP para enviar os dados do usuário.
	 */
	@AppDtoResponse(UsuarioDto)
	@AppErrorResponse()
	@Permissao(ePermissao.USUARIO, ePermissao.SUPORTE)
	@Get("usuario")
	async getMe(@Req() req: Request, @Res() res: Response) {
		const body = await this.authService.getUser(req.session.data.user._id);

		if (typeof body.data === "object" && "token" in body.data) delete body.data.token;

		res.status(body.status).json(body);
	}

	/**
	 * Atualiza as informações do usuário atual.
	 * @param usuario - Dados do usuário a serem atualizados.
	 * @param req - Requisição HTTP que contém os dados da sessão do usuário.
	 * @param res - Resposta HTTP para enviar a confirmação da atualização.
	 */
	@Put("usuario")
	@ApiOperation({ summary: "Atualização de usuário" })
	@AppTextResponse("Usuário atualizado com sucesso!")
	@Permissao(ePermissao.SUPORTE)
	async updateMyUser(@Body() usuario: UpdateUserDto, @Req() req: Request, @Res() res: Response) {
		const body = await this.authService.updateUser(req.session.data.user._id, usuario);

		res.status(body.status).json(body);
	}

	/**
	 * Obtém as informações de um usuário específico.
	 * @param id - ID do usuário a ser obtido.
	 * @param res - Resposta HTTP para enviar os dados do usuário.
	 */
	@ApiOperation({ summary: "Obtenção de usuário" })
	@AppDtoResponse(UsuarioDto)
	@Permissao(ePermissao.SUPORTE)
	@Get("usuario/:id")
	async getUser(@Param("id") id: string, @Res() res: Response) {
		const body = await this.authService.getUser(id);

		res.status(body.status).json(body);
	}

	/**
	 * Cria um novo usuário.
	 * @param usuario - Dados do novo usuário a ser criado.
	 * @param res - Resposta HTTP para enviar a confirmação da criação.
	 */
	@ApiOperation({ summary: "Criação de usuario/usuário" })
	@AppTextResponse("Usuário cadastrado com sucesso!")
	@Public()
	@Post("usuario")
	async createUser(@Body() usuario: UsuarioDto, @Res() res: Response) {
		const body = await this.authService.createUser(usuario);

		res.status(body.status).json(body);
	}

	/**
	 * Atualiza as informações de um usuário específico.
	 * @param id - ID do usuário a ser atualizado.
	 * @param usuario - Dados atualizados do usuário.
	 * @param res - Resposta HTTP para enviar a confirmação da atualização.
	 */
	@Put("usuario/:id")
	@ApiOperation({ summary: "Atualização de usuário" })
	@AppTextResponse("Usuário atualizado com sucesso!")
	@Permissao(ePermissao.SUPORTE)
	async updateUser(@Param("id") id: string, @Body() usuario: UpdateUserDto, @Res() res: Response) {
		const body = await this.authService.updateUser(id, usuario);

		res.status(body.status).json(body);
	}

	/**
	 * Exclui um usuário específico.
	 * @param id - ID do usuário a ser excluído.
	 * @param res - Resposta HTTP para enviar a confirmação da exclusão.
	 */
	@Delete("usuario/:id")
	@ApiOperation({ summary: "Exclusão de usuário" })
	@AppTextResponse("Usuário excluído com sucesso!")
	@Permissao(ePermissao.SUPORTE)
	async deleteUser(@Param("id") id: string, @Res() res: Response) {
		const body = await this.authService.deleteUser(id);

		res.status(body.status).json(body);
	}

	/**
	 * Valida um usuário com base em um token fornecido.
	 * @param token - Token para validação do usuário.
	 * @param res - Resposta HTTP para enviar a confirmação da validação.
	 */
	@ApiOperation({ summary: "Validar usuário" })
	@AppTextResponse("Usuário validado!")
	@AppErrorResponse()
	@Public()
	@Get("validar/:token")
	async validateUser(@Param("token") token: string, @Res() res: Response) {
		const body = await this.authService.validateUser(token);

		res.status(body.status).json(body);
	}

	/**
	 * Realiza o login do usuário na plataforma.
	 * @param signInDto - Dados de login do usuário (email e senha).
	 * @param res - Resposta HTTP para enviar a confirmação do login.
	 * @param req - Requisição HTTP para armazenar os dados da sessão do usuário.
	 */
	@ApiOperation({ summary: "Login na plataforma" })
	@AppDtoResponse(UsuarioDto)
	@AppErrorResponse()
	@Public()
	@HttpCode(HttpStatus.OK)
	@Post("login")
	async signIn(@Body() signInDto: LoginDto, @Res() res: Response, @Req() req: Request) {
		const body = await this.authService.signIn(signInDto.email, signInDto.senha);

		if (body.status !== 200) return res.status(body.status).json(body);

		req.session.data = {
			user: body.data,
		};

		res.status(body.status).json(body);
	}

	/**
	 * Realiza o logout do usuário da plataforma.
	 * @param res - Resposta HTTP para enviar a confirmação do logout.
	 * @param req - Requisição HTTP para destruir a sessão do usuário.
	 */
	@ApiOperation({ summary: "Logout da plataforma" })
	@AppTextResponse("Logout realizado com sucesso!")
	@Public()
	@HttpCode(HttpStatus.OK)
	@Delete("logout")
	async signOut(@Res() res: Response, @Req() req: Request) {
		req.session.destroy((err) => {
			if (err) {
				res.status(500).json(HttpResponse.internalServerError({ message: "Erro ao realizar logout", data: err }));
			} else {
				res.status(200).json(HttpResponse.ok("Logout realizado com sucesso!"));
			}
		});
	}

	/**
	 * Envia um email para recuperação de senha para o usuário.
	 * @param body - Contém o email do usuário para o qual o email de recuperação de senha será enviado.
	 * @param res - Resposta HTTP para enviar a confirmação do envio do email.
	 */
	@ApiOperation({ summary: "Recuperar senha" })
	@AppTextResponse("Email de recuperação de senha enviado com sucesso!")
	@Public()
	@Post("recuperar-senha")
	async recoverPassword(@Body() body: { email: string }, @Res() res: Response) {
		const response = await this.authService.recoverPassword(body.email);

		res.status(response.status).json(response);
	}

	/**
	 * Realiza a validação da sessão do usuário logado.
	 * @param req - Requisição HTTP que contém os dados da sessão do usuário.
	 * @param res - Resposta HTTP para enviar a confirmação da validação da sessão.
	 * @returns - Retorna a confirmação da validação da sessão.
	 */
	@ApiOperation({ summary: "Valida a sessão do usuário logado" })
	@AppTextResponse("Sessão válida")
	@Get("validar-sessao")
	async validateSession(@Req() req: Request, @Res() res: Response) {
		if (req?.session?.data?.user) return res.status(200).json(HttpResponse.ok("Sessão válida"));
		return res.status(401).json(HttpResponse.unauthorized({}, "Sessão inválida"));
	}
}
