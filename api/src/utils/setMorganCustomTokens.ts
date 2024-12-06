import chalk from "chalk";
import { Request } from "express";
import { DateTime } from "luxon";
import morgan from "morgan";

/**
 * Configura e retorna o formato de log personalizado para o Morgan.
 * Inclui tokens personalizados para status, método, IP, user-agent e data.
 *
 * @returns O formato de log configurado para o Morgan.
 */
export default function () {
	// Definição dos tokens personalizados para o Morgan
	/**
	 * Token personalizado para colorir o status HTTP.
	 *
	 * @param req - Objeto de requisição (não utilizado neste token).
	 * @param res - Objeto de resposta para obter o status HTTP.
	 * @returns O status HTTP colorido com base no código de status.
	 */
	morgan.token("colored-status", (req, res) => {
		const status = res.statusCode;
		let color = "green";
		if (status >= 500) color = "red";
		else if (status >= 400) color = "yellow";
		else if (status >= 300) color = "cyan";
		return chalk.keyword(color)(status);
	});

	/**
	 * Token personalizado para colorir o user-agent.
	 *
	 * @param req - Objeto de requisição para obter o user-agent.
	 * @returns O user-agent colorido, ou "user-agent-não-informado" se não estiver presente.
	 */
	morgan.token("colored-user-agent", (req) => chalk.blue((req?.headers["user-agent"] ?? "user-agent-não-informado").split(" ")[0] || ""));

	/**
	 * Token personalizado para colorir o IP do cliente.
	 *
	 * @param req - Objeto de requisição para obter o IP do cliente.
	 * @returns O IP do cliente colorido.
	 */
	morgan.token("colored-ip", (req) => chalk.greenBright((<any>req).ip));

	/**
	 * Token personalizado para colorir o método HTTP.
	 *
	 * @param req - Objeto de requisição para obter o método HTTP.
	 * @returns O método HTTP colorido com fundo, baseado no tipo de método.
	 */
	morgan.token("colored-method", (req) => {
		const method = req.method;
		let bgColor = "";
		switch (method) {
			case "GET":
				bgColor = "bgGreen";
				break;
			case "POST":
				bgColor = "bgBlue";
				break;
			case "PUT":
				bgColor = "bgYellow";
				break;
			case "DELETE":
				bgColor = "bgRed";
				break;
			default:
				bgColor = "bgWhite";
		}
		return chalk.black[bgColor](` ${method} `);
	});

	/**
	 * Token personalizado para a data e hora atual.
	 *
	 * @returns A data e hora formatadas no formato "dd/MM/yyyy HH:mm:ss".
	 */
	morgan.token("current-date", () => {
		const now = DateTime.local();
		const formattedDate = now.toFormat("dd/MM/yyyy HH:mm:ss");
		return formattedDate;
	});

	/**
	 * Token personalizado para o nome de usuário.
	 *
	 * @param req - Objeto de requisição para obter o nome do usuário da sessão.
	 * @returns O nome do usuário se disponível, ou "anônimo" se não estiver presente.
	 */
	morgan.token("username", (req: Request) => req?.session?.data?.user?.nomeExibicao ?? "anônimo");

	// Formato de log configurado para o Morgan
	return "[:current-date] [🌎] :colored-method :colored-status :url | :response-time ms | :username :colored-ip :colored-user-agent";
}
