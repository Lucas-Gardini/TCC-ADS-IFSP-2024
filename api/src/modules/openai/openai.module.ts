import { Module } from "@nestjs/common";
import { OpenaiService } from "./openai.service";
import { OpenaiController } from "./openai.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfiguracaoOpenAi, ConfiguracaoOpenAiSchema } from "./schemas/openai-config.schema";

/**
 * Módulo responsável por fornecer e configurar o serviço OpenAI e seu controlador.
 *
 * Este módulo encapsula a lógica relacionada ao serviço OpenAI, incluindo a configuração
 * e a exportação dos componentes necessários para o funcionamento das rotas e serviços
 * associados.
 */
@Module({
	imports: [MongooseModule.forFeature([{ name: ConfiguracaoOpenAi.name, schema: ConfiguracaoOpenAiSchema }])],

	controllers: [OpenaiController],

	providers: [OpenaiService],

	exports: [OpenaiService],
})
export class OpenaiModule {}
