import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { SHA256 } from "crypto-js";
import { Model } from "mongoose";
import { HttpResponse, IServiceResponse } from "semantic-response";
import { eLogType, sendLogMessage } from "../../utils/sendLogMessage";
import { Empresa } from "../empresas/schemas/empresa.schema";
import { MailService } from "../mail/mail.service";
import { UpdateUserDto, UsuarioDto } from "./dto/usuario.dto";
import { ePermissao } from "./enums/role.enum";
import { Usuario } from "./schemas/usuario.schema";
import { EmpresaDto } from "../empresas/dto/empresa.dto";

/**
 * Serviço para gerenciar operações relacionadas à autenticação.
 */
@Injectable()
export class AuthService {
	/**
	 * Cria uma instância de `AuthService`.
	 * @param usuarioModel - Modelo do Mongoose para a coleção de usuários.
	 * @param empresaModel - Modelo do Mongoose para a coleção de empresas.
	 * @param mailService - Serviço de email para enviar emails de confirmação e recuperação de senha.
	 */
	constructor(
		@InjectModel(Usuario.name) public usuarioModel: Model<Usuario>,
		@InjectModel(Empresa.name) public empresaModel: Model<Empresa>,

		private mailService: MailService,
	) {}

	/**
	 * Método que é chamado quando a aplicação é inicializada.
	 * Verifica se um usuário padrão está definido nas variáveis de ambiente e tenta criar esse usuário no banco de dados.
	 * Se o usuário já existir, nada é feito.
	 */
	async onApplicationBootstrap() {
		try {
			const defaultUser = JSON.parse(process.env.DEFAULT_USER ?? "null") as UsuarioDto;

			if (defaultUser) {
				const userExists = await this.usuarioModel.exists({
					email: defaultUser.email,
				});

				if (!userExists) {
					const success = await this.createUser(defaultUser);

					if (success.status !== 201) return sendLogMessage(eLogType.ERROR, JSON.stringify(success.error));

					sendLogMessage(eLogType.MONGODB, `${defaultUser.nomeExibicao} cadastrado!`);
				}
			}
		} catch (err) {
			sendLogMessage(eLogType.ERROR, err);
		}
	}

	/**
	 * Criptografa uma senha usando bcrypt.
	 *
	 * @param password - A senha não criptografada que será criptografada.
	 * @returns Uma promessa que resolve para a senha criptografada.
	 */
	private async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	/**
	 * Compara uma senha não criptografada com uma senha criptografada.
	 *
	 * @param newPassword - A senha não criptografada que será comparada.
	 * @param passwordHash - A senha criptografada com a qual a nova senha será comparada.
	 * @returns Uma promessa que resolve para um booleano indicando se as senhas são iguais.
	 */
	private async comparePasswords(newPassword: string, passwordHash: string): Promise<boolean> {
		return await bcrypt.compare(newPassword, passwordHash);
	}

	/**
	 * Gera um hash para um identificador utilizando SHA-256.
	 * @param prefix O prefixo a ser adicionado ao identificador antes de calcular o hash.
	 * @returns Uma Promise que resolve em uma string contendo o hash gerado.
	 */
	private async generateIdentifierHash(prefix: string): Promise<string> {
		// Obtendo o timestamp atual em milissegundos
		const timestamp = new Date().getTime().toString();
		// Concatenando uma string vazia com o timestamp
		const data = prefix + timestamp;
		// Criando o hash SHA-256
		const hash = SHA256(data);

		return hash.toString();
	}

	/**
	 * Método para validar um usuário.
	 *
	 * @param token - O token do usuário que está sendo validado.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se a validação for bem-sucedida, retorna uma resposta 200.
	 */
	async validateUser(token: string): Promise<IServiceResponse> {
		const user = await this.usuarioModel.findOne({ token });

		if (!user)
			return HttpResponse.notFound({
				message: "Usuário não encontrado.",
			});

		user.verificado = true;

		await user.save();
	}

	/**
	 * Método para autenticar um usuário.
	 *
	 * @param email - O CPF ou CNPJ do usuário que está tentando se autenticar.
	 * @param pass - A senha do usuário que está tentando se autenticar.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se a senha for inválida, retorna um erro 401. Se a autenticação for bem-sucedida, retorna o objeto do usuário.
	 */
	async signIn(email: string, pass: string): Promise<IServiceResponse<UsuarioDto>> {
		const user = await this.usuarioModel.findOne({ email }).select("-identificador");

		if (!user)
			return HttpResponse.notFound({
				message: "Usuário não encontrado.",
			});

		if (!(await this.comparePasswords(pass, user.senha)))
			return HttpResponse.unauthorized({
				message: "Senha inválida.",
			});

		if (!user.verificado)
			return HttpResponse.unauthorized({
				message: "Usuário não verificado, verifique seu email.",
			});

		const empresa = await this.empresaModel.findOne({ usuarios: user._id });

		const payload = user.toObject() as UsuarioDto;
		if (empresa) {
			if (empresa.aguardandoExclusao)
				return HttpResponse.unauthorized({
					message: "Empresa aguardando exclusão.",
				});

			payload.empresa = empresa as unknown as EmpresaDto & { _id: string };
		}

		delete payload.senha;

		return HttpResponse.ok(payload, "Usuário autenticado.");
	}

