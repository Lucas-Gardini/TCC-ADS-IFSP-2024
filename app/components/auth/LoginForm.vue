<script setup lang="ts">
import { ref } from "vue";
import formatCpfCnpj from "~/utils/formatCpfCnpj";

// Configurações e utilitários
const { appName, apiBaseUrl, certificateBaseUrl } = useAppConfig();
const router = useRouter(); // Para navegação entre páginas
const authStore = useAuthStore(); // Para gerenciar o estado de autenticação
const modal = useAppModal(); // Para exibir modais
const toast = useToast(); // Para exibir notificações

// Formulário de autenticação
const authForm = ref({
	login: "",
	senha: "",
	isForgotPassword: false,
	saveLogin: false,
});

const dadosEmpresa = ref();

// Emissão de eventos
const emit = defineEmits(["toggleForm", "pendente"]);

/**
 * Faz o login do usuário. Se uma plataforma for fornecida, redireciona o usuário para a página de autenticação dessa plataforma.
 * Caso contrário, tenta autenticar usando as credenciais fornecidas no formulário.
 *
 * @param platform - Plataforma de autenticação externa (opcional). Pode ser "google", "microsoft", "apple", "govbr" ou "certificado".
 */
async function login() {
	modal.showSync("loading"); // Exibe o modal de carregamento

	try {
		// Tenta autenticar o usuário com as credenciais fornecidas
		await authStore.credentialsLogin(authForm.value.login, authForm.value.senha);

		if (authForm.value.saveLogin) localStorage.setItem("@app:login", authForm.value.login);
		else localStorage.removeItem("@app:login");

		router.push("/app"); // Redireciona para a página de caixa postal em caso de sucesso
	} catch (err: any) {
		axiosToastError(err, toast); // Exibe uma notificação de erro
	} finally {
		modal.hide(); // Fecha o modal de carregamento
	}
}

async function forgotPassword() {
	if (!authForm.value.login) {
		toast.add({ severity: "error", summary: "Informe o e-mail para recuperar a senha." });
		return;
	}

	modal.showSync("loading");

	try {
		await authStore.forgotPassword(authForm.value.login);
		authForm.value.isForgotPassword = false;
		authForm.value.login = "";
		authForm.value.senha = "";
	} catch (err: any) {
		axiosToastError(err, toast);
	} finally {
		modal.hide();
	}
}

onMounted(() => {
	const login = localStorage.getItem("@app:login");
	if (login) {
		authForm.value.login = login;
		authForm.value.saveLogin = true;
	}

	authStore.getDadosEmpresa().then((res) => (dadosEmpresa.value = res));
});
</script>

<template>
	<div>
		<form v-focustrap class="min-w-[350px] md:min-w-[500px] w-full h-full lg:w-1/2">
			<div class="mb-5 text-center">
				<NuxtImg src="/images/logo.png" alt="Image" class="mb-3 h-[50px] mx-auto" />
				<div class="mb-3 text-3xl font-medium text-gray-900">{{ appName }} - {{ dadosEmpresa?.data?.nomeFantasia }}</div>
			</div>

			<div>
				<label for="user" class="block font-medium text-gray-900">Email</label>
				<InputText
					id="user"
					autocomplete="username"
					type="text"
					class="mb-3"
					fluid
					v-model="authForm.login"
					@change="() => (authForm.login = formatCpfCnpj(authForm.login))"
				/>

				<div v-if="!authForm.isForgotPassword">
					<label for="password" class="block font-medium text-gray-900">Senha</label>
					<Password id="password" v-model="authForm.senha" fluid :feedback="false" toggleMask autocomplete="current-password" />
				</div>

				<div class="flex flex-row items-center my-3">
					<Checkbox v-model="authForm.saveLogin" :binary="true" class="mr-2" />
					<label for="saveLogin" class="text-gray-900">Lembrar de mim</label>
				</div>

				<Button label="Entrar" class="w-full" @click="() => login()"></Button>

				<!-- <Divider align="center" type="solid"> <b>não tem uma conta?</b> </Divider>

				<Button fluid severity="success" @click="emit('toggleForm', 'register')">
					<Icon name="fa6-solid:universal-access" class="mr-2" />
					Relizar Cadastro
				</Button> -->
			</div>
		</form>
	</div>
</template>

<style scoped lang="scss">
.govbr-font {
	font-weight: 900 !important;
}
</style>
