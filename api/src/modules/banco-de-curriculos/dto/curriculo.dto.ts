import { IsString, IsOptional, IsArray, IsEnum, IsObject, ValidateNested, ValidateIf } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO para representar uma experiência profissional.
 * Utilizado para armazenar detalhes sobre uma experiência de trabalho.
 */
export class ExperienciaDto {
	/**
	 * Tempo dedicado à experiência.
	 */
	@IsString()
	@IsString()
	tempo?: string;

	/**
	 * Local onde a experiência foi adquirida.
	 */
	@IsString()
	@IsString()
	local?: string;

	/**
	 * Descrição adicional da experiência.
	 */
	@IsOptional()
	@IsString()
	descricao?: string;
}

/**
 * DTO para representar a formação educacional ou curso.
 * Utilizado para armazenar detalhes sobre a formação educacional ou curso.
 */
export class FormacaoCursoDto {
	/**
	 * Nome da instituição onde a formação ou curso foi realizado.
	 */
	@IsString()
	@IsOptional()
	instituicao?: string;

	/**
	 * Nome do curso ou formação.
	 */
	@IsOptional()
	@IsString()
	nome?: string;

	/**
	 * Descrição adicional sobre a formação ou curso.
	 */
	@IsOptional()
	@IsString()
	descricao?: string;

	/**
	 * Tempo dedicado à formação ou curso.
	 */
	@IsOptional()
	@IsString()
	tempo?: string;
}

/**
 * DTO para representar contatos adicionais.
 * Inclui telefones, cidade, email e redes sociais.
 */
export class ContatoDto {
	/**
	 * Lista de números de telefone.
	 */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	telefones?: string[];

	/**
	 * Cidade de contato.
	 */
	@IsOptional()
	@IsString()
	cidade?: string;

	/**
	 * Email de contato.
	 */
	@IsOptional()
	@IsString()
	email?: string;

	/**
	 * Lista de redes sociais associadas.
	 */
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RedeSocialDto)
	redesSociais?: RedeSocialDto[];
}

/**
 * DTO para representar uma rede social.
 * Inclui o nome da rede social e o URL associado.
 */
export class RedeSocialDto {
	/**
	 * Nome da rede social.
	 */
	@IsString()
	@IsOptional()
	nome?: string;

	/**
	 * URL do perfil na rede social.
	 */
	@IsString()
	@IsOptional()
	url?: string;
}

/**
 * DTO para representar um currículo.
 * Inclui informações pessoais, habilidades, experiências, formações e contatos.
 */
export class CurriculoDto {
	/**
	 * Nome do candidato.
	 */
	@IsString()
	nome: string;

	/**
	 * Idade do candidato.
	 */
	@IsOptional()
	@IsString()
	idade?: string;

	/**
	 * Cargo atual do candidato.
	 */
	@IsOptional()
	@IsString()
	empregoOuCargoAtual?: string;

	/**
	 * Descrição pessoal sobre o candidato.
	 */
	@IsOptional()
	@IsString()
	sobre?: string;

	/**
	 * Gênero do candidato.
	 */
	@IsEnum(["Masculino", "Feminino", "Outros", "Não Especificado", "Não especificado"])
	genero: string;

	/**
	 * Lista de habilidades do candidato.
	 */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	habilidades?: string[];

	/**
	 * Lista de experiências profissionais do candidato.
	 */
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ExperienciaDto)
	@ValidateIf((o) => o.experiencias)
	experiencias?: ExperienciaDto[];

	/**
	 * Lista de formações educacionais do candidato.
	 */
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FormacaoCursoDto)
	@ValidateIf((o) => o.formacoes)
	formacoes?: FormacaoCursoDto[];

	/**
	 * Lista de cursos realizados pelo candidato.
	 */
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FormacaoCursoDto)
	@ValidateIf((o) => o.cursos)
	cursos?: FormacaoCursoDto[];

	/**
	 * Dados de contato do candidato.
	 */
	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => ContatoDto)
	@ValidateIf((o) => o.contato)
	contato?: ContatoDto;

	/**
	 * Objetivo do candidato.
	 */
	@IsOptional()
	@IsString()
	objetivo?: string;

	/**
	 * Dados adicionais não estruturados.
	 */
	@IsOptional()
	@IsArray()
	@IsObject({ each: true })
	dadosExtras?: Array<{ nome: string; valor: string }>;

	/**
	 * Documento associado ao currículo.
	 */
	@IsOptional()
	documento?: string;
}
