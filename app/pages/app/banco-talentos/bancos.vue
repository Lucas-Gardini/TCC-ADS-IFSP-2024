<script setup lang="tsx">
import { ref, computed, onMounted } from "vue";
import { useNuxtApp, useRouter, useToast, useAppModal } from "#imports";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { DateTime } from "luxon";
import InputText from "primevue/inputtext";

const InputTextComponent = InputText as any;

const { $axios } = useNuxtApp();
const router = useRouter();
const toast = useToast();
const modal = useAppModal();

const cm = ref();

const bancos = ref<Array<IBancoDeCurriculo & { metadata: { pastas: number; curriculos: number } }>>([]);
const selectedBancos = ref<IBancoDeCurriculo[] | null>([]);
const search = ref("");

const breadcrumb = computed(() => {
	return [{ label: "Bancos de Currículos", url: "javascript:void(0)", command: () => router.push("/app/banco-talentos/bancos") }];
});

const searchResults = computed(() => {
	if (!search.value) return bancos.value;
	return bancos.value.filter((banco) => banco.nome.toLowerCase().includes(search.value.toLowerCase()));
});

async function getBancosDeCurriculo() {
	try {
		const { data } = await $axios.get("banco-de-curriculos");
		bancos.value = data.data;
	} catch {
		toast.add({
			detail: "Erro ao carregar bancos de currículo",
			summary: "Erro",
			severity: "error",
			life: 5000,
		});
	}
}

async function cadastrarBancoDeCurriculo(editar = false) {
	const id = selectedBancos.value?.[0]?._id;

	const banco: string[] = await modal.showAsync("info", {
		title: "Cadastrar banco de currículos",
		input: { label: "Nome do banco", required: true, value: editar ? selectedBancos.value?.[0].nome : "" },
		emojiPicker: selectedBancos.value?.[0]?.icone ?? true,
	});

	try {
		if (!banco) return;
		modal.showSync("loading");

		if (editar) {
			await $axios.put(`banco-de-curriculos/${id}`, { nome: banco[1], icone: banco[0] });
		} else {
			await $axios.post("banco-de-curriculos", { nome: banco[1], icone: banco[0] });
		}

		toast.add({
			detail: "Banco de currículos cadastrado com sucesso",
			summary: "Sucesso",
			severity: "success",
			life: 5000,
		});
		await getBancosDeCurriculo();
	} finally {
		modal.hide();
	}
}

async function excluirBancos() {
	if (!selectedBancos.value || !selectedBancos.value.length) return;

	const confirm = await modal.showAsync("info", {
		title: "Excluir banco de currículos",
		message: "Tem certeza que deseja excluir o(s) banco(s) de currículos selecionado(s)?",
	});

	if (!confirm) return;

	modal.showSync("loading");

	try {
		await Promise.all(selectedBancos.value.map((banco) => $axios.delete(`banco-de-curriculos/${banco._id}`)));
		toast.add({
			detail: "Banco de currículos excluído com sucesso",
			summary: "Sucesso",
			severity: "success",
			life: 5000,
		});
		await getBancosDeCurriculo();
	} finally {
		modal.hide();
	}
}

const onRowContextMenu = (event: any) => {
	selectedBancos.value = [event.data];
	cm.value.show(event.originalEvent);
};

onMounted(() => {
	modal.showSync("loading");
	getBancosDeCurriculo().finally(() => modal.hide());
});
</script>

<template>
	<Panel class="container mx-auto">
		<template v-if="bancos.length" #header>
			<Breadcrumb :model="breadcrumb" />
		</template>

		<Toolbar class="mb-6">
			<template #start>
				<Button class="mr-2" @click="() => cadastrarBancoDeCurriculo()"> <Icon name="fa6-solid:plus" /> Novo banco </Button>
				<Button
					class="flex gap-2 w-[100px]"
					severity="danger"
					outlined
					@click="excluirBancos"
					:disabled="!selectedBancos || !selectedBancos.length"
				>
					<Icon name="fa6-solid:trash" />
					Excluir
				</Button>
			</template>

			<template #end>
				<IconField>
					<InputIcon>
						<Icon name="fa6-solid:magnifying-glass" />
					</InputIcon>
					<InputTextComponent id="search" v-model="search" aria-describedby="search-help" />
				</IconField>
			</template>
		</Toolbar>

		<ContextMenu
			ref="cm"
			:model="[
				{
					label: 'Editar',
					command: () => cadastrarBancoDeCurriculo(true),
					disabled: selectedBancos?.length !== 1,
				},

				{
					label: 'Excluir',
					command: excluirBancos,
				},
			]"
			@hide="selectedBancos = null"
		/>

		<DataTable
			v-model:selection="selectedBancos"
			:value="searchResults"
			selectionMode="multiple"
			:metaKeySelection="true"
			dataKey="_id"
			tableStyle="min-width: 50rem"
			size="small"
			contextMenu
			@row-contextmenu="onRowContextMenu"
			class="select-none"
			@row-dblclick="(e) => router.push(`/app/banco-talentos/banco/${e.data._id}`)"
		>
			<template #empty> Nenhum banco de currículos cadastrado, comece criando um agora mesmo! </template>

			<Column style="width: 20px; text-align: center">
				<template #body="{ data }">
					<span>{{ data.icone }}</span>
				</template>
			</Column>

			<Column field="nome" header="Nome" sortable> </Column>

			<!-- <Column header="Pastas/Currículos" :body="({ metadata }) => `${metadata.pastas} pastas / ${metadata.curriculos} currículos`" /> -->
			<Column field="atualizadoEm" header="Última Modificação">
				<template #body="{ data }">
					<div class="font-mono">
						{{ DateTime.fromISO(data.atualizadoEm).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) }}
					</div>
				</template>
			</Column>
		</DataTable>
	</Panel>
</template>

<style lang="scss">
.child-full-height {
	& > div {
		height: 100%;
		& > div {
			height: 100%;
		}
	}
}
</style>
