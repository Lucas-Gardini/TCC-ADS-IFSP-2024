import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Document, isObjectIdOrHexString, Model, ObjectId } from "mongoose";
import { HttpResponse, IServiceResponse } from "semantic-response";
import { GridFsService } from "../gridfs/gridfs.service";
import { OpenaiService } from "../openai/openai.service";
import { BancoDeCurriculoDto } from "./dto/banco-de-curriculo.dto";
import { CurriculoDto } from "./dto/curriculo.dto";
import { PastaDto } from "./dto/pasta.dto";
import { BancoDeCurriculo } from "./schemas/banco-de-curriculo.schema";
import { Curriculo } from "./schemas/curriculo.schema";
import { Pasta } from "./schemas/pasta.schema";

@Injectable()
export class BancoDeCurriculosService {
	constructor(
		@InjectModel("BancoDeCurriculo") private readonly bancoDeCurriculoModel: Model<BancoDeCurriculo>,
		@InjectModel("Pasta") private readonly pastaModel: Model<Pasta>,
		@InjectModel("Curriculo") private readonly curriculoModel: Model<Curriculo>,
		private readonly gridFsService: GridFsService,
		private readonly openAiService: OpenaiService,
	) {}

	//#region CRUD - Banco de Currículos
	public async listarBancoDeCurriculos(): Promise<IServiceResponse> {
		try {
			const bancoDeCurriculos: Array<Document<BancoDeCurriculo> & { metadata: { pastas: number; curriculos: number } }> =
				await this.bancoDeCurriculoModel.find(
					{},
					{},
					{
						populate: [],
					},
				);

			for (let i = 0; i < bancoDeCurriculos.length; i++) {
				const banco = bancoDeCurriculos[i];

				const pastas = await this.pastaModel.find({ bancoDeCurriculo: banco._id });
				const curriculos = await this.curriculoModel.find({ pasta: { $in: pastas.map((p) => p._id) } });
				bancoDeCurriculos[i].metadata = {
					pastas: pastas.length,
					curriculos: curriculos.length,
				};
			}

			return HttpResponse.ok(bancoDeCurriculos);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao listar o banco de currículos.");
		}
	}

	public async obterBancoDeCurriculos(bancoDeCurriculoId: string): Promise<IServiceResponse> {
		try {
			const bancoDeCurriculos = await this.bancoDeCurriculoModel.findById(bancoDeCurriculoId);
			if (!bancoDeCurriculos) return HttpResponse.notFound({}, "Banco de currículos não encontrado.");

			return HttpResponse.ok(bancoDeCurriculos);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao obter o banco de currículos.");
		}
	}

	public async criarBancoDeCurriculos(bancoDeCurriculoDto: BancoDeCurriculoDto): Promise<IServiceResponse> {
		try {
			const exists = await this.bancoDeCurriculoModel.exists({ nome: bancoDeCurriculoDto.nome });
			if (exists) return HttpResponse.conflict({}, "Já existe um banco de currículos com esse nome.");

			const bancoDeCurriculos = await this.bancoDeCurriculoModel.create(bancoDeCurriculoDto);

			return HttpResponse.ok(bancoDeCurriculos);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao criar o banco de currículos.");
		}
	}

	public async editarBancoDeCurriculos(bancoDeCurriculoId: string, bancoDeCurriculoDto: BancoDeCurriculoDto): Promise<IServiceResponse> {
		try {
			const exists = await this.bancoDeCurriculoModel.exists({ nome: bancoDeCurriculoDto.nome });
			if (exists && exists._id.toString() !== bancoDeCurriculoId)
				return HttpResponse.conflict({}, "Já existe um banco com esse nome.");

			const bancoDeCurriculos = await this.bancoDeCurriculoModel.findByIdAndUpdate(bancoDeCurriculoId, { ...bancoDeCurriculoDto });
			return HttpResponse.ok(bancoDeCurriculos);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao atualizar o banco de currículos.");
		}
	}

