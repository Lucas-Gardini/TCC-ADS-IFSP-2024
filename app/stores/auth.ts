import { defineStore } from "pinia";
import type { IServiceResponse } from "semantic-response";

/**
 * Representa os dados do usuário.
 */
export interface IUserAuthData {
	_id: string;
	email: string;
	nomeExibicao: string;
	permissoes: string[];
	ativo: boolean;
	token: string;
	verificado: boolean;
	criadoEm: string;
	atualizadoEm: string;
	empresa: Empresa;
}

export interface Empresa {
	aguardandoExclusao: boolean;
	exclusaoSolicitadaEm: any;
	_id: string;
	cnpj: string;
	razaoSocial: string;
	telefone: string;
	email: string;
	cep: string;
	logradouro: string;
	numero: string;
	complemento: string;
	bairro: string;
	cidade: string;
	estado: string;
	usuarios: string[];
	criadoEm: string;
	atualizadoEm: string;
	bancosDeCurriculos: string[];
}

/**
 * Representa o endereço do usuário.
 */
export interface Endereco {
	cep: string;
	bairro: string;
	cidade: string;
	estado: string;
	numero: string;
	logradouro: string;
	tipoDeLogradouro: string;
}

/**
 * Define a store de autenticação usando Pinia.
 * @returns {object} Objeto contendo o estado e as ações relacionadas à autenticação.
 */
export const useAuthStore = defineStore(
	"auth",
	() => {
		const { $axios } = useNuxtApp();
		const toast = useToast();
		const router = useRouter();

		const loggedIn = ref(false);

		const userData = ref<IUserAuthData>();

		function setLoggedIn(status: boolean) {
			loggedIn.value = status;
		}

		async function getDadosEmpresa() {
			try {
				const { data } = await $axios.get("/empresa");
				return data;
			} catch (error) {
				throw error;
			}
		}

		async function validateSession() {
			try {
				await $axios.get("/auth/validar-sessao");
			} catch (error) {
				loggedIn.value = false;
				throw error;
			}
		}

		async function credentialsLogin(email: string, senha: string) {
			const { data } = await $axios.post<IServiceResponse<IUserAuthData>>("/auth/login", {
				email,
				senha,
			});

			if (data?.data?.verificado) {
				userData.value = data.data;
				loggedIn.value = true;
				toast.add({ severity: "success", summary: data.message, life: 5000 });
			} else {
				toast.add({ severity: "error", summary: data.message, life: 5000 });
			}
		}

		async function forgotPassword(login: string) {
			const { data } = await $axios.get<IServiceResponse<unknown>>("/auth/esqueci-minha-senha?login=" + login);

			if (data) {
				toast.add({ severity: "success", summary: data.message, life: 5000 });
			} else {
				toast.add({ severity: "error", summary: "Não foi possível enviar o link de recuperação.", life: 5000 });
			}
		}

		async function changePasswordByToken(token: string, senha: string) {
			const { data } = await $axios.post<IServiceResponse<unknown>>(`/auth/alterar-senha-token`, { token, senha });

			if (data) {
				toast.add({ severity: "success", summary: data.message, life: 5000 });
			} else {
				toast.add({ severity: "error", summary: "Não foi possível redefinir a senha.", life: 5000 });
			}
		}

		async function logout() {
			await $axios.delete("/auth/logout");
			loggedIn.value = false;
			userData.value = undefined;

			router.push("/acessar");
		}

		return {
			loggedIn,
			userData,
			getDadosEmpresa,
			credentialsLogin,
			forgotPassword,
			changePasswordByToken,
			setLoggedIn,
			validateSession,
			logout,
		};
	},
	{ persist: true }
);
