import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { PastaDto } from "../dto/pasta.dto";
import { Curriculo } from "./curriculo.schema";

/**
 * Tipo de documento para a entidade `Pasta`.
 * Este tipo é usado para tipar o documento do Mongoose e fornece a estrutura esperada do documento.
 */
export type PastaDocument = HydratedDocument<Pasta>;

/**
 * Representa o esquema e a estrutura de dados de uma pasta no MongoDB.
 * A entidade `Pasta` é usada para organizar e armazenar currículos em uma estrutura hierárquica.
 *
 * @property {string} nome - Nome da pasta. Este campo é indexado para busca eficiente.
 * @property {string} [cor] - Cor associada à pasta (opcional). Se não especificado, o valor padrão é "#ffcf48".
 * @property {Curriculo[]} documentos - Lista de currículos associados à pasta. Referências ao esquema `Curriculo`.
 * @property {mongoose.Schema.Types.ObjectId} bancoDeCurriculo - ID do banco de currículos ao qual a pasta pertence. Referência ao esquema `BancoDeCurriculo`.
 * @property {mongoose.Schema.Types.ObjectId[]} subPastas - IDs das subpastas dentro desta pasta. Referências a outras pastas do esquema `Pasta`.
 */
@Schema({
	timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
	collection: "pastas",
	versionKey: false,
})
export class Pasta implements PastaDto {
	/**
	 * Nome da pasta. Este campo é indexado para busca eficiente.
	 */
	@Prop({ index: true })
	nome: string;

	/**
	 * Cor associada à pasta (opcional). O valor padrão é "#ffcf48".
	 */
	@Prop({ default: "#ffcf48" })
	cor: string;

	/**
	 * Lista de currículos associados à pasta. Referências ao esquema `Curriculo`.
	 */
	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "DadosCurriculo", index: true }] })
	documentos: Curriculo[];

	/**
	 * ID do banco de currículos ao qual a pasta pertence. Referência ao esquema `BancoDeCurriculo`.
	 */
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: "BancoDeCurriculo", index: true })
	bancoDeCurriculo: mongoose.Schema.Types.ObjectId;

	/**
	 * IDs das subpastas dentro desta pasta. Referências a outras pastas do esquema `Pasta`.
	 */
	@Prop({ type: [{ type: Types.ObjectId, ref: Pasta.name }] })
	subPastas: mongoose.Schema.Types.ObjectId[];
}

/**
 * Cria o esquema do Mongoose para a classe `Pasta`.
 */
export const PastaSchema = SchemaFactory.createForClass(Pasta);
