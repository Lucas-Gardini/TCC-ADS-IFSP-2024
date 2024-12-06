import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import mongoose, { Connection } from "mongoose";
import * as util from "util";
import * as fs from "fs";

/**
 * Serviço para interagir com o GridFS do MongoDB.
 * O GridFS é um sistema de arquivos para armazenar e gerenciar arquivos grandes no MongoDB.
 */
@Injectable()
export class GridFsService {
	/**
	 * Instância do GridFSBucket para interagir com o GridFS.
	 */
	private gridFSBucket: GridFSBucket;

	/**
	 * Função utilitária para escrever um arquivo de forma assíncrona.
	 */
	private writeFileAsync: (path: string, data: any) => Promise<void>;

	/**
	 * Construtor da classe GridFsService.
	 * @param connection Instância da conexão com o MongoDB.
	 */
	constructor(@InjectConnection() private readonly connection: Connection) {
		// Inicializa o GridFSBucket com a instância da conexão com o MongoDB.
		this.gridFSBucket = new GridFSBucket(this.connection.db);
		// Inicializa a função utilitária para escrever um arquivo de forma assíncrona.
		this.writeFileAsync = util.promisify(fs.writeFile);
	}

	/**
	 * Faz o upload de uma string como um arquivo JSON no GridFS.
	 * @param content Conteúdo da string a ser salva.
	 * @param filename Nome do arquivo a ser salvo.
	 * @returns Retorna true se o upload foi realizado com sucesso ou um erro caso contrário.
	 */
	async uploadStringAsJson(content: string, filename: string): Promise<boolean | Error> {
		// Converte a string para um buffer.
		const buffer = Buffer.from(content, "utf-8");

		// Abre um stream de upload para o GridFS.
		const uploadStream = this.gridFSBucket.openUploadStream(filename);
		// Escreve o buffer no stream de upload.
		uploadStream.end(buffer);

		// Retorna uma Promise que será resolvida quando o upload for finalizado.
		return new Promise((resolve, reject) => {
			uploadStream.on("finish", () => {
				resolve(true);
			});

			uploadStream.on("error", (error) => {
				reject(error);
			});
		});
	}

	/**
	 * Faz o upload de um arquivo codificado em base64 no GridFS.
	 * @param base64 Dados do arquivo codificado em base64.
	 * @param filename Nome do arquivo a ser salvo.
	 * @returns Retorna o ID do arquivo salvo no GridFS.
	 */
	async uploadFileBase64(base64: string, filename: string): Promise<string> {
		// Decodifica o base64 para um buffer.
		const buffer = Buffer.from(base64, "base64");

		// Abre um stream de upload para o GridFS.
		const uploadStream = this.gridFSBucket.openUploadStream(filename);

		// Escreve o buffer do arquivo no stream de upload.
		uploadStream.end(buffer);

		// Retorna uma Promise que será resolvida quando o upload for finalizado.
		return new Promise((resolve, reject) => {
			uploadStream.on("finish", () => {
				resolve(uploadStream.id.toHexString());
			});

			uploadStream.on("error", (error) => {
				reject(error);
			});
		});
	}

	/**
	 * Faz o download de um arquivo do GridFS.
	 * @param fileId ID do arquivo a ser baixado.
	 * @returns Retorna um buffer com o conteúdo do arquivo baixado.
	 */
	async downloadFile(fileId: string): Promise<Buffer> {
		// Abre um stream de download para o GridFS.
		const downloadStream = this.gridFSBucket.openDownloadStream(new ObjectId(fileId));
		const chunks = [];

		// Adiciona cada chunk do stream em um array.
		downloadStream.on("data", (chunk) => {
			chunks.push(chunk);
		});

		// Quando o download for finalizado, concatena os chunks em um buffer.
		return new Promise((resolve, reject) => {
			downloadStream.on("end", () => {
				resolve(Buffer.concat(chunks));
			});

			downloadStream.on("error", (error) => {
				reject(error);
			});
		});
	}

	/**
	 * Faz o download de um arquivo JSON do GridFS.
	 * @param filename Nome do arquivo a ser baixado.
	 * @returns Retorna um objeto JSON com o conteúdo do arquivo baixado.
	 */
	async dowloadFileAsJson(filename: string): Promise<Record<string, any>> {
		// Busca o arquivo no GridFS.
		const result = this.gridFSBucket.find({ filename: { $eq: filename } });

		// Retorna uma Promise que será resolvida quando o download for finalizado.
		return new Promise((resolve, reject) => {
			result.toArray().then((files) => {
				if (files.length === 0) {
					reject(new Error("File not found"));
				}

				const chunks = [];
				// Abre um stream de download para o GridFS.
				const downloadStream = this.gridFSBucket.openDownloadStreamByName(filename);

				// Adiciona cada chunk do stream em um array.
				downloadStream.on("data", (chunk) => {
					chunks.push(chunk);
				});

				// Quando o download for finalizado, concatena os chunks em um buffer e converte para JSON.
				downloadStream.on("end", () => {
					const buffer = Buffer.concat(chunks);
					const result = buffer.toString().replace(/\\x/g, "%");
					resolve(JSON.parse(result));
				});

				downloadStream.on("error", (error) => {
					reject(error);
				});
			});
		});
	}

	/**
	 * Faz o download de um arquivo do GridFS e salva em disco.
	 * @param fileId ID do arquivo a ser baixado.
	 * @param savePath Caminho onde o arquivo será salvo.
	 * @returns Retorna uma Promise que será resolvida quando o download e a escrita do arquivo forem finalizados.
	 */
	async downloadJsonToFile(fileId: string, savePath: string): Promise<void> {
		// Abre um stream de download para o GridFS.
		const downloadStream = this.gridFSBucket.openDownloadStream(new ObjectId(fileId));
		const chunks = [];

		// Adiciona cada chunk do stream em um array.
		downloadStream.on("data", (chunk) => {
			chunks.push(chunk);
		});

		// Quando o download for finalizado, concatena os chunks em um buffer e escreve o arquivo em disco.
		return new Promise(async (resolve, reject) => {
			downloadStream.on("end", async () => {
				const buffer = Buffer.concat(chunks);
				await this.writeFileAsync(savePath, buffer);
				resolve();
			});

			downloadStream.on("error", (error) => {
				reject(error);
			});
		});
	}

	/**
	 * Deleta um arquivo do GridFS.
	 * @param fileId ID do arquivo a ser deletado.
	 * @returns Retorna uma Promise que será resolvida quando o arquivo for deletado com sucesso.
	 */
	async deleteFile(fileId: mongoose.Schema.Types.ObjectId): Promise<void> {
		// Deleta o arquivo do GridFS.
		return this.gridFSBucket.delete(fileId as unknown as ObjectId);
	}
}
