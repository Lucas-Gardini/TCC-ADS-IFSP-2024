import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

/**
 * Tipo de documento para a entidade `Curriculo`.
 * Este tipo é usado para tipar o documento do Mongoose e fornece a estrutura esperada do documento.
 */
export type CurriculoDocument = HydratedDocument<Curriculo>;

/**
 * Representa o esquema e a estrutura de dados de um currículo no MongoDB.
 * A entidade `Curriculo` é usada para armazenar informações detalhadas sobre um currículo.
 *
 * @property {string} nome - Nome do titular do currículo. Este campo é obrigatório e indexado para busca eficiente.
 * @property {string} [idade] - Idade do titular do currículo (opcional). Campo indexado para consultas.
 * @property {string} [empregoOuCargoAtual] - Cargo atual do titular do currículo (opcional). Campo indexado para consultas.
 * @property {string} [sobre] - Informações adicionais sobre o titular do currículo (opcional). Campo indexado para consultas.
 * @property {string} genero - Gênero do titular do currículo. Deve ser um dos valores pré-definidos ("Masculino", "Feminino", "Outros", "Não Especificado"). Campo obrigatório e indexado.
 * @property {string[]} [habilidades] - Lista de habilidades do titular do currículo (opcional). Campo indexado para consultas.
 * @property {Array<{ tempo: string; local: string; descricao?: string }>} experiencias - Lista de experiências profissionais do titular do currículo. Campo obrigatório.
 * @property {Array<{ instituicao: string; nome?: string; descricao?: string; tempo?: string }>} [formacoes] - Lista de formações acadêmicas do titular do currículo (opcional).
 * @property {Array<{ instituicao: string; nome?: string; descricao?: string; tempo?: string }>} [cursos] - Lista de cursos realizados pelo titular do currículo (opcional).
 * @property {Object} contato - Informações de contato do titular do currículo. Campo obrigatório.
 * @property {string[]} [contato.telefones] - Lista de telefones de contato (opcional).
 * @property {string} [contato.cidade] - Cidade de contato (opcional).
 * @property {string} [contato.email] - E-mail de contato (opcional).
 * @property {Array<{ nome: string; url: string }>} [contato.redesSociais] - Lista de redes sociais do titular do currículo (opcional).
 * @property {string} [objetivo] - Objetivo profissional do titular do currículo (opcional). Campo indexado para consultas.
 * @property {Array<{ nome: string; valor: string }>} [dadosExtras] - Dados adicionais do currículo que não se encaixam nos campos padrão (opcional). Campo indexado para consultas.
 * @property {mongoose.Schema.Types.ObjectId} pasta - ID da pasta associada ao currículo. Referência ao esquema `Pasta`.
 * @property {mongoose.Schema.Types.ObjectId} documento - ID do documento associado ao currículo. Referência ao esquema `Documento`.
 */
@Schema({
	timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
	collection: "curriculos",
	versionKey: false,
})
export class Curriculo {
	/**
	 * Nome do titular do currículo. Este campo é obrigatório e indexado.
	 */
	@Prop({ required: true, index: true })
	nome: string;

	/**
	 * Idade do titular do currículo (opcional). Campo indexado.
	 */
	@Prop({ index: true })
	idade?: string;

	/**
	 * Cargo atual do titular do currículo (opcional). Campo indexado.
	 */
	@Prop({ index: true })
	empregoOuCargoAtual?: string;

	/**
	 * Informações adicionais sobre o titular do currículo (opcional). Campo indexado.
	 */
	@Prop({ index: true })
	sobre?: string;

	/**
	 * Gênero do titular do currículo. Campo obrigatório e indexado. Deve ser um dos valores: "Masculino", "Feminino", "Outros", "Não Especificado".
	 */
	@Prop({ required: true, enum: ["Masculino", "Feminino", "Outros", "Não Especificado"], index: true })
	genero: string;

	/**
	 * Lista de habilidades do titular do currículo (opcional). Campo indexado.
	 */
	@Prop({ type: [String], default: [], index: true })
	habilidades?: string[];

	/**
	 * Lista de experiências profissionais do titular do currículo. Campo obrigatório.
	 */
	@Prop({
		type: Array,
		required: true,
	})
	experiencias: Array<{
		tempo: string;
		local: string;
		descricao?: string;
	}>;

	/**
	 * Lista de formações acadêmicas do titular do currículo (opcional).
	 */
	@Prop({
		type: Array,
		default: [],
	})
	formacoes?: Array<{
		instituicao: string;
		nome?: string;
		descricao?: string;
		tempo?: string;
	}>;

	/**
	 * Lista de cursos realizados pelo titular do currículo (opcional).
	 */
	@Prop({
		type: Array,
		default: [],
	})
	cursos?: Array<{
		instituicao: string;
		nome?: string;
		descricao?: string;
		tempo?: string;
	}>;

	/**
	 * Informações de contato do titular do currículo. Campo obrigatório.
	 */
	@Prop({
		type: Object,
		required: true,
	})
	contato: {
		telefones?: string[];
		cidade?: string;
		email?: string;
		redesSociais?: Array<{
			nome: string;
			url: string;
		}>;
	};

	/**
	 * Objetivo profissional do titular do currículo (opcional). Campo indexado.
	 */
	@Prop({ index: true })
	objetivo?: string;

	/**
	 * Dados adicionais do currículo que não se encaixam nos campos padrão (opcional). Campo indexado.
	 */
	@Prop({ type: [Object], default: [], index: true })
	dadosExtras?: Array<{ nome: string; valor: string }>;

	/**
	 * ID da pasta associada ao currículo. Referência ao esquema `Pasta`.
	 */
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Pasta" })
	pasta: mongoose.Schema.Types.ObjectId;

	/**
	 * ID do documento associado ao currículo. Referência ao esquema `Documento`.
	 */
	@Prop({ type: mongoose.Schema.Types.ObjectId })
	documento: mongoose.Schema.Types.ObjectId;
}

/**
 * Cria o esquema do Mongoose para a classe `Curriculo`.
 */
export const CurriculoSchema = SchemaFactory.createForClass(Curriculo);