	public async deletarBancoDeCurriculos(bancoDeCurriculoId: string): Promise<IServiceResponse> {
		try {
			const bancoDeCurriculos = await this.bancoDeCurriculoModel.findById(bancoDeCurriculoId);
			if (!bancoDeCurriculos) return HttpResponse.notFound({}, "Banco de currículos não encontrado.");

			const pastas = await this.pastaModel.find({ bancoDeCurriculo: bancoDeCurriculoId });
			if (pastas.length > 0) return HttpResponse.conflict({}, "Não é possível deletar um banco de currículos com pastas.");

			await this.bancoDeCurriculoModel.findByIdAndDelete(bancoDeCurriculoId);

			return HttpResponse.ok({}, "Banco de currículos deletado com sucesso.");
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao deletar o banco de currículos.");
		}
	}

	//#endregion

	//#region CRUD - Pasta
	private async getSubPastasIds(bancoCurriculoId: string): Promise<ObjectId[]> {
		const pastas = await this.pastaModel.find({ bancoDeCurriculo: bancoCurriculoId }, { subPastas: 1 });
		const subPastasIds = pastas.map((p) => p.subPastas).flat();
		return subPastasIds;
	}

	public async listarPastas(bancoCurriculoId: string): Promise<IServiceResponse> {
		try {
			const subPastasIds = await this.getSubPastasIds(bancoCurriculoId);
			const pastasPai = await this.pastaModel.find(
				{
					bancoDeCurriculo: bancoCurriculoId,
					_id: { $nin: subPastasIds },
				},
				{},
				// {
				// 	populate: {
				// 		path: "subPastas",
				// 		model: "Pasta",
				// 	},
				// },
			);

			return HttpResponse.ok(pastasPai);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao listar as pastas.");
		}
	}

	public async obterPasta(bancoCurriculoId: string, pastaId: string): Promise<IServiceResponse> {
		try {
			const pasta = await this.pastaModel.findOne({ _id: pastaId, bancoDeCurriculo: bancoCurriculoId });
			if (!pasta) return HttpResponse.notFound({}, "Pasta não encontrada.");

			const subPastasData = [];
			if (pasta.subPastas.length > 0) {
				const subPastas = await this.pastaModel.find({ _id: { $in: pasta.subPastas } });
				subPastasData.push(...subPastas);
			}

			const documentosData = [];
			if (pasta.documentos.length > 0) {
				const documentos = await this.curriculoModel.find({ _id: { $in: pasta.documentos } }, { nome: 1, atualizadoEm: 1 });
				documentosData.push(...documentos);
			}

			return HttpResponse.ok({
				pasta,
				subPastas: subPastasData,
				documentos: documentosData,
			});
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao obter a pasta.");
		}
	}

	public async criarPasta(bancoCurriculoId: string, pastaDto: PastaDto): Promise<IServiceResponse> {
		try {
			if (pastaDto.pastaPai) {
				const pastasPai = await this.pastaModel.find(
					{ _id: pastaDto.pastaPai, bancoDeCurriculo: bancoCurriculoId },
					{ subPastas: 1 },
				);
				const objectIds = pastasPai.map((p) => p.subPastas).flat();
				const nomesPastas = await this.pastaModel.find({ _id: { $in: objectIds } }, { nome: 1 });

				const exists = nomesPastas.find((p) => p.nome === pastaDto.nome);
				if (exists) return HttpResponse.conflict({}, "Já existe uma pasta com esse nome.");
			} else {
				const exists = await this.pastaModel.exists({ nome: pastaDto.nome, bancoDeCurriculo: bancoCurriculoId });
				if (exists) return HttpResponse.conflict({}, "Já existe uma pasta com esse nome.");
			}

			const pasta = await this.pastaModel.create({
				...pastaDto,
				bancoDeCurriculo: bancoCurriculoId,
			});

			// Somente adiciona a pasta pai se ela existir e o usuário tiver acesso a ela.
			if (pastaDto.pastaPai) {
				const existsPai = await this.pastaModel.exists({ _id: pastaDto.pastaPai, bancoDeCurriculo: bancoCurriculoId });
				if (existsPai) await this.pastaModel.findByIdAndUpdate(pastaDto.pastaPai, { $push: { subPastas: pasta._id } });
			}

			return HttpResponse.ok(pasta);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao criar a pasta.");
		}
	}

