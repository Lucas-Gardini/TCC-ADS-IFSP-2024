<script setup lang="ts">
import { DateTime } from "luxon";
import type { ISubPastaEDocumentos } from "~/utils/types";

const props = defineProps<{
	banco: IBancoDeCurriculo;
	pastaPai: IPasta;
	candidatosEncontrados?: {
		ids: {
			_id: string;
			nome: string;
			motivo: string;
			pastaId: string;
		}[];
		motivoFalha: string;
	};
}>();

const emit = defineEmits(["close", "subPastaDoubleClick", "refreshParent", "editarPasta", "selectedTalento"]);

const { $axios, $event } = useNuxtApp();
const modal = useAppModal();
const toast = useToast();

const pastaPaiRefreshed = ref<IPasta>(props.pastaPai);
const data = ref<ISubPastaEDocumentos[]>([]);
const selected = ref([]);

const cm = ref();
const selectedItems = ref<ISubPastaEDocumentos[] | null>(null);
const selectedTalento = ref<{ id: string; nome: string; pastaId?: string }>();

watch(selectedTalento, () => {
	emit("selectedTalento", selectedTalento.value);
});

function mapResult(): ISubPastaEDocumentos[] {
	const subPastas = pastaPaiRefreshed.value.subPastas ?? [];
	const curriculos = pastaPaiRefreshed.value.documentos ?? [];

	const mapped = [] as ISubPastaEDocumentos[];

	for (const subPasta of subPastas) {
		mapped.push({
			_id: subPasta._id,
			nome: "..." + subPasta.nome,
			tipo: "pasta",
			bancoDeCurriculo: props.banco,
			cor: subPasta.cor,
			documentos: subPasta.documentos,
			atualizadoEm: subPasta.atualizadoEm,
		});
	}

	for (const curriculo of curriculos) {
		mapped.push({
			_id: curriculo._id,
			nome: "zzz" + curriculo.nome,
			tipo: "documento",
			bancoDeCurriculo: props.banco,
			cor: curriculo.cor,
			atualizadoEm: curriculo.atualizadoEm,
		});
	}

	return mapped;
}

async function refresh() {
	modal.showSync("loading");

	try {
		const {
			data: { data: result },
		} = await $axios.get(`/banco-de-curriculos/${props.banco._id}/pasta/${props.pastaPai._id}`);
		pastaPaiRefreshed.value = result;

		data.value = mapResult();
	} catch {
		toast.add({
			detail: "Erro ao carregar bancos de currículo",
			summary: "Erro",
			severity: "error",
			life: 5000,
		});
	} finally {
		modal.hide();
	}
}

async function editarItem() {
	if (!selected.value || selected.value.length !== 1) return;

	const item = selected.value[0] as ISubPastaEDocumentos;

	if (item.tipo === "pasta") {
		emit("editarPasta", true, item);
	} else {
		// await router.push(`/app/banco-talentos/talento/${item._id}`);
		selectedTalento.value = { id: item._id!, nome: item.nome };
	}
}

async function excluirItem() {
	if (!selected.value || !selected.value?.length) return;

	const continuar = await modal.showAsync("info", {
		title: "Excluir pasta",
		message: "Deseja realmente excluir a(s) pasta(s) selecionada(s)?",
	});

	if (!continuar) return;

	modal.showSync("loading");

	try {
		await Promise.all(
			selected.value.map((item: ISubPastaEDocumentos) => {
				if (item.tipo === "pasta") {
					let url = `/banco-de-curriculos/${props.banco._id}/pasta/${item._id}`;

					if (props.pastaPai) {
						url += "?idPastaPai=" + props.pastaPai._id;
					}

					try {
						return $axios.delete(url);
					} catch (err: any) {
						axiosToastError(err, toast);
					}
				} else {
					let url = `/banco-de-curriculos/${props.banco._id}/pasta/${props.pastaPai._id}/curriculo/${item._id}`;

					if (props.pastaPai) {
						url += "?idPastaPai=" + props.pastaPai._id;
					}

					try {
						return $axios.delete(url);
					} catch (err: any) {
						axiosToastError(err, toast);
					}
				}
			})
		);

		refresh();
		emit("refreshParent");
	} catch (err: any) {
		axiosToastError(err, toast);
	} finally {
		modal.hide();
	}
}

