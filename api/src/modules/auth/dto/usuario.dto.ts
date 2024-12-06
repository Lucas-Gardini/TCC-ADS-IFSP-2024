import * as CV from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EmpresaDto } from "../../empresas/dto/empresa.dto";

/**
 * DTO para representação de um usuário.
 * Utilizado para criar e atualizar usuários, e também para exibir informações sobre o usuário.
 */
export class UsuarioDto {
	@ApiProperty({ description: "ID do usuário" })
	_id?: string;

	@ApiProperty({ description: "Email do usuário" })
	@CV.IsNotEmpty()
	@CV.IsString()
	@CV.IsEmail()
	email: string;

	@ApiProperty({ description: "Senha do usuário" })
	@CV.IsNotEmpty()
	@CV.IsString()
	senha: string;

	@ApiProperty({ description: "Nome de exibição do usuário" })
	@CV.IsNotEmpty()
	@CV.IsString()
	nomeExibicao: string;

	@ApiProperty({ description: "Token de autenticação do usuário", required: false })
	token?: string;

	@ApiProperty({ description: "Informações da empresa associada ao usuário", required: false })
	empresa?: EmpresaDto & { _id: string };
}

/**
 * DTO para atualização das informações de um usuário.
 * Utilizado para atualizar dados de um usuário existente.
 */
export class UpdateUserDto {
	@ApiProperty({ description: "Email do usuário", required: false })
	@CV.IsNotEmpty()
	@CV.IsString()
	@CV.IsEmail()
	@CV.IsOptional()
	email: string;

	@ApiProperty({ description: "Senha do usuário", required: false })
	@CV.IsOptional()
	@CV.IsString()
	senha: string;

	@ApiProperty({ description: "Nome de exibição do usuário", required: false })
	@CV.IsOptional()
	@CV.IsString()
	nomeExibicao: string;
}

/**
 * DTO para login de um usuário.
 * Utilizado para autenticação de usuários no sistema.
 */
export class LoginDto {
	@ApiProperty({ description: "Email do usuário para login" })
	@CV.IsNotEmpty()
	@CV.IsString()
	@CV.IsEmail()
	email: string;

	@ApiProperty({ description: "Senha do usuário para login" })
	@CV.IsNotEmpty()
	@CV.IsString()
	senha: string;
}
