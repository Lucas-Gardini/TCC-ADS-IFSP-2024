import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BancoDeCurriculoDto } from "../dto/banco-de-curriculo.dto";
import { HydratedDocument } from "mongoose";

/**
 * Tipo de documento para a entidade `BancoDeCurriculo`.
 * Este tipo é usado para tipar o documento do Mongoose e fornece a estrutura esperada do documento.
 */
export type BancoDeCurriculoDocument = HydratedDocument<BancoDeCurriculo>;

/**
 * Representa o esquema e a estrutura de dados de um banco de currículos no MongoDB.
 * A entidade `BancoDeCurriculo` é usada para armazenar informações sobre um banco de currículos.
 *
 * @property {string} nome - Nome do banco de currículos. Este campo é indexado para facilitar a busca.
 * @property {string} [icone] - Ícone associado ao banco de currículos. Campo opcional, com valor padrão.
 * @property {mongoose.Schema.Types.ObjectId} empresa - ID da empresa associada ao banco de currículos. Referência ao esquema `Empresa`.
 */
@Schema({
	timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
	collection: "bancos-de-curriculos",
	versionKey: false,
})
export class BancoDeCurriculo implements BancoDeCurriculoDto {
	/**
	 * Nome do banco de currículos.
	 * Este campo é indexado para melhorar a performance de buscas.
	 */
	@Prop({ index: true })
	nome: string;

	/**
	 * Ícone associado ao banco de currículos.
	 * Campo opcional com valor padrão "ph:briefcase-duotone".
	 */
	@Prop()
	icone?: string;
}

/**
 * Cria o esquema do Mongoose para a classe `BancoDeCurriculo`.
 */
export const BancoDeCurriculoSchema = SchemaFactory.createForClass(BancoDeCurriculo);
