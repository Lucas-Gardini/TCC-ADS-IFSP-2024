import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json as BPJson } from "body-parser";
import chalk from "chalk";
import compression from "compression";
import RedisStore from "connect-redis";
import session from "express-session";
import figlet from "figlet";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { createClient } from "redis";
import { AppModule } from "./app.module";
import { getMongoConnectionString } from "./utils/getMongoConnectionString";
import setMorganCustomTokens from "./utils/setMorganCustomTokens";

import { Settings } from "luxon";

Settings.defaultLocale = "pt-BR";
Settings.defaultZone = "America/Sao_Paulo";

/**
 * Função que retorna a store de sessão baseada no Redis.
 *
 * @returns Uma instância de RedisStore configurada com o cliente Redis.
 */
async function getRedisSessionStore() {
	const redisStoreClient = createClient({
		socket: {
			tls: false,
			connectTimeout: 1000,
			host: process.env.REDIS_HOST,
			port: parseInt(process.env.REDIS_PORT),
			reconnectStrategy: (times) => {
				console.log(
					`\n[🔴] ${chalk.bgWhiteBright(chalk.redBright("   Session   "))} ${chalk.redBright("Tentando reconectar ao redis...")} ${times}`,
				);
				return Math.min(times * 100, 3000);
			},
		},
		password: process.env.REDIS_PASSWORD,
	});

	redisStoreClient.on("error", (error) => {
		if (error.message.includes("ECONNREFUSED")) return;
		console.log(`\n😭 ${chalk.redBright("Redis...........:")} ${chalk.redBright("Erro do redis:")} ${error}`);
	});

	redisStoreClient.on("ready", () => {
		console.log(
			`🟥 ${chalk.redBright("Session...........:")} ${chalk.magenta(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)}`,
		);
	});

	await redisStoreClient.connect();

	const redisStore = new RedisStore({
		client: redisStoreClient,
		prefix: process.env.REDIS_PREFIX,
	});

	return redisStore;
}

/**
 * Exibe o cabeçalho do console com informações da aplicação.
 */
function showHeader() {
	console.clear();
	console.log("\n" + chalk.yellow(figlet.textSync(process.env.APP_NAME, "Small Slant")));

	if (process.env.NODE_ENV === "development") {
		console.log(`\n🟢 ${chalk.greenBright("Ambiente..........:")} ${chalk.greenBright("Desenvolvimento")}`);
	} else {
		console.log(`\n🟡 ${chalk.yellowBright("Ambiente.........:")} ${chalk.yellowBright("Produção")}`);
	}

	console.log("\n🎲 Bancos de Dados\n------------");
	console.log(`🍃 ${chalk.green("MongoDB...........:")} ${chalk.magenta(getMongoConnectionString().masked.split("?")[0])}`);
}

/**
 * Função principal que inicializa a aplicação.
 *
 * @returns Uma promessa que resolve quando a aplicação é inicializada com sucesso.
 */
async function bootstrap() {
	console.clear();

	// Cria uma instância do aplicativo Nest.
	const app = await NestFactory.create(AppModule, {
		logger: ["error", "warn"],
	});

	if (!process.env.APP_PORT) throw new Error("Porta não definida");
	if (!process.env.APP_HOST) throw new Error("Host não definido");

	showHeader();

	// Configura o aplicativo para usar o prefixo 'api' em todas as rotas.
	app.setGlobalPrefix("api");

	// Configura o aplicativo para usar o CORS, permitindo que o usuário interaja com o servidor mesmo estando em um domínio diferente.
	app.enableCors({
		origin: JSON.parse(process.env.CORS_WHITELIST),
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
		allowedHeaders: "Content-Type, Accept, Authorization",
	});

	// Middlewares
	// Configura o logger Morgan com tokens personalizados.
	app.use(morgan(setMorganCustomTokens()));
	// Configura o helmet para melhorar a segurança dos cabeçalhos HTTP.
	app.use(
		helmet({
			xPoweredBy: false,
		}),
	);
	// Configura o parser para JSON com um limite de 50MB.
	app.use(BPJson({ limit: "50MB" }));
	// Adiciona compressão de resposta.
	app.use(compression());

	// Configuração global para validação de entrada.
	app.useGlobalPipes(
		new ValidationPipe({
			always: true,
			transform: true,
		}),
	);

	// Gerenciamento de sessão usando Redis.
	app.use(
		session({
			secret: process.env.APP_SECRET,
			cookie: {
				httpOnly: true,
				secure: "auto",
				maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
			},
			rolling: true,
			resave: false,
			saveUninitialized: false,
			store: await getRedisSessionStore(),
		}),
	);

	// Inicializa o Passport para autenticação e gerenciamento de sessão.
	app.use(passport.initialize());
	app.use(passport.session());

	// Configuração do Swagger para documentação da API.
	const config = new DocumentBuilder()
		.setTitle(process.env.APP_NAME)
		.setDescription(process.env.APP_DESCRIPTION)
		.setVersion("1.0")
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
	});
	SwaggerModule.setup("api/docs", app, document);

	// Inicializa o aplicativo para escutar por conexões na porta especificada.
	await app.listen(process.env.APP_PORT, process.env.APP_HOST);

	// Mensagem de servidor rodando
	console.log("\n📱 Aplicação\n------------");
	console.log(
		`🌠 ${chalk.blueBright("Servidor..........:")} ${chalk.blueBright(` http://${process.env.APP_HOST}:${process.env.APP_PORT} `)}`,
	);
	console.log(
		`🌐 ${chalk.blueBright("Swagger...........:")} ${chalk.blueBright(` http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/docs `)}`,
	);

	console.log(`\n🚀 ${chalk.cyanBright("Aplicação iniciada com sucesso!")}\n`);
}

// Chamada da função principal.
bootstrap();
