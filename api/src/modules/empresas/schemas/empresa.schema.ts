import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { EmpresaDto } from "../dto/empresa.dto";
import { Usuario } from "../../auth/schemas/usuario.schema";

/**
 * Tipo de documento para a entidade `Empresa`.
 */
export type EmpresaDocument = HydratedDocument<Empresa>;

/**
 * Representa o esquema e a estrutura de dados de uma empresa no MongoDB.
 * A entidade `Empresa` é usada para armazenar informações detalhadas sobre empresas.
 *
 * @property {string} cnpj - O CNPJ da empresa, que deve ser único e é indexado.
 * @property {string} razaoSocial - A razão social da empresa.
 * @property {string} [nomeFantasia] - O nome fantasia da empresa (opcional).
 * @property {string} [telefone] - O telefone de contato da empresa (opcional).
 * @property {string} [email] - O email de contato da empresa (opcional).
 * @property {string} [cep] - O CEP da empresa (opcional).
 * @property {string} [logradouro] - O logradouro do endereço da empresa (opcional).
 * @property {string} [numero] - O número do endereço da empresa (opcional).
 * @property {string} [complemento] - O complemento do endereço da empresa (opcional).
 * @property {string} [bairro] - O bairro do endereço da empresa (opcional).
 * @property {string} [cidade] - A cidade do endereço da empresa (opcional).
 * @property {string} [estado] - O estado do endereço da empresa (opcional).
 * @property {boolean} aguardandoExclusao - Indica se a empresa está aguardando exclusão.
 * @property {Date} [exclusaoSolicitadaEm] - Data da solicitação de exclusão da empresa (opcional).
 * @property {Usuario[]} usuarios - Lista de usuários associados à empresa.
 */
@Schema({
	timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
	collection: "empresa",
	versionKey: false,
})
export class Empresa implements EmpresaDto {
	@Prop({ required: true, unique: true, index: true })
	cnpj: string;

	@Prop({ required: true })
	razaoSocial: string;

	@Prop()
	nomeFantasia?: string;

	@Prop()
	telefone?: string;

	@Prop()
	email?: string;

	@Prop()
	cep?: string;

	@Prop()
	logradouro?: string;

	@Prop()
	numero?: string;

	@Prop()
	complemento?: string;

	@Prop()
	bairro?: string;

	@Prop()
	cidade?: string;

	@Prop()
	estado?: string;

	@Prop({ default: false })
	aguardandoExclusao: boolean;

	@Prop({ type: Date, default: null })
	exclusaoSolicitadaEm?: Date;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }] })
	usuarios: Usuario[];
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