const onRowContextMenu = (event: any) => {
	selectedItems.value = [event.data] as ISubPastaEDocumentos[];
	cm.value.show(event.originalEvent);
};

watchEffect(() => {
	if (props.banco && props.pastaPai) refresh();
});

onMounted(() => {
	$event.on("deselectTalento", () => {
		selectedTalento.value = undefined;
	});
});
</script>

<template>
	<div v-if="banco && pastaPai">
		<AppTalento
			v-if="selectedTalento"
			:id="selectedTalento.id"
			:id-banco-curriculo="banco._id"
			:id-pasta="selectedTalento.pastaId ?? pastaPai._id"
			@close="selectedTalento = undefined"
		/>

		<ContextMenu
			ref="cm"
			:model="[
				{
					label: 'Editar',
					command: editarItem,
					disabled: selectedItems?.length !== 1,
				},

				{
					label: 'Excluir',
					command: excluirItem,
				},
			]"
			@hide="selectedItems = null"
		/>

		<DataTable
			v-if="!props.candidatosEncontrados"
			:style="`display: ${selectedTalento ? 'none' : 'block'} `"
			v-model:selection="selected"
			:value="data"
			selectionMode="multiple"
			:metaKeySelection="true"
			dataKey="_id"
			tableStyle="min-width: 50rem"
			size="small"
			sort-field="nome"
			:sort-order="1"
			contextMenu
			removable-sort
			@row-contextmenu="onRowContextMenu"
			class="select-none"
			@row-dblclick="
				(e) => (e.data?.tipo === 'pasta' ? $emit('subPastaDoubleClick', e.data) : (selectedTalento = { id: e.data._id, nome: e.data.nome }))
			"
		>
			<template #empty> Nenhum item cadastrado, comece criando um agora mesmo! </template>

			<Column style="width: 20px; text-align: center">
				<template #body="{ data }">
					<Icon
						v-if="data?.documentos?.lengh > 0"
						name="fa6-solid:folder"
						:style="{
							color: data.cor ? `#${data.cor}` : 'black',
						}"
					/>
					<Icon
						v-else-if="data.tipo === 'pasta'"
						name="fa6-solid:folder-open"
						:style="{
							color: data.cor ? `#${data.cor}` : 'black',
						}"
					/>
					<Icon v-else name="fa6-solid:file" />
				</template>
			</Column>

			<Column style="width: 20px; text-align: center" field="documentos">
				<template #body="{ data }">
					<div v-if="data?.documentos">{{ data?.documentos?.length }}x</div>
				</template>
			</Column>

			<Column field="nome" header="Nome" sortable>
				<template #body="{ data }">
					<div>
						{{ data.nome.substring(3) }}
					</div>
				</template>
			</Column>

			<Column style="width: 430px" field="atualizadoEm" header="Última Modificação">
				<template #body="{ data }">
					<div class="font-mono">
						{{ DateTime.fromISO(data.atualizadoEm).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) }}
					</div>
				</template>
			</Column>
		</DataTable>
		<div v-else-if="!selectedTalento">
			<DataTable
				v-if="Number(candidatosEncontrados?.ids?.length) > 0"
				v-model:selection="selected"
				:value="candidatosEncontrados?.ids"
				selectionMode="single"
				:metaKeySelection="true"
				dataKey="_id"
				tableStyle="min-width: 50rem"
				size="small"
				class="select-none"
				@row-dblclick="(e) => (selectedTalento = { id: e.data._id, nome: `zzz${e.data.nome}`, pastaId: e.data.pastaId })"
			>
				<Column style="width: 20px; text-align: center">
					<template #body="{ data }">
						<Icon name="fa6-solid:file" />
					</template>
				</Column>

				<Column field="nome" header="Nome" sortable>
					<template #body="{ data }">
						<div>
							{{ data.nome }}
						</div>
					</template>
				</Column>

				<Column style="width: 430px" field="motivo" header="Motivo">
					<template #body="{ data }">
						<div class="font-mono">
							{{ data.motivo }}
						</div>
					</template>
				</Column>
			</DataTable>
			<div v-else>
				<div class="flex items-center justify-center h-[300px]">
					<div class="flex flex-col items-center gap-2">
						<Icon name="fa6-solid:search" class="text-4xl text-gray-400" />
						<span class="text-gray-400">Nenhum candidato encontrado</span>
						<span class="text-gray-400">{{ candidatosEncontrados?.motivoFalha }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
