import { Controller } from "@nestjs/common";
import { MailService } from "./mail.service";

/**
 * Controlador responsável por gerenciar as rotas relacionadas ao serviço de e-mail.
 *
 * Este controlador é utilizado para definir as rotas e manipular as requisições associadas
 * ao serviço de e-mail, encapsulado na classe `MailService`.
 */
@Controller("mail")
export class MailController {
	/**
	 * Cria uma instância de `MailController`.
	 *
	 * @param {MailService} mailService - Instância do serviço de e-mail utilizado para
	 * executar operações relacionadas ao envio e gerenciamento de e-mails.
	 */
	constructor(private readonly mailService: MailService) {}
}
