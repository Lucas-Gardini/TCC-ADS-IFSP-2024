<script setup lang="ts">
const modal = useAppModal();
const toast = useToast();
const { $axios } = useNuxtApp();

const openaiConfig = reactive({
	key: "",
	personality: "",
	model: "",
});

async function getConfigs() {
	try {
		const { data } = await $axios.get("/openai/configs");
		Object.assign(openaiConfig, data.data);
	} catch {
		toast.add({
			detail: "Erro ao carregar configurações",
			summary: "Erro",
			severity: "error",
			life: 5000,
		});
	}
}

async function saveConfigs() {
	if (!openaiConfig.key || !openaiConfig.model || !openaiConfig.personality) {
		toast.add({
			detail: "Preencha todos os campos",
			summary: "Erro",
			severity: "error",
			life: 5000,
		});
		return;
	}

	modal.showSync("loading");

	try {
		await $axios.put("/openai/configs", openaiConfig);
		toast.add({
			detail: "Configurações salvas com sucesso",
			summary: "Sucesso",
			severity: "success",
			life: 5000,
		});
	} catch {
		toast.add({
			detail: "Erro ao salvar configurações",
			summary: "Erro",
			severity: "error",
			life: 5000,
		});
	} finally {
		modal.hide();
	}
}

onMounted(() => {
	modal.showSync("loading");
	getConfigs().then(() => modal.hide());
});
</script>

<template>
	<Panel>
		<template #header>
			<div class="flex items-center gap-2">
				<!-- <Avatar image="images/cloudia.png" size="large" shape="circle" /> -->
				<span class="font-bold">Configurações</span>
			</div>
		</template>

		<div class="flex flex-col gap-5">
			<div class="flex flex-col">
				<label for="apiKey">ApiKey</label>
				<InputText id="apiKey" v-model="openaiConfig.key" aria-describedby="apiKey-help" />
				<small id="apiKey-help">Insira aqui sua chave de API gerada no site da OpenAI.</small>
			</div>

			<div class="flex flex-col">
				<label for="model">Modelo</label>
				<InputText id="model" v-model="openaiConfig.model" aria-describedby="model-help" />
				<small id="model-help">Insira aqui o modelo que você deseja usar nas gerações por IA. Ex: gpt-4o-mini</small>
			</div>

			<div class="flex flex-col">
				<label for="personality">Personalidade</label>
				<Textarea id="personality" rows="2" v-model="openaiConfig.personality" aria-describedby="personality-help" />
				<small id="personality-help">Digite aqui como você deseja que a IA se comporte.</small>
			</div>
		</div>

		<template #footer>
			<div class="flex justify-end w-full">
				<Button @click="saveConfigs" class="w-[100px]">Salvar</Button>
			</div>
		</template>
	</Panel>
</template>
