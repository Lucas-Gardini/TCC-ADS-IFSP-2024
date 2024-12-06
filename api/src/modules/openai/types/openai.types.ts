import { z } from "zod";

/**
 * Esquema de validação para dados de um currículo usando Zod.
 * Define a estrutura esperada dos dados do currículo e suas validações.
 */
export const DadosCurriculoSchema = z.object({
	/**
	 * Perfil do candidato, contendo informações pessoais e profissionais.
	 */
	perfil: z.object({
		/**
		 * Nome completo do candidato.
		 *
		 * @type {string}
		 */
		nome: z.string(),

		/**
		 * Idade do candidato. Este campo é opcional.
		 *
		 * @type {string | undefined}
		 */
		idade: z.string().optional(),

		/**
		 * Cargo atual do candidato. Este campo é opcional.
		 *
		 * @type {string | undefined}
		 */
		empregoOuCargoAtual: z.string().optional(),

		/**
		 * Descrição sobre o candidato. Este campo é opcional.
		 *
		 * @type {string | undefined}
		 */
		sobre: z.string().optional(),

		/**
		 * Gênero do candidato. O valor deve ser um dos enumerados: "Masculino", "Feminino", "Outros", "Não Especificado".
		 *
		 * @type {string}
		 */
		genero: z.enum(["Masculino", "Feminino", "Outros", "Não Especificado"]),
	}),

	/**
	 * Lista de habilidades do candidato. Este campo é opcional.
	 *
	 * @type {string[] | undefined}
	 */
	habilidades: z.array(z.string()).optional(),

	/**
	 * Lista de experiências profissionais do candidato.
	 * Cada experiência inclui tempo, local e descrição opcional.
	 *
	 * @type {Array<{ tempo: string; local: string; descricao?: string }> }
	 */
	experiencias: z.array(
		z.object({
			/**
			 * Tempo de duração da experiência.
			 *
			 * @type {string}
			 */
			tempo: z.string(),

			/**
			 * Local da experiência.
			 *
			 * @type {string}
			 */
			local: z.string(),

			/**
			 * Descrição adicional da experiência. Este campo é opcional.
			 *
			 * @type {string | undefined}
			 */
			descricao: z.string().optional(),
		}),
	),

	/**
	 * Lista de formações acadêmicas do candidato.
	 * Cada formação inclui instituição, nome do curso, descrição e tempo, todos opcionais.
	 *
	 * @type {Array<{ instituicao: string; nome?: string; descricao?: string; tempo?: string }> | undefined}
	 */
	formacoes: z
		.array(
			z.object({
				/**
				 * Nome da instituição onde a formação foi realizada.
				 *
				 * @type {string}
				 */
				instituicao: z.string(),

				/**
				 * Nome do curso. Este campo é opcional.
				 *
				 * @type {string | undefined}
				 */
				nome: z.string().optional(),

				/**
				 * Descrição da formação. Este campo é opcional.
				 *
				 * @type {string | undefined}
				 */
				descricao: z.string().optional(),

				/**
				 * Tempo de duração da formação. Este campo é opcional.
				 *
				 * @type {string | undefined}
				 */
				tempo: z.string().optional(),
			}),
		)
		.optional(),

	/**
	 * Lista de cursos realizados pelo candidato.
	 * Cada curso inclui instituição, nome, descrição e tempo, todos opcionais.
	 *
	 * @type {Array<{ instituicao: string; nome?: string; descricao?: string; tempo?: string }> | undefined}
	 */
	cursos: z
		.array(
			z.object({
				/**
				 * Nome da instituição onde o curso foi realizado.
				 *
				 * @type {string}
				 */
				instituicao: z.string(),

				/**
				 * Nome do curso. Este campo é opcional.
				 *
				 * @type {string | undefined}
				 */
				nome: z.string().optional(),

				/**
				 * Descrição do curso. Este campo é opcional.
				 *
				 * @type {string | undefined}
				 */
				descricao: z.string().optional(),

				/**
				 * Tempo de duração do curso. Este campo é opcional.
				 *
				 * @type {string | undefined}
				 */
				tempo: z.string().optional(),
			}),
		)
		.optional(),

	/**
	 * Informações de contato do candidato.
	 * Inclui telefones, cidade, e-mail e redes sociais, todos opcionais.
	 *
	 * @type {Object}
	 */
	contato: z.object({
		/**
		 * Lista de números de telefone do candidato. Este campo é opcional.
		 *
		 * @type {string[] | undefined}
		 */
		telefones: z.array(z.string()).optional(),

		/**
		 * Cidade onde o candidato reside. Este campo é opcional.
		 *
		 * @type {string | undefined}
		 */
		cidade: z.string().optional(),

		/**
		 * E-mail do candidato. Este campo é opcional.
		 *
		 * @type {string | undefined}
		 */
		email: z.string().optional(),

		/**
		 * Lista de redes sociais do candidato.
		 * Cada rede social inclui o nome e a URL.
		 *
		 * @type {Array<{ nome: string; url: string }> | undefined}
		 */
		redesSociais: z
			.array(
				z.object({
					/**
					 * Nome da rede social.
					 *
					 * @type {string}
					 */
					nome: z.string(),

					/**
					 * URL do perfil na rede social.
					 *
					 * @type {string}
					 */
					url: z.string(),
				}),
			)
			.optional(),
	}),

	/**
	 * Objetivo profissional do candidato. Este campo é opcional.
	 *
	 * @type {string | undefined}
	 */
	objetivo: z.string().optional(),

	/**
	 * Dados adicionais do currículo. Este campo é um array de objetos vazios.
	 *
	 * @type {Array<Object>}
	 */
	dadosExtras: z.array(
		z.object({
			nome: z.string(),
			valor: z.string(),
		}),
	),
});

export const RetornoBuscaCurriculos = z.object({
	ids: z
		.array(
			z.object({
				_id: z.string(),
				nome: z.string(),
				motivo: z.string(),
				pastaId: z.string(),
			}),
		)
		.optional(),

	/**
	 * Caso nenhum currículo seja válido, avisa por aqui o motivo.
	 */
	motivoFalha: z.string({ description: "Caso nenhum currículo seja válido, avisa por aqui o motivo." }).optional(),
});
