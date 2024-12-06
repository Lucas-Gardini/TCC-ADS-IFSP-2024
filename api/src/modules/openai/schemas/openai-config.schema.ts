import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type EmpresaDocument = HydratedDocument<ConfiguracaoOpenAi>;

@Schema({
	timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
	collection: "openai-config",
	versionKey: false,
})
export class ConfiguracaoOpenAi {
	@Prop()
	chave: string;

	@Prop()
	valor: string;
}

export const ConfiguracaoOpenAiSchema = SchemaFactory.createForClass(ConfiguracaoOpenAi);
