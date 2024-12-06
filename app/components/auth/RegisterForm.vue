<script setup lang="ts">
import { isValidCEP } from "@brazilian-utils/brazilian-utils";
import type { IServiceResponse } from "semantic-response";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { states } from "~/utils/viacep";

const emit = defineEmits(["toggleForm"]);

/**
 * Obtém o nome da aplicação e configurações necessárias do Nuxt.
 */
const { appName } = useAppConfig();
const { $axios } = useNuxtApp();
const toast = useToast();
const modal = useAppModal();

/**
 * Esquema de validação do formulário usando o `yup`.
 */
const schema = yup.object({
	emailAdmin: yup.string().email("O email é inválido").required("O email do administrador é obrigatório"),
	senhaAdmin: yup.string().required("A senha do administrador é obrigatória"),
	repetirSenhaAdmin: yup
		.string()
		.required("A confirmação da senha do administrador é obrigatória")
		.oneOf([yup.ref("senhaAdmin")], "As senhas devem ser iguais"),
	cnpj: yup.string().required("O CNPJ é obrigatório"),
	razaoSocial: yup.string().required("A Razão Social é obrigatória"),
	nomeFantasia: yup.string().required("O Nome Fantasia é obrigatório"),
	telefone: yup.string().required("O telefone é obrigatório"),
	email: yup.string().email("O email é inválido").required("O email é obrigatório"),
	cep: yup.string().required("O CEP é obrigatório"),
	logradouro: yup.string().required("O logradouro é obrigatório"),
	numero: yup.string().required("O número é obrigatório"),
	complemento: yup.string(),
	bairro: yup.string().required("O bairro é obrigatório"),
	cidade: yup.string().required("A cidade é obrigatória"),
	estado: yup.string().required("O estado é obrigatório"),
});

/**
 * Hook de validação do formulário usando `vee-validate`.
 */
const { defineField, handleSubmit, resetForm, errors } = useForm({
	validationSchema: schema,
});

/** Campos do formulário. */
const [emailAdmin] = defineField<string>("emailAdmin");
const [senhaAdmin] = defineField<string>("senhaAdmin");
const [repetirSenhaAdmin] = defineField<string>("repetirSenhaAdmin");
const [cnpj] = defineField<string>("cnpj");
const [razaoSocial] = defineField<string>("razaoSocial");
const [nomeFantasia] = defineField<string>("nomeFantasia");
const [telefone] = defineField<string>("telefone");
const [email] = defineField<string>("email");
const [cep] = defineField<string>("cep");
const [logradouro] = defineField<string>("logradouro");
const [numero] = defineField<string>("numero");
const [complemento] = defineField<string>("complemento");
const [bairro] = defineField<string>("bairro");
const [cidade] = defineField<string>("cidade");
const [estado] = defineField<string>("estado");

/**
 * Função chamada ao enviar o formulário.
 * Envia os dados para o servidor.
 *
 * @param values Dados do formulário.
 */
const onSubmit = handleSubmit(async (values) => {
	if (senhaAdmin.value !== repetirSenhaAdmin.value) alert("As senhas não coincidem");

	modal.showSync("loading");

	const objectToSend = {
		emailAdmin: emailAdmin.value,
		senhaAdmin: senhaAdmin.value,
		cnpj: cnpj.value,
		razaoSocial: razaoSocial.value,
		nomeFantasia: nomeFantasia.value,
		telefone: telefone.value,
		email: email.value,
		cep: cep.value,
		logradouro: logradouro.value,
		numero: numero.value,
		complemento: complemento.value,
		bairro: bairro.value,
		cidade: cidade.value,
		estado: estado.value,
	};

	try {
		const { data } = await $axios.post<IServiceResponse>("/primeiro-cadastro", objectToSend);

		toast.add({
			severity: "success",
			detail: String(data.data),
			summary: data.message,
			life: 5000,
		});

		resetForm();
		emit("toggleForm", "login");
	} catch (error: any) {
		axiosToastError(error, toast);
	} finally {
		modal.hide();
	}
});

/**
 * Função para verificar e buscar dados do CEP.
 */
const loadingCEP = ref(false);
const checkCep = async () => {
	if (!isValidCEP(cep.value)) return;

	loadingCEP.value = true;
	modal.showSync("loading");

	try {
		const cepData = await viacep(cep.value);

		if (cepData) {
			cidade.value = cepData.localidade;
			bairro.value = cepData.bairro;
			estado.value = cepData.uf;
			logradouro.value = cepData.logradouro;
		}
	} catch {
		toast.add({ severity: "error", summary: "CEP inválido", life: 3000 });
	} finally {
		loadingCEP.value = false;
		modal.hide();
	}
};
</script>

