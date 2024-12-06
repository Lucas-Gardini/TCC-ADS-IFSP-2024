import { Type, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiInternalServerErrorResponse, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { SetMetadata } from "@nestjs/common";
import { ePermissao } from "./modules/auth/enums/role.enum";

/**
 * Decorador para definir uma resposta padrão que retorna um DTO.
 *
 * @param model - O modelo do objeto que será retornado na resposta.
 * @returns Um decorador que pode ser usado para definir a resposta de uma rota da API.
 */
export const AppDtoResponse = <TModel extends Type<any>>(model: TModel) => {
	return applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			schema: {
				allOf: [
					{
						properties: {
							status: {
								type: "number",
								description: "Status da requisição.",
								default: 200,
							},
							success: {
								type: "boolean",
								description: "Indica se a requisição foi bem sucedida.",
								default: true,
							},
							data: {
								$ref: getSchemaPath(model),
								description: "Objeto de retorno da requisição.",
							},
							message: {
								type: "string",
								description: "Mensagem de retorno da requisição.",
							},
						},
					},
				],
			},
		}),
	);
};

/**
 * Decorador para definir uma resposta padrão que retorna um objeto.
 *
 * @param data - O modelo do objeto que será retornado na resposta.
 * @returns Um decorador que pode ser usado para definir a resposta de uma rota da API.
 */
export const AppCustomObjectResponse = (data) => {
	return applyDecorators(
		ApiOkResponse({
			schema: {
				allOf: [
					{
						properties: {
							status: {
								type: "number",
								description: "Status da requisição.",
								default: 200,
							},
							success: {
								type: "boolean",
								description: "Indica se a requisição foi bem sucedida.",
								default: true,
							},
							data: {
								type: "object",
								description: "Objeto de retorno da requisição.",
								default: data,
							},
							message: {
								type: "string",
								description: "Mensagem de retorno da requisição.",
							},
						},
					},
				],
			},
		}),
	);
};

/**
 * Decorador para definir uma resposta padrão que retorna um texto.
 *
 * @param defaultText - O texto padrão que será retornado na resposta.
 * @returns Um decorador que pode ser usado para definir a resposta de uma rota da API.
 */
export const AppTextResponse = (defaultText: string) => {
	return applyDecorators(
		ApiOkResponse({
			schema: {
				allOf: [
					{
						properties: {
							status: {
								type: "number",
								description: "Status da requisição.",
								default: 200,
							},
							success: {
								type: "boolean",
								description: "Indica se a requisição foi bem sucedida.",
								default: true,
							},
							data: {
								type: "string",
								description: "Texto de retorno da requisição.",
								default: defaultText,
							},
							message: {
								type: "string",
								description: "Mensagem de retorno da requisição.",
							},
						},
					},
				],
			},
		}),
	);
};

/**
 * Decorador para definir uma resposta padrão de erro.
 *
 * Este decorador é usado para definir a resposta padrão para erros que ocorrem durante a execução de uma rota da API.
 *
 * @returns Um decorador que pode ser usado para definir a resposta de erro de uma rota da API.
 */
export const AppErrorResponse = () => {
	return applyDecorators(
		ApiInternalServerErrorResponse({
			schema: {
				allOf: [
					{
						properties: {
							status: {
								type: "number",
								description: "Status da requisição.",
								default: 500,
							},
							success: {
								type: "boolean",
								description: "Indica se a requisição foi bem sucedida.",
								default: false,
							},
							message: {
								type: "string",
								description: "Mensagem de retorno da requisição.",
							},

							error: {
								type: "object",
								properties: {
									data: {
										type: "object",
										description: "Dados do erro.",
									},
									extra: {
										type: "object",
										description: "Informações extras.",
									},
								},
							},
						},
					},
				],
			},
		}),
	);
};

export const PERMISSOES_KEY = "permissao";
export const Permissao = (...roles: ePermissao[]) => SetMetadata(PERMISSOES_KEY, roles);
