import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { HttpResponse } from "semantic-response";
import { zodResponseFormat } from "openai/helpers/zod";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import { DadosCurriculoSchema, RetornoBuscaCurriculos } from "./types/openai.types";
import { ChatBotDto, SaveConfigsDto } from "./openai.dto";
import { InjectModel } from "@nestjs/mongoose";
import { ConfiguracaoOpenAi } from "./schemas/openai-config.schema";
import { Model } from "mongoose";

import { encoding_for_model, TiktokenModel } from "tiktoken";
import { ChatCompletionMessageParam } from "openai/resources";

/**
 * Serviço responsável por interagir com a API OpenAI e processar currículos em formato PDF.
 *
 * Este serviço realiza a extração de texto de PDFs e utiliza a API OpenAI para analisar os dados
 * dos currículos com base em um esquema definido.
 */
@Injectable()
export class OpenaiService implements OnApplicationBootstrap {
	private client: OpenAI;

	constructor(@InjectModel(ConfiguracaoOpenAi.name) private readonly configuracaoModel: Model<ConfiguracaoOpenAi>) {}

	/**
	 * Inicializa o cliente OpenAI após a inicialização da aplicação.
	 *
	 * Este método é chamado automaticamente após a aplicação ser inicializada e configura o
	 * cliente OpenAI com a chave de API fornecida nas variáveis de ambiente.
	 */
	async onApplicationBootstrap() {
		let key = await this.configuracaoModel.findOne({ chave: "openai-api-key" });
		if (!key) key = await this.configuracaoModel.create({ chave: "openai-api-key", valor: process.env.OPENAI_API_KEY });

		let personalidade = await this.configuracaoModel.findOne({ chave: "openai-personality" });
		if (!personalidade)
			personalidade = await this.configuracaoModel.create({
				chave: "openai-personality",
				valor: "Você é uma consultora de RH brasileira, formada, e de alto conhecimento. Atue de forma imparcia e crítica. Seja breve, a menos que sejam solicitadas informações detalhadas.",
			});

		let model = await this.configuracaoModel.findOne({ chave: "openai-model" });
		if (!model) model = await this.configuracaoModel.create({ chave: "openai-model", valor: "gpt-4o-mini" });

		this.client = new OpenAI({
			apiKey: key.valor,
		});
	}

	/**
	 * Extrai o texto de um arquivo PDF codificado em base64.
	 *
	 * @param {string} pdfB64 - O conteúdo do PDF codificado em base64.
	 * @returns {Promise<pdfParse.Result>} - Uma Promise que resolve com o resultado da análise do PDF.
	 */
	private async extrairTextoDoPdf(pdfB64: string): Promise<pdfParse.Result> {
		const pdfBuffer = Buffer.from(pdfB64, "base64");
		return pdfParse(pdfBuffer);
	}

	/**
	 * Extrai e analisa dados de um currículo em formato PDF codificado em base64.
	 *
	 * Este método realiza a extração de texto do PDF e utiliza a API OpenAI para analisar o currículo
	 * de acordo com o esquema fornecido (`DadosCurriculoSchema`).
	 *
	 * @param {string} curriculoB64 - O currículo em formato PDF codificado em base64.
	 * @returns {Promise<any>} - Uma Promise que resolve com os dados analisados do currículo.
	 */
	public async extrairDadosDoCurriculo(curriculoB64: string): Promise<Record<string, any>> {
		try {
			const pdfData = await this.extrairTextoDoPdf(curriculoB64);

			if (!pdfData.text.trim()) {
				return HttpResponse.badRequest({}, "Não foi possível extrair o texto do PDF.");
			}

			const messages = [
				{
					role: "system",
					content: "Analise o currículo enviado, e retorne conforme o schema solicitado",
				},
				{ role: "user", content: pdfData.text },
			] as ChatCompletionMessageParam[];

			const tokens = await this.calculateTokens(pdfData.text);

			if (tokens > 128000) {
				throw new Error("[extrairDadosDoCurriculo] O tamanho do currículo excede o limite de tokens.");
			} else {
				console.log("[extrairDadosDoCurriculo] Tamanho do currículo:", tokens, "tokens");
			}

			const response = await this.client.chat.completions.create({
				messages,
				model: (await this.configuracaoModel.findOne({ chave: "openai-model" })).valor,
				response_format: zodResponseFormat(DadosCurriculoSchema, "dados_curriculo"),
			});

			const gasto = response?.usage?.total_tokens;
			console.log("[extrairDadosDoCurriculo] Tokens gastos:", gasto);

			if (response.choices && response.choices.length > 0) {
				return JSON.parse(response.choices[0].message.content.trim());
			} else {
				throw new Error("GPT não retornou respostas");
			}
		} catch (error) {
			console.error("Erro com a OpenAI API:", error);
			throw error;
		}
	}