	/**
	 * Gera um identificador para um usuário e atualiza o registro do usuário no banco de dados.
	 *
	 * @param _id - O ID do usuário para o qual o identificador será gerado.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se o identificador não puder ser atualizado, retorna um erro 500. Se o identificador for gerado e atualizado com sucesso, retorna o identificador.
	 */
	async generateIdentificador(_id: string): Promise<IServiceResponse> {
		const user = await this.usuarioModel.findById(_id).select("identificador").lean();

		if (!user)
			return HttpResponse.notFound({
				message: "Usuário não encontrado.",
			});

		const identificador = await this.generateIdentifierHash(_id);

		const updateResult = await this.usuarioModel.updateOne({ _id }, { $set: { identificador } });

		if (updateResult.modifiedCount === 0)
			return HttpResponse.internalServerError({
				message: "0 documentos atualizados. Identificador não foi atualizado.",
			});

		return HttpResponse.ok({ identificador }, "Identificador gerado.");
	}

	/**
	 * Obtém um usuário pelo seu ID.
	 *
	 * @param _id - O ID do usuário que será obtido.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se o usuário for encontrado, retorna o usuário com a senha omitida e o identificador descriptografado.
	 */
	async getUser(_id: string): Promise<IServiceResponse> {
		const user = await this.usuarioModel.findById(_id).select("-senha").lean();

		if (!user)
			return HttpResponse.notFound({
				message: "Usuário não encontrado.",
			});

		return HttpResponse.ok(user, "Usuário encontrado.");
	}

	/**
	 * Cria um novo usuário.
	 *
	 * @param user - O objeto UserDto que contém as informações do usuário a ser criado.
	 * @param sendEmail - Indica se um email de confirmação deve ser enviado.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o CPF/CNPJ já estiver cadastrado, retorna um erro 409. Se ocorrer algum erro durante a criação, retorna um erro 500. Se o usuário for criado com sucesso, retorna uma resposta 201.
	 */
	async createUser(user: UsuarioDto): Promise<IServiceResponse> {
		try {
			if (await this.usuarioModel.exists({ email: user.email })) {
				return HttpResponse.conflict({
					message: "Já existe um usuário com este email.",
				});
			}

			user.senha = await this.hashPassword(user.senha);
			user.token = (await this.hashPassword(randomUUID())).split("$").join("");

			const newUser = new this.usuarioModel(user);

			await newUser.save();

			sendLogMessage(eLogType.INFO, `Usuário ${newUser.nomeExibicao} | ${newUser.email} cadastrado!`);

			return HttpResponse.created("Usuário cadastrado com sucesso.");
		} catch (error: any) {
			return HttpResponse.internalServerError({
				message: "Erro ao cadastrar usuário.",
				data: error ?? error.message,
			});
		}
	}

	/**
	 * Atualiza um usuário existente.
	 *
	 * @param _id - O ID do usuário que será atualizado.
	 * @param user - O objeto UpdateUserDto que contém as informações do usuário a ser atualizado.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se ocorrer algum erro durante a atualização, retorna um erro 500. Se o usuário for atualizado com sucesso, retorna uma resposta 200.
	 */
	async updateUser(_id: string, user: UpdateUserDto): Promise<IServiceResponse> {
		try {
			const userDB = await this.usuarioModel.findOne({ _id });

			if (!userDB)
				return HttpResponse.notFound({
					message: "Usuário não encontrado.",
				});

			if (userDB.senha) userDB.senha = await this.hashPassword(userDB.senha);

			await this.usuarioModel.updateOne({ _id }, { $set: user });

			return HttpResponse.ok("Usuário atualizado com sucesso.");
		} catch (error) {
			return HttpResponse.internalServerError({
				message: "Erro ao atualizar usuário.",
				data: error,
			});
		}
	}

	/**
	 * Exclui um usuário.
	 *
	 * @param _id - O ID do usuário que será excluído.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se ocorrer algum erro durante a exclusão, retorna um erro 500. Se o usuário for excluído com sucesso, retorna uma resposta 200.
	 */
	async deleteUser(_id: string): Promise<IServiceResponse> {
		try {
			const user = await this.usuarioModel.findOne({ _id });

			if (!user)
				return HttpResponse.notFound({
					message: "Usuário não encontrado.",
				});

			await this.usuarioModel.deleteOne({ _id });

			return HttpResponse.ok("Usuário excluído com sucesso.");
		} catch (error) {
			return HttpResponse.internalServerError({
				message: "Erro ao excluir usuário.",
				data: error,
			});
		}
	}

	/**
	 * Obtém as permissões de um usuário.
	 *
	 * @param _id - O ID do usuário cujas permissões serão obtidas.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse que contém um array de permissões. Se o usuário não for encontrado, retorna um erro 404. Se o usuário for encontrado, retorna as permissões do usuário.
	 */
	async getPermissions(_id: string): Promise<IServiceResponse<ePermissao[]>> {
		const user = await this.usuarioModel.findOne({ _id });

		if (!user)
			return HttpResponse.notFound({
				message: "Usuário não encontrado.",
			});

		const { permissoes } = user;

		return HttpResponse.ok(permissoes, "Permissões do usuário.");
	}

	/**
	 * Recupera a senha de um usuário.
	 *
	 * @param email - O email do usuário que deseja recuperar a senha.
	 * @returns Uma promessa que resolve para um objeto IServiceResponse. Se o usuário não for encontrado, retorna um erro 404. Se o email for enviado com sucesso, retorna uma resposta 200.
	 */
	async recoverPassword(email: string): Promise<IServiceResponse> {
		const user = await this.usuarioModel.findOne({ email }).select("token").lean();

		if (!user)
			return HttpResponse.notFound({
				message: "Usuário não encontrado.",
			});

		await this.mailService.sendRecoverPasswordMail(email, user.token);
	}
}
