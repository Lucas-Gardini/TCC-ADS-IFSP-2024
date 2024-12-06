import { ApiProperty } from "@nestjs/swagger";
import * as CV from "class-validator";

/**
 * DTO para representar uma resposta de autenticação bem-sucedida.
 * Inclui informações básicas do usuário após um login ou uma operação de autenticação bem-sucedida.
 */
export class AuthSuccessDto {
	/**
	 * Email do usuário.
	 * @example "usuario@exemplo.com"
	 */
	@ApiProperty({
		description: "Email do usuário",
		example: "usuario@exemplo.com",
	})
	@CV.IsNotEmpty()
	@CV.IsString()
	@CV.IsEmail()
	email: string;

	/**
	 * Senha do usuário.
	 * @example "senhaSecreta123"
	 */
	@ApiProperty({
		description: "Senha do usuário",
		example: "senhaSecreta123",
	})
	@CV.IsNotEmpty()
	@CV.IsString()
	senha: string;

	/**
	 * Nome de exibição do usuário.
	 * @example "João da Silva"
	 */
	@ApiProperty({
		description: "Nome de exibição do usuário",
		example: "João da Silva",
	})
	@CV.IsNotEmpty()
	@CV.IsString()
	nomeExibicao: string;
}
