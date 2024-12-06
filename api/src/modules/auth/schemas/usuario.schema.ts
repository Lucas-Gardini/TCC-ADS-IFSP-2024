import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UsuarioDto } from "../dto/usuario.dto";
import { ePermissao } from "../enums/role.enum";

/**
 * Tipo de documento para a entidade `Usuario`.
 */
export type UsuarioDocument = HydratedDocument<Usuario>;

/**
 * Representa o esquema e a estrutura de dados de um usuário no MongoDB.
 * A entidade `Usuario` é usada para armazenar informações detalhadas sobre os usuários da aplicação.
 *
 * @property {string} email - O email do usuário, que deve ser único e é indexado.
 * @property {string} senha - A senha do usuário.
 * @property {string} nomeExibicao - O nome de exibição do usuário.
 * @property {ePermissao[]} permissoes - Lista de permissões associadas ao usuário.
 * @property {boolean} ativo - Indica se o usuário está ativo. O padrão é `true`.
 * @property {string} token - Token de autenticação do usuário, que deve ser único.
 * @property {boolean} verificado - Indica se o usuário foi verificado. O padrão é `false`.
 */
@Schema({
	timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
	collection: "usuarios",
	versionKey: false,
})
export class Usuario implements UsuarioDto {
	@Prop({ unique: true, required: true, index: true })
	email: string;

	@Prop({ required: true })
	senha: string;

	@Prop({ required: true })
	nomeExibicao: string;

	@Prop({ required: true, type: [String], enum: ePermissao })
	permissoes: ePermissao[];

	@Prop({ required: true, type: Boolean, default: true })
	ativo: boolean;

	@Prop({ required: true, type: String, unique: true })
	token: string;

	@Prop({ required: true, type: Boolean, default: false })
	verificado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
