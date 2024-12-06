import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Usuario, UsuarioSchema } from "./schemas/usuario.schema";
import { Empresa, EmpresaSchema } from "../empresas/schemas/empresa.schema";

/**
 * Módulo global que gerencia autenticação e usuários.
 */
@Global()
@Module({
	imports: [
		/**
		 * Configura o módulo Mongoose para usar o esquema `Usuario` para interações com o banco de dados.
		 */
		MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),

		/**
		 * Configura o módulo Mongoose para usar o esquema `Empresa` para interações com o banco de dados.
		 */
		MongooseModule.forFeature([{ name: Empresa.name, schema: EmpresaSchema }]),
	],
	controllers: [
		/**
		 * Controlador responsável pelas rotas de autenticação.
		 */
		AuthController,
	],
	providers: [
		/**
		 * Serviço que fornece funcionalidades relacionadas à autenticação e gerenciamento de usuários.
		 */
		AuthService,
	],
	exports: [
		/**
		 * Exporta o `AuthService` para que outros módulos possam usá-lo.
		 */
		AuthService,
	],
})
export class AuthModule {}