<template>
	<div v-focustrap class="container min-w-[70vw] w-full h-full flex flex-col justify-center">
		<!-- Header -->
		<div class="flex flex-row items-center gap-5 mb-5">
			<NuxtImg src="/images/logo.png" alt="Image" class="mb-3 h-[50px]" />
			<div class="text-gray-900 text-3xl font-medium mb-3">{{ appName }} - Registro</div>
		</div>

		<!-- Form -->
		<form v-focustrap @submit.prevent="onSubmit" class="flex flex-col gap-3 w-full">
			<div class="flex flex-col sm:flex-row gap-5">
				<!-- CNPJ -->
				<div class="w-full">
					<label for="cnpj" class="block text-gray-900 font-medium">CNPJ</label>
					<InputText id="cnpj" v-model="cnpj" placeholder="00.000.000/0000-00" fluid maxlength="18" />
					<small id="cnpj-help" class="text-red-500">
						{{ errors.cnpj }}
					</small>
				</div>

				<!-- Email do Admin -->
				<div class="w-full">
					<label for="emailAdmin" class="block text-gray-900 font-medium">Usuário (email)</label>
					<InputText id="emailAdmin" v-model="emailAdmin" placeholder="admin@email.com" fluid autocomplete="email" />
					<small id="emailAdmin-help" class="text-red-500">
						{{ errors.emailAdmin }}
					</small>
				</div>
			</div>

			<!-- Senha do Admin -->
			<div class="flex flex-col w-full">
				<label for="senhaAdmin" class="block text-gray-900 font-medium">Senha </label>
				<Password id="senhaAdmin" v-model="senhaAdmin" fluid :feedback="false" toggleMask autocomplete="current-password" />
				<small id="senhaAdmin-help" class="text-red-500">
					{{ errors.senhaAdmin }}
				</small>
			</div>

			<!-- Repetir Senha do Admin -->
			<div class="flex flex-col w-full">
				<label for="repetirSenhaAdmin" class="block text-gray-900 font-medium">Repetir Senha</label>
				<Password id="repetirSenhaAdmin" v-model="repetirSenhaAdmin" fluid :feedback="false" toggleMask autocomplete="current-password" />
				<small id="repetirSenhaAdmin-help" class="text-red-500">
					{{ errors.repetirSenhaAdmin }}
				</small>
			</div>

			<!-- Razão Social -->
			<div class="flex flex-col w-full">
				<label for="razaoSocial" class="block text-gray-900 font-medium">Razão Social</label>
				<InputText id="razaoSocial" v-model="razaoSocial" fluid />
				<small id="razaoSocial-help" class="text-red-500">
					{{ errors.razaoSocial }}
				</small>
			</div>

			<!-- Nome Fantasia -->
			<div class="flex flex-col w-full">
				<label for="nomeFantasia" class="block text-gray-900 font-medium">Nome Fantasia</label>
				<InputText id="nomeFantasia" v-model="nomeFantasia" fluid />
				<small id="nomeFantasia-help" class="text-red-500">
					{{ errors.nomeFantasia }}
				</small>
			</div>

			<!-- Telefone -->
			<div class="flex flex-col w-full">
				<label for="telefone" class="block text-gray-900 font-medium">Telefone para contato</label>
				<InputText id="telefone" v-model="telefone" placeholder="(99) 99999-9999" fluid />
				<small id="telefone-help" class="text-red-500">
					{{ errors.telefone }}
				</small>
			</div>

			<!-- Email -->
			<div class="flex flex-col w-full">
				<label for="email" class="block text-gray-900 font-medium">Email para contato</label>
				<InputText id="email" v-model="email" placeholder="exemplo@email.com" fluid autocomplete="email" />
				<small id="email-help" class="text-red-500">
					{{ errors.email }}
				</small>
			</div>

			<!-- CEP -->
			<div class="flex flex-col w-full">
				<label for="cep" class="block text-gray-900 font-medium">CEP</label>
				<InputMask id="cep" v-model="cep" mask="99999-999" fluid @blur="checkCep" />
				<small id="cep-help" class="text-red-500">
					{{ errors.cep }}
				</small>
			</div>

			<div class="flex flex-col sm:flex-row gap-3">
				<div class="flex flex-col w-full">
					<!-- Logradouro -->
					<label for="logradouro" class="block text-gray-900 font-medium">Logradouro</label>
					<InputText id="logradouro" v-model="logradouro" fluid />
					<small id="logradouro-help" class="text-red-500">
						{{ errors.logradouro }}
					</small>
				</div>

				<div class="flex flex-col w-full">
					<!-- Número -->
					<label for="numero" class="block text-gray-900 font-medium">Número</label>
					<InputText id="numero" v-model="numero" fluid />
					<small id="numero-help" class="text-red-500">
						{{ errors.numero }}
					</small>
				</div>
			</div>

			<!-- Complemento -->
			<div class="flex flex-col w-full">
				<label for="complemento" class="block text-gray-900 font-medium">Complemento</label>
				<InputText id="complemento" v-model="complemento" fluid />
				<small id="complemento-help" class="text-red-500">
					{{ errors.complemento }}
				</small>
			</div>

			<div class="flex gap-3 flex-col sm:flex-row">
				<!-- Bairro -->
				<div class="flex flex-col w-full">
					<label for="bairro" class="block text-gray-900 font-medium">Bairro</label>
					<InputText id="bairro" v-model="bairro" fluid />
					<small id="bairro-help" class="text-red-500">
						{{ errors.bairro }}
					</small>
				</div>

				<!-- Cidade -->
				<div class="flex flex-col w-full">
					<label for="cidade" class="block text-gray-900 font-medium">Cidade</label>
					<InputText id="cidade" v-model="cidade" fluid />
					<small id="cidade-help" class="text-red-500">
						{{ errors.cidade }}
					</small>
				</div>

				<div class="flex flex-col w-full">
					<!-- Estado -->
					<label for="estado" class="block text-gray-900 font-medium">Estado</label>
					<Select id="estado" v-model="estado" :options="states" />
					<small id="estado-help" class="text-red-500">
						{{ errors.estado }}
					</small>
				</div>
			</div>

			<Button label="Completar Registro" class="w-full" type="submit"></Button>

			<Divider align="center" type="solid"> <b>não tem uma conta?</b> </Divider>

			<Button fluid severity="success" @click="$emit('toggleForm', 'login')">
				<Icon name="fa6-solid:universal-access" class="mr-2" />
				Realizar Login
			</Button>
		</form>
	</div>
</template>
