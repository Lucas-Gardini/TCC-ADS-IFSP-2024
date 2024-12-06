import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { SentMessageInfo, Transporter, createTransport } from "nodemailer";
import { eLogType, sendLogMessage } from "../../utils/sendLogMessage";

/**
 * Serviço responsável pelo gerenciamento do envio de e-mails.
 *
 * Este serviço utiliza a biblioteca `nodemailer` para configurar e enviar e-mails.
 * Ele também registra mensagens de log para rastrear operações relacionadas ao envio de e-mails.
 */
@Injectable()
export class MailService implements OnApplicationBootstrap {
	private transporter: Transporter;

	/**
	 * Configura o transportador de e-mails quando a aplicação é inicializada.
	 *
	 * Cria uma instância do `Transporter` do `nodemailer` e verifica a conexão com o servidor de e-mail.
	 * Registra uma mensagem de log indicando o sucesso ou falha na conexão.
	 */
	async onApplicationBootstrap() {
		this.transporter = createTransport({
			host: process.env.MAIL_HOST,
			port: parseInt(process.env.MAIL_PORT),
			secure: process.env.MAIL_SECURE === "true",
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS,
			},
		});

		this.transporter.verify((error) => {
			if (error) {
				sendLogMessage(eLogType.ERROR, "Erro ao conectar com o servidor de email " + error);
			} else {
				sendLogMessage(eLogType.INFO, "Conexão com o servidor de email estabelecida");
			}
		});
	}

	/**
	 * Envia um e-mail de confirmação de e-mail para o destinatário.
	 *
	 * @param {string} to - Endereço de e-mail do destinatário.
	 * @param {string} token - Token de confirmação para o link de validação.
	 * @returns {Promise<SentMessageInfo>} - Promessa que resolve para informações sobre o e-mail enviado.
	 */
	async sendAuthMail(to: string, token: string): Promise<SentMessageInfo> {
		const baseUrl = process.env.APP_HOST + ":" + process.env.APP_PORT + "/api";

		const subject = "Confirmação de Email";
		const html = `
		<h1>Confirme seu email</h1>
		<p>Clique no link abaixo para confirmar seu email</p>
		<a href="${baseUrl}/auth/confirmar-email?token=${token}">Confirmar email</a>
		`;

		return await this.sendMail(to, subject, html);
	}

	/**
	 * Envia um e-mail para recuperação de senha.
	 *
	 * @param {string} to - Endereço de e-mail do destinatário.
	 * @param {string} token - Token de recuperação para o link de recuperação de senha.
	 * @returns {Promise<SentMessageInfo>} - Promessa que resolve para informações sobre o e-mail enviado.
	 */
	async sendRecoverPasswordMail(to: string, token: string): Promise<SentMessageInfo> {
		const baseUrl = process.env.APP_HOST + ":" + process.env.APP_PORT + "/api";

		const subject = "Recuperação de senha";
		const html = `
		<h1>Recuperação de senha</h1>
		<p>Clique no link abaixo para recuperar sua senha</p>
		<a href="${baseUrl}/auth/recuperar-senha?token=${token}">Recuperar senha</a>
		`;

		return await this.sendMail(to, subject, html);
	}

	/**
	 * Envia um e-mail genérico com as opções fornecidas.
	 *
	 * @param {string} to - Endereço de e-mail do destinatário.
	 * @param {string} subject - Assunto do e-mail.
	 * @param {string} html - Conteúdo HTML do e-mail.
	 * @returns {Promise<SentMessageInfo>} - Promessa que resolve para informações sobre o e-mail enviado.
	 */
	async sendMail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
		const mailOptions = {
			from: process.env.MAIL_USER,
			to,
			subject,
			html,
		};

		sendLogMessage(eLogType.MAIL, `Enviando email para ${to} com o assunto ${subject}`);
		return await this.transporter.sendMail(mailOptions);
	}
}
