import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

// Chave para identificar se uma rota é pública
export const IS_PUBLIC_KEY = "isPublic";

// Decorator para marcar uma rota como pública
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Guarda de autenticação que verifica se o usuário está autenticado antes de permitir o acesso a uma rota.
 */
@Injectable()
export class AuthGuard implements CanActivate {
	/**
	 * Construtor padrão do `AuthGuard`.
	 *
	 * @param reflector Refletor que permite acessar metadados de controladores e manipuladores.
	 */
	constructor(private reflector: Reflector) {}

	/**
	 * Verifica se a requisição pode ser ativada.
	 * @param context Contexto de execução que contém informações sobre a solicitação e o manipulador.
	 * @returns Retorna uma Promise que resolve para `true` se a rota pode ser ativada, ou `false` caso contrário.
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Verifica se a rota é pública utilizando o metadata configurado
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

		const request = context.switchToHttp().getRequest() as Request;
		const user = request.session?.data?.user;

		// Se a rota for pública, permite o acesso sem autenticação
		if (isPublic) {
			return true;
		}

		// Se não houver usuário autenticado na sessão, lança uma exceção de não autorizado
		if (!user) throw new UnauthorizedException();

		// Se o usuário está autenticado, permite o acesso à rota
		return true;
	}
}