	public async chatBot(chatDto: ChatBotDto) {
		const pdfDataMessages = [];
		const curriculos = [];
		if (chatDto.files && chatDto.files.length > 0) {
			for (const file of chatDto.files) {
				const pdfData = await this.extrairTextoDoPdf(file.data.includes("base64") ? file.data.split(",")[1] : file.data);

				if (file.curriculo) {
					const curriculoData = await this.extrairDadosDoCurriculo(
						file.data.includes("base64") ? file.data.split(",")[1] : file.data,
					);
					curriculos.push({
						pdf: file.name,
						data: curriculoData,
					});
				}

				pdfDataMessages.push({ role: "user", content: `<pdfTitle>${file.name}</pdfTitle><pdfData>${pdfData.text}</pdfData>` });
			}
		}

		const messages = [
			{
				role: "system",
				content: (await this.configuracaoModel.findOne({ chave: "openai-personality" })).valor,
			},
			...chatDto.previousMessages,
			...pdfDataMessages,
			{
				role: "user",
				content: chatDto.newMessage,
			},
		] as ChatCompletionMessageParam[];

		const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
			model: (await this.configuracaoModel.findOne({ chave: "openai-model" })).valor,
			messages,
		};

		const completion = await this.client.chat.completions.create(body);

		if (completion.choices && completion.choices.length > 0)
			return HttpResponse.ok({
				resposta: completion.choices[0].message.content,
				curriculos,
			});
		else return HttpResponse.noContent("Nenhuma resposta fornecida pelo modelo.");
	}

	public async getConfigs() {
		const key = await this.configuracaoModel.findOne({ chave: "openai-api-key" });
		const personalidade = await this.configuracaoModel.findOne({ chave: "openai-personality" });
		const model = await this.configuracaoModel.findOne({ chave: "openai-model" });

		return HttpResponse.ok({
			key: key.valor,
			personality: personalidade.valor,
			model: model.valor,
		});
	}

	public async setConfigs(body: SaveConfigsDto) {
		await this.configuracaoModel.findOneAndUpdate({ chave: "openai-api-key" }, { valor: body.key });
		await this.configuracaoModel.findOneAndUpdate({ chave: "openai-personality" }, { valor: body.personality });
		await this.configuracaoModel.findOneAndUpdate({ chave: "openai-model" }, { valor: body.model });

		return HttpResponse.ok("Configurações atualizadas com sucesso.");
	}

	public async calculateTokens(text: string) {
		const enc = encoding_for_model((await this.configuracaoModel.findOne({ chave: "openai-model" })).valor as TiktokenModel);

		const length = enc.encode(text).length;
		enc.free();

		return length;
	}

	public async buscarCurriculos(busca: string, curriculos: any[]) {
		try {
			const openAiMessage = `<curriculos>${JSON.stringify(curriculos)}</curriculos>`;

			const messages = [
				{
					role: "system",
					content: `Busque na lista a seguir, o que for pedido: <busca>${busca}</busca>`,
				},
				{ role: "user", content: openAiMessage },
			] as ChatCompletionMessageParam[];

			const tokens = await this.calculateTokens(JSON.stringify(curriculos));

			if (tokens > 128000) {
				throw new Error("[buscarCurriculos] O tamanho total dos currículos excede o limite de tokens.");
			} else {
				console.log("[buscarCurriculos] Tamanho total dos currículos:", tokens, "tokens");
			}

			console.log(messages);

			const response = await this.client.chat.completions.create({
				messages,
				model: (await this.configuracaoModel.findOne({ chave: "openai-model" })).valor,
				response_format: zodResponseFormat(RetornoBuscaCurriculos, "retorno_busca_curriculos"),
			});

			const gasto = response?.usage?.total_tokens;
			console.log("[buscarCurriculos] Tokens gastos:", gasto);

			if (response.choices && response.choices.length > 0) {
				return JSON.parse(response.choices[0].message.content.trim());
			} else {
				throw new Error("GPT não retornou respostas");
			}
		} catch (error) {
			console.error("Erro com a OpenAI API:", error);
			throw error;
		}
	}
}
