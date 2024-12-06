import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

/**
 * Data Transfer Object para criação ou atualização completa de uma empresa.
 * Utilizado para validar e documentar as informações enviadas para a criação ou atualização de uma empresa.
 */
export class EmpresaDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	cnpj: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	razaoSocial: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	nomeFantasia?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	telefone?: string;

	@ApiProperty()
	@IsEmail()
	@ValidateIf((o) => !!o.email)
	email?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	cep?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	logradouro?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	numero?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	complemento?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	bairro?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	cidade?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	estado?: string;
}

/**
 * Data Transfer Object para atualização parcial de uma empresa.
 * Utilizado para validar e documentar as informações enviadas para atualização parcial de uma empresa.
 */
export class PartialEmpresaDto {
	@ApiProperty()
	@IsString()
	@IsOptional()
	cnpj?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	razaoSocial?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	nomeFantasia?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	telefone?: string;

	@ApiProperty()
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	cep?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	logradouro?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	numero?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	complemento?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	bairro?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	cidade?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	estado?: string;
}
