import { UsuarioDto } from "../modules/auth/dto/usuario.dto";

/**
 * Extensão da interface `Request` do Express para incluir a propriedade `usuario`.
 * Esta extensão permite adicionar informações adicionais à requisição que
 * serão acessíveis em toda a aplicação Express.
 */
declare global {
	namespace Express {
		interface Request {
			/**
			 * Propriedade `usuario` adicionada à requisição Express.
			 *
			 * @type {ClientDto}
			 */
			usuario: ClientDto;
		}
	}
}

/**
 * Extensão da interface `Session` do módulo `express-session` para incluir
 * a propriedade `data` que contém informações do usuário.
 *
 * @interface Session
 */
declare module "express-session" {
	interface Session {
		/**
		 * Dados adicionais armazenados na sessão.
		 *
		 * @type {{ user: UsuarioDto }}
		 */
		data: {
			/**
			 * Informações do usuário armazenadas na sessão.
			 *
			 * @type {UsuarioDto}
			 */
			user: UsuarioDto;
		};
	}
}
