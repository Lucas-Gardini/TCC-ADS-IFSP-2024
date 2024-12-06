import axiosInstance from "axios";

/**
 * Plugin do Nuxt para configurar a instância do Axios.
 *
 * @remarks
 * Este plugin configura o Axios com a URL base da API e habilita o envio de cookies com as solicitações.
 *
 * @returns {object} Objeto que fornece a instância configurada do Axios.
 */
export default defineNuxtPlugin({
	name: "api",
	enforce: "post",

	/**
	 * Configura o plugin com a instância do Axios.
	 *
	 * @param {object} _ - Parâmetro de configuração do setup (não utilizado).
	 * @returns {object} Objeto que fornece a instância configurada do Axios.
	 */
	async setup(_) {
		const config = useAppConfig();

		/** Instância do Axios configurada. */
		const axios = axiosInstance.create({
			baseURL: String(config.apiBaseUrl),
			withCredentials: true,
		});

		return {
			provide: { axios },
		};
	},

	/**
	 * Configurações de ambiente para o plugin.
	 */
	env: {
		/** Desativa a renderização de ilhas no Nuxt. */
		islands: false,
	},
});