	public async editarPasta(bancoCurriculoId: string, pastaId: string, pastaDto: PastaDto): Promise<IServiceResponse> {
		try {
			if (pastaDto.pastaPai) {
				const pastasPai = await this.pastaModel.find(
					{ _id: pastaDto.pastaPai, bancoDeCurriculo: bancoCurriculoId },
					{ subPastas: 1 },
				);
				const objectIds = pastasPai.map((p) => p.subPastas).flat();
				const nomesPastas = await this.pastaModel.find({ _id: { $in: objectIds } }, { nome: 1 });
				const exists = nomesPastas.find((p) => p.nome === pastaDto.nome && p._id.toString() !== pastaId);
				if (exists) return HttpResponse.conflict({}, "Já existe uma pasta com esse nome.");
			} else {
				const exists = await this.pastaModel.exists({
					nome: pastaDto.nome,
					bancoDeCurriculo: bancoCurriculoId,
					_id: { $ne: pastaId },
				});
				if (exists) return HttpResponse.conflict({}, "Já existe uma pasta com esse nome.");
			}

			delete (pastaDto as any).subPastas; // Garante que ninguém tente alterar as subpastas da pasta.

			const pasta = await this.pastaModel.findOneAndUpdate(
				{ _id: pastaId, bancoDeCurriculo: bancoCurriculoId },
				{ ...pastaDto },
				{ new: true },
			);
			if (!pasta) return HttpResponse.notFound({}, "Pasta não encontrada.");

			// Atualiza a pasta pai (se existir e o usuário tiver acesso a ela).
			if (pastaDto.pastaPai) {
				// Remove este documento da pasta pai anterior.
				const pastaAntiga = await this.pastaModel.findOne({ subPastas: pastaId });
				if (pastaAntiga) await this.pastaModel.findByIdAndUpdate(pastaAntiga._id, { $pull: { subPastas: pastaId } });

				// Adiciona este documento à nova pasta pai.
				await this.pastaModel.findByIdAndUpdate(pastaDto.pastaPai, { $push: { subPastas: pastaId } });
			}

			return HttpResponse.ok(pasta);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao atualizar a pasta.");
		}
	}

	public async deletarPasta(bancoCurriculoId: string, pastaId: string): Promise<IServiceResponse> {
		try {
			const pasta = await this.pastaModel.findOne({ _id: pastaId, bancoDeCurriculo: bancoCurriculoId });
			if (!pasta) return HttpResponse.notFound({}, "Pasta não encontrada.");

			if (pasta.documentos.length > 0)
				return HttpResponse.conflict({}, "Não é possível deletar uma pasta com documentos. Delete-os primeiro.");
			if (pasta.subPastas.length > 0)
				return HttpResponse.conflict({}, "Não é possível deletar uma pasta com subpastas. Delete-as primeiro.");

			await this.pastaModel.findByIdAndDelete(pastaId);

			return HttpResponse.ok({}, "Pasta deletada com sucesso.");
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao deletar a pasta.");
		}
	}
	//#endregion

	//#region CRUD - Currículos
	public async listarCurriculos(bancoCurriculoId: string, pastaId: string): Promise<IServiceResponse> {
		try {
			const pasta = await this.pastaModel.findOne({ _id: pastaId, bancoDeCurriculo: bancoCurriculoId });
			if (!pasta) return HttpResponse.notFound({}, "Pasta não encontrada.");

			const curriculos = await this.curriculoModel.find({ pasta: pastaId });

			return HttpResponse.ok(curriculos);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao listar os currículos.");
		}
	}

	public async obterCurriculo(pastaId: string, curriculoId: string): Promise<IServiceResponse> {
		try {
			const curriculo = await this.curriculoModel.findOne({ _id: curriculoId, pasta: pastaId });
			if (!curriculo) return HttpResponse.notFound({}, "Currículo não encontrado.");

			return HttpResponse.ok(curriculo);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao obter o currículo.");
		}
	}

