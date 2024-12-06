import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSOES_KEY } from "./app.decorator";
import { ePermissao } from "./modules/auth/enums/role.enum";
import { IServiceResponse } from "semantic-response";
import { AuthService } from "./modules/auth/auth.service";

/**
 * Guardião de autenticação e autorização.
 *
 * Este guardião é responsável por verificar se um usuário tem permissão para acessar um recurso específico.
 */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	/**
	 * Método que é chamado para verificar se um usuário tem permissão para acessar um recurso.
	 *
	 * @param context - O contexto de execução que contém informações sobre a rota e o usuário.
	 * @returns Uma promessa que resolve para um booleano indicando se o usuário tem permissão para acessar o recurso.
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Obtém as permissões necessárias para acessar o recurso.
		const requiredRoles = this.reflector.getAllAndOverride<ePermissao[]>(PERMISSOES_KEY, [context.getHandler(), context.getClass()]);

		// Se não há permissões necessárias, permite o acesso.
		if (!requiredRoles) {
			return true;
		}

		// Obtém o usuario da requisição.
		const user = context.switchToHttp().getRequest().session?.data?.user;

		if (!user && requiredRoles.length > 0)
			throw new UnauthorizedException({
				status: 401,
				success: false,
				error: {
					message: "Você não tem permissão para acessar este recurso.",
				},
			} as IServiceResponse);

		// Obtém as permissões do usuario.
		const permissoes = await this.authService.getPermissions(user._id);

		// Se houve um erro ao obter as permissões, lança uma exceção.
		if (permissoes.status !== 200)
			throw new UnauthorizedException({
				status: permissoes.status,
				success: false,
				error: {
					message: "Não foi possível verificar suas permissões.",
					data: permissoes.data ?? permissoes.error,
				},
			} as IServiceResponse);

		// Se o usuario tem a permissão MASTER, permite o acesso.
		if (permissoes.data.includes(ePermissao.MASTER)) return true;

		// Verifica se o usuario tem alguma das permissões necessárias.
		const canPass = requiredRoles.some((role) => permissoes.data?.includes(role));

		// Se o usuario não tem nenhuma das permissões necessárias, lança uma exceção.
		if (!canPass)
			throw new UnauthorizedException({
				status: 401,
				success: false,
				error: {
					message: "Você não tem permissão para acessar este recurso.",
				},
			} as IServiceResponse);

		// Retorna se o usuario pode ou não acessar o recurso.
		return canPass;
	}
}
