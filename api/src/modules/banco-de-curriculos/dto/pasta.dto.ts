import { IsString, IsOptional, IsArray, IsHexColor, IsMongoId, ValidateIf } from "class-validator";
import { Curriculo } from "../schemas/curriculo.schema";

/**
 * DTO para representar uma pasta que pode conter documentos e informações adicionais.
 */
export class PastaDto {
	/**
	 * Nome da pasta.
	 * Este campo é obrigatório e deve ser uma string.
	 */
	@IsString()
	nome: string;

	/**
	 * Cor associada à pasta.
	 * Este campo é opcional e deve ser uma string representando a cor em formato hexadecimal (ex: "#FFFFFF").
	 */
	@IsHexColor()
	@IsOptional()
	@ValidateIf((o) => o.cor?.length > 0)
	cor?: string;

	/**
	 * Lista de documentos associados à pasta.
	 * Pode ser um array de IDs de MongoDB ou um array de objetos `Curriculo`.
	 * Este campo deve ser um array de strings (IDs) ou objetos `Curriculo` e deve ser validado se não estiver vazio.
	 */
	@IsArray()
	@IsMongoId({ each: true })
	@ValidateIf((o) => Array.isArray(o.documentos) && o.documentos.length > 0)
	documentos: string[] | Curriculo[];

	/**
	 * ID da pasta pai.
	 * Este campo é opcional e deve ser um ID de MongoDB, se fornecido.
	 */
	@IsMongoId()
	@IsOptional()
	pastaPai?: string;
}
