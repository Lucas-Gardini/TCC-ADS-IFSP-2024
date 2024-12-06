import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./app.guard";
import { AuthGuard } from "./modules/auth/auth.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./modules/mail/mail.module";
import { MongooseModule } from "@nestjs/mongoose";
import { getMongoConnectionString } from "./utils/getMongoConnectionString";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { EmpresaModule } from "./modules/empresas/empresas.module";
import { BancoDeCurriculosModule } from "./modules/banco-de-curriculos/banco-de-curriculos.module";
import { GridfsModule } from "./modules/gridfs/gridfs.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
	imports: [
		/**
		 * Configura o módulo de configuração para carregar variáveis de ambiente.
		 * `envFilePath` especifica o arquivo de onde as variáveis serão carregadas.
		 * `cache` permite o cache das variáveis carregadas.
		 * `isGlobal` torna as variáveis disponíveis globalmente.
		 */
		ConfigModule.forRoot({ envFilePath: "./.env", cache: true, isGlobal: true }),

		/**
		 * Configura o módulo do Mongoose para conectar-se ao banco de dados MongoDB.
		 * `getMongoConnectionString().url` fornece a URL de conexão com o banco de dados.
		 */
		MongooseModule.forRoot(getMongoConnectionString().url),

		/**
		 * Configura o módulo de cache usando Redis.
		 * `isGlobal` torna o cache disponível globalmente.
		 * `store` define o tipo de store como Redis.
		 * As credenciais e o endereço do Redis são carregados das variáveis de ambiente.
		 */
		CacheModule.register({
			isGlobal: true,
			store: redisStore,
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
			username: process.env.REDIS_USERNAME,
			password: process.env.REDIS_PASSWORD,
			no_ready_check: true,
		}),

		/**
		 * Configura o módulo de arquivos estáticos para servir arquivos estáticos.
		 */
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "resources"),
		}),

		// Importa os módulos da aplicação
		GridfsModule,
		AuthModule,
		EmpresaModule,
		MailModule,
		BancoDeCurriculosModule,
	],
	controllers: [
		// Controlador principal da aplicação
		AppController,
	],
	providers: [
		/**
		 * Configura o guard de autenticação global.
		 * `AuthGuard` garante que apenas usuários autenticados acessem rotas protegidas.
		 */
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		/**
		 * Configura o guard de roles global.
		 * `RolesGuard` verifica se o usuário possui as permissões necessárias para acessar rotas específicas.
		 */
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		// Serviço principal da aplicação
		AppService,
	],
})
export class AppModule {}
