import { Module } from "@nestjs/common";
import { BancoDeCurriculosService } from "./banco-de-curriculos.service";
import { BancoDeCurriculosController } from "./banco-de-curriculos.controller";
import { OpenaiModule } from "../openai/openai.module";
import { MongooseModule } from "@nestjs/mongoose";
import { BancoDeCurriculo, BancoDeCurriculoSchema } from "./schemas/banco-de-curriculo.schema";
import { Pasta, PastaSchema } from "./schemas/pasta.schema";
import { Curriculo, CurriculoSchema } from "./schemas/curriculo.schema";
import { Empresa, EmpresaSchema } from "../empresas/schemas/empresa.schema";

/**
 * Módulo responsável pela gestão de currículos e suas organizações.
 * Este módulo define e configura os componentes necessários para lidar com bancos de currículos,
 * pastas e currículos no sistema.
 *
 * @module BancoDeCurriculosModule
 */
@Module({
	/**
	 * Importa módulos necessários para o funcionamento deste módulo.
	 * Inclui a configuração do Mongoose para conectar e usar os esquemas definidos e o módulo OpenAI.
	 */
	imports: [
		MongooseModule.forFeature([
			// Define os esquemas do Mongoose para a entidade Empresa
			{ name: Empresa.name, schema: EmpresaSchema },
			// Define os esquemas do Mongoose para a entidade BancoDeCurriculo
			{ name: BancoDeCurriculo.name, schema: BancoDeCurriculoSchema },
			// Define os esquemas do Mongoose para a entidade Pasta
			{ name: Pasta.name, schema: PastaSchema },
			// Define os esquemas do Mongoose para a entidade Curriculo
			{ name: Curriculo.name, schema: CurriculoSchema },
		]),
		OpenaiModule,
	],
	/**
	 * Define os controladores responsáveis por lidar com as requisições HTTP
	 * e as interações com o cliente para o gerenciamento dos currículos.
	 */
	controllers: [BancoDeCurriculosController],

	/**
	 * Define os provedores (services) que encapsulam a lógica de negócios
	 * para a gestão dos currículos e pastas.
	 */
	providers: [BancoDeCurriculosService],
})
export class BancoDeCurriculosModule {}
