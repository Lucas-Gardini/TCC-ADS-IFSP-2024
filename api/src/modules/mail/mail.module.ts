import { Global, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";

/**
 * Módulo responsável por fornecer e configurar o serviço de e-mail e seu controlador.
 *
 * Este módulo encapsula a lógica relacionada ao serviço de e-mail e disponibiliza
 * o controlador e o serviço de e-mail para outros módulos da aplicação.
 * É um módulo global, o que significa que o `MailService` estará disponível em toda a aplicação.
 */
@Global()
@Module({
	/**
	 * Controladores utilizados neste módulo.
	 *
	 * @type {Array<MailController>}
	 */
	controllers: [MailController],

	/**
	 * Serviços fornecidos por este módulo.
	 *
	 * @type {Array<MailService>}
	 */
	providers: [MailService],

	/**
	 * Serviços que serão exportados para outros módulos.
	 *
	 * @type {Array<MailService>}
	 */
	exports: [MailService],
})
export class MailModule {}