	public async criarCurriculo(pastaId: string, curriculoDto: CurriculoDto, curriculoFile?: string): Promise<IServiceResponse> {
		try {
			const objectId = new mongoose.Types.ObjectId();

			let curriculoFileId: string | undefined;
			if (curriculoFile) curriculoFileId = await this.gridFsService.uploadFileBase64(curriculoFile, `${objectId}.pdf`);

			const curriculo = await this.curriculoModel.create({
				_id: objectId,
				...curriculoDto,
				pasta: pastaId,
				documento: curriculoFileId,
			});

			await this.pastaModel.findByIdAndUpdate(pastaId, { $push: { documentos: curriculo._id } });

			return HttpResponse.ok(curriculo);
		} catch (error: any) {
			console.log(error);
			return HttpResponse.internalServerError(error, "Erro ao criar o currículo.");
		}
	}

	public async editarCurriculo(pastaId: string, curriculoId: string, curriculoDto: CurriculoDto): Promise<IServiceResponse> {
		try {
			const curriculo = await this.curriculoModel.findOne({ _id: curriculoId, pasta: pastaId });
			if (!curriculo) return HttpResponse.notFound({}, "Currículo não encontrado.");

			await this.curriculoModel.findByIdAndUpdate(curriculoId, { ...curriculoDto });

			if (curriculoDto.documento) {
				// Excluí o documento anterior do GridFS
				if (curriculo.documento) await this.gridFsService.deleteFile(curriculo.documento);

				// Atualiza o documento no GridFS
				const curriculoFileId = await this.gridFsService.uploadFileBase64(curriculoDto.documento, `${curriculoId}.pdf`);
				await this.curriculoModel.findByIdAndUpdate(curriculoId, { documento: curriculoFileId });
			}

			return HttpResponse.ok({}, "Currículo atualizado com sucesso.");
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao atualizar o currículo.");
		}
	}

	public async deletarCurriculo(pastaId: string, curriculoId: string): Promise<IServiceResponse> {
		try {
			const curriculo = await this.curriculoModel.findOne({ _id: curriculoId, pasta: pastaId });
			if (!curriculo) return HttpResponse.notFound({}, "Currículo não encontrado.");

			await this.curriculoModel.findByIdAndDelete(curriculoId);

			// Remove o currículo da pasta
			await this.pastaModel.findByIdAndUpdate(pastaId, { $pull: { documentos: curriculoId } });

			// Excluí o documento do GridFS
			if (curriculo.documento) await this.gridFsService.deleteFile(curriculo.documento);

			return HttpResponse.ok({}, "Currículo deletado com sucesso.");
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao deletar o currículo.");
		}
	}

	public async buscarCandidato(bancoCurriculoId: string, pastaId: string, busca: string) {
		try {
			if (!busca) return HttpResponse.badRequest({}, "Informe o texto da busca.");

			if (!isObjectIdOrHexString(bancoCurriculoId))
				return HttpResponse.badRequest({}, "O ID do banco de currículos não é um ObjectId válido.");
			if (!isObjectIdOrHexString(pastaId)) return HttpResponse.badRequest({}, "O ID da pasta não é um ObjectId válido.");

			const pasta = await this.pastaModel.findOne({ _id: pastaId, bancoDeCurriculo: bancoCurriculoId });
			if (!pasta) return HttpResponse.notFound({}, "Pasta não encontrada.");

			const idsCurriculos = [...pasta.documentos];

			if (pasta.subPastas.length > 0) {
				const subPastas = await this.pastaModel.find({ _id: { $in: pasta.subPastas } });
				for (const subPasta of subPastas) idsCurriculos.push(...subPasta.documentos);
			}

			const curriculos = await this.curriculoModel.find({ _id: { $in: idsCurriculos } });
			if (curriculos.length === 0) return HttpResponse.notFound({}, "Nenhum currículo encontrado.");

			const resultado = await this.openAiService.buscarCurriculos(busca, curriculos);
			return HttpResponse.ok(resultado);
		} catch (error: any) {
			return HttpResponse.badRequest(error, "Erro ao buscar candidato.");
		}
	}
	//#endregion

	public async extrairDadosDoCurriculo(curriculo: Express.Multer.File): Promise<IServiceResponse> {
		try {
			const base64 = curriculo.buffer.toString("base64");
			const result = await this.openAiService.extrairDadosDoCurriculo(base64);

			return HttpResponse.ok(result);
		} catch (error: any) {
			return HttpResponse.internalServerError(error, "Erro ao extrair os dados do currículo.");
		}
	}
}
