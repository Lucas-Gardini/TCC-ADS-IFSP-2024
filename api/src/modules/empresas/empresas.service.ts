import { Injectable } from "@nestjs/common";
import { EmpresaDto, PartialEmpresaDto } from "./dto/empresa.dto";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Empresa } from "./schemas/empresa.schema";
import { Connection, Model } from "mongoose";
import { AuthService } from "../auth/auth.service";
import { UsuarioDto } from "../auth/dto/usuario.dto";
import { eLogType, sendLogMessage } from "../../utils/sendLogMessage";
import { HttpResponse, IServiceResponse } from "semantic-response";

/**
 * Serviço para gerenciar operações relacionadas às empresas.
 * Este serviço fornece métodos para criar, ler, atualizar e excluir empresas,
 * além de realizar operações específicas de inicialização da aplicação.
 */
@Injectable()
export class EmpresaService {
	constructor(
		@InjectConnection() private readonly connection: Connection,
		@InjectModel(Empresa.name) public empresaModel: Model<Empresa>,

		/**
		 * Serviço de autenticação para verificar e gerenciar usuários.
		 */
		private readonly authService: AuthService,
	) {}

	/**
	 * Método chamado quando a aplicação é inicializada.
	 * Verifica se uma empresa padrão está definida nas variáveis de ambiente e, se estiver,
	 * tenta criar essa empresa no banco de dados. Se a empresa já existir, nada é feito.
	 */
	async onApplicationBootstrap() {
		if (!process.env.DEFAULT_ENTERPRISE) {
			Promise.all([
				new Promise((resolve) => {
					resolve(
						(() => {
							throw new Error("Empresa padrão não definida nas variáveis de ambiente!");
						})(),
					);
				}),
				new Promise((resolve) => resolve(process.exit(1))),
			]);
		}

		try {
			const usuarioPadrao = JSON.parse(process.env.DEFAULT_USER) as UsuarioDto;
			const empresaPadrao = JSON.parse(process.env.DEFAULT_ENTERPRISE) as EmpresaDto;

			// Garante que o usuário padrão foi criado
			await this.authService.onApplicationBootstrap();

			if (empresaPadrao) {
				const empresaExists = await this.empresaModel.exists({
					cnpj: empresaPadrao.cnpj,
				});

				if (!empresaExists) {
					const usuario = await this.authService.usuarioModel.findOne({ email: usuarioPadrao.email });
					await this.empresaModel.create({
						...empresaPadrao,
						usuarios: [usuario._id],
					});

					sendLogMessage(eLogType.MONGODB, `${empresaPadrao.cnpj} | ${empresaPadrao.razaoSocial} cadastrado!`);
				}
			}
		} catch (err) {
			sendLogMessage(eLogType.ERROR, err);
		}
	}

	/**
	 * Retorna a empresa cadastrada.
	 */
	async getEmpresa(usuarioId: string): Promise<IServiceResponse<Empresa>> {
		const empresa = await this.empresaModel.findOne(
			{},
			{},
			{
				populate: {
					path: "usuarios",
					select: "-senha -token -permissoes",
				},
			},
		);

		if (!empresa) return HttpResponse.notFound<string>({ data: "Empresa não encontrada!" });

		if (usuarioId) {
			const usuario = await this.authService.usuarioModel.findById(usuarioId);
			if (usuario.ativo) return HttpResponse.ok(empresa);
		}

		return HttpResponse.ok({ nomeFantasia: empresa.nomeFantasia, cnpj: empresa.cnpj, razaoSocial: empresa.razaoSocial } as any);
	}

	/**
	 * Atualiza os dados de uma empresa existente.
	 * @param empresaId Id da empresa a ser atualizada.
	 * @param empresaDto Dados da empresa a serem atualizados.
	 * @returns Empresa atualizada.
	 * @throws {HttpResponse.notFound} Se a empresa não for encontrada.
	 */
	async updateEmpresa(empresaDto: PartialEmpresaDto): Promise<IServiceResponse<Empresa>> {
		const updatedEmpresa = await this.empresaModel.findOneAndUpdate({}, { $set: empresaDto }, { new: true });

		if (!updatedEmpresa) return HttpResponse.notFound<string>({ data: "Empresa não encontrada!" });

		return HttpResponse.ok(updatedEmpresa);
	}

	/**
	 * Excluí o banco de dados da empresa e mata a aplicação.
	 */
	deleteEmpresa() {
		return this.connection.dropDatabase();
	}
}
