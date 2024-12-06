import { Module } from "@nestjs/common";
import { EmpresaService } from "./empresas.service";
import { EmpresaController } from "./empresas.controller";
import { AuthModule } from "../auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Empresa, EmpresaSchema } from "./schemas/empresa.schema";

/**
 * Módulo para gerenciar operações relacionadas às empresas.
 * Este módulo fornece serviços e controladores para criar, ler, atualizar e excluir empresas.
 */
@Module({
	/**
	 * Módulos importados por este módulo.
	 */
	imports: [
		/**
		 * Módulo do Mongoose para interagir com o banco de dados MongoDB.
		 * Registra o esquema `Empresa` com o Mongoose para operações CRUD.
		 */
		MongooseModule.forFeature([{ name: Empresa.name, schema: EmpresaSchema }]),

		/**
		 * Módulo de autenticação que pode ser utilizado para verificar permissões e autenticação.
		 */
		AuthModule,
	],

	/**
	 * Controladores fornecidos por este módulo.
	 */
	controllers: [EmpresaController],

	/**
	 * Serviços fornecidos por este módulo.
	 */
	providers: [EmpresaService],

	/**
	 * Serviços exportados por este módulo para serem utilizados por outros módulos.
	 */
	exports: [EmpresaService],
})
export class EmpresaModule {}
