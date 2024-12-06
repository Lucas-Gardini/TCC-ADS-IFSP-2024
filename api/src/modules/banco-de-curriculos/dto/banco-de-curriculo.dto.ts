import { IsOptional, IsString } from "class-validator";

/**
 * DTO para representar um banco de currículos.
 * Utilizado para definir as informações básicas de um banco de currículos,
 * incluindo o nome e um ícone opcional.
 */
export class BancoDeCurriculoDto {
	/**
	 * Nome do banco de currículos.
	 * Este campo é obrigatório e deve ser uma string.
	 */
	@IsString()
	nome: string;

	/**
	 * Ícone opcional associado ao banco de currículos.
	 * Se fornecido, deve ser uma string.
	 */
	@IsOptional()
	@IsString()
	icone?: string;
}
