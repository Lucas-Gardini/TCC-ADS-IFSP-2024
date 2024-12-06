import { DateTime } from "luxon";

/**
 * Enumeração dos tipos de log com emojis representativos.
 */
export enum eLogType {
	INFO = "ℹ️",
	ERROR = "❌",
	SUCCESS = "✅",
	WARNING = "⚠️",
	MONGODB = "🍃",
	CONNECTION = "🔌",
	APP = "🌐",
	UNAUTHORIZED = "🔒",
	AUTHORIZED = "🔑",
	MAIL = "📧",
}

/**
 * Envia uma mensagem de log formatada no console.
 * Inclui um emoji representativo do tipo de log e uma mensagem.
 * A data e hora são formatadas no fuso horário de São Paulo, Brasil.
 *
 * @param emoji - Tipo de log representado por um emoji do enum `eLogType`.
 * @param message - Mensagem a ser registrada no log.
 */
export function sendLogMessage(emoji: eLogType, message: string) {
	// Data formatada no fuso horário de São Paulo, Brasil
	const formattedDate = DateTime.now().setZone("America/Sao_Paulo").toFormat("dd/MM/yyyy HH:mm:ss");

	// Mensagem formatada com data, emoji e mensagem
	const formattedMessage = `[${formattedDate}] [${emoji}] ${message}`;

	// Imprime a mensagem formatada no console
	console.log(formattedMessage);
}
