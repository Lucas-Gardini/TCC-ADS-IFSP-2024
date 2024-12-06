<script setup lang="tsx">
import { DateTime } from "luxon";
import ColorPicker from "primevue/colorpicker";
import InputText from "primevue/inputtext";
import { Buffer } from "buffer";
import SelectButton from "primevue/selectbutton";

const InputTextComponent = InputText as any;
const ColorPickerComponent = ColorPicker as any;
const SelectButtonComponent = SelectButton as any;

const { $axios } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const modal = useAppModal();

const cm = ref();

const banco = ref<IBancoDeCurriculo | null>(null);
const pastas = ref<IPasta[]>([]);
const selectedPastas = ref<IPasta[] | null>(null);

const isSubPastaOpen = ref<IPasta | null>();
const pastaAberta = ref<IPasta | null>(null);
const selectedTalento = ref<{ id: string; nome: string; pastaId?: string }>();

function deselectTalento() {
	const { $event } = useNuxtApp();

	$event.emit("deselectTalento");
}

const breadcrumb = computed(() => {
	const defaultMenu = [
		{ label: "Bancos de Currículos", url: "javascript:void(0)", command: () => router.push("/app/banco-talentos/bancos") },
		{
			label: `${banco.value?.icone} ${banco.value?.nome}`,
			command: () => ((pastaAberta.value = null), (candidatosEncontrados.value = undefined)),
		},
	];

	if (pastaAberta.value) {
		if (isSubPastaOpen.value) {
			const links = [
				...defaultMenu,
				{
					label: `📁 ${isSubPastaOpen.value?.nome}`,
					command: () => ((pastaAberta.value = isSubPastaOpen.value!), (isSubPastaOpen.value = null), deselectTalento()),
				},
				{
					label: `📁 ${pastaAberta.value?.nome.substring(3)}`,
					command: () => (deselectTalento(), (candidatosEncontrados.value = undefined)),
				},
			];

			if (selectedTalento.value) {
				if (selectedTalento.value?.pastaId) {
					links.push({
						label: `...`,
						command: () => {},
					});
				}

				links.push({
					label: `📄 ${selectedTalento.value.nome.substring(3)}`,
					command: () => {},
				});
			}

			return links;
		}

		const links = [
			...defaultMenu,
			{ label: `📁 ${pastaAberta.value?.nome}`, command: () => (deselectTalento(), (candidatosEncontrados.value = undefined)) },
		];

		if (selectedTalento.value) {
			if (selectedTalento.value?.pastaId) {
				links.push({
					label: `...`,
					command: () => {},
				});
			}

			links.push({
				label: `📄 ${selectedTalento.value.nome.substring(3)}`,
				command: () => {},
			});
		}

		return links;
	}

	return defaultMenu;
});

async function startup(refreshSelected = true) {
	modal.showSync("loading");

	try {
		let { data } = await $axios.get("banco-de-curriculos/" + route.params.id);
		banco.value = data.data;

		({ data } = await $axios.get("banco-de-curriculos/" + route.params.id + "/pasta"));
		pastas.value = data.data;

		if (pastaAberta.value && refreshSelected) pastaAberta.value = pastas.value.find((p) => p._id === pastaAberta.value?._id)!;
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

async function novaPasta(editar = false, customPasta?: IPasta) {
	if (customPasta) selectedPastas.value = [{ ...customPasta, nome: customPasta.nome.substring(3) }];

	// Se tiver uma pasta selecionada, cria uma subpasta
	let pastaPai = null;
	if (!editar && (selectedPastas.value?.length === 1 || pastaAberta.value)) {
		const criarSubpasta = await modal.showAsync("info", {
			title: `Criar subpasta`,
			message: `Você está prestes a criar uma subpasta de ${selectedPastas.value?.[0]?.nome ?? pastaAberta.value?.nome}.`,
		});

		if (!criarSubpasta) {
			selectedPastas.value = null;
			return novaPasta();
		}

		pastaPai = selectedPastas.value?.[0]?._id ?? pastaAberta.value?._id;
	}

	const nomePasta = ref(editar ? selectedPastas.value?.[0].nome : "");
	const corPasta = ref(editar ? selectedPastas.value?.[0].cor : "#000");
	const id = selectedPastas.value?.[0]?._id;
	const pasta = await modal.showAsync("info", {
		title: editar ? "Editar Pasta" : "Nova pasta",

		customContent: () => (
			<div class="flex flex-col gap-5">
				<div class="flex flex-col flex-1 gap-2">
					<label for="cp-hex" class="block font-bold">
						Nome da Pasta
					</label>
					<InputTextComponent v-model={nomePasta.value} label="Nome da pasta" />
				</div>
				<div class="flex flex-row items-center flex-1 gap-2">
					<label for="cp-hex" class="block font-bold">
						Cor da Pasta:
					</label>
					<ColorPickerComponent v-model={corPasta.value} inputId="cp-hex" format="hex" />
				</div>
			</div>
		),
	});

	if (!pasta || !nomePasta) return;

	modal.showSync("loading");

	try {
		if (editar) {
			await $axios.put("banco-de-curriculos/" + route.params.id + "/pasta/" + id, {
				nome: nomePasta.value,
				cor: corPasta.value || null,
				pastaPai,
			});
		} else {
			await $axios.post("banco-de-curriculos/" + route.params.id + "/pasta", { nome: nomePasta.value, cor: corPasta.value || null, pastaPai });
		}

		await startup();
	} catch (err: any) {
		axiosToastError(err, toast);
	} finally {
		modal.hide();
	}
}

async function addFile() {
	if (!pastaAberta.value) return;

	const inputComponent: HTMLInputElement = document.createElement("input");
	inputComponent.type = "file";
	inputComponent.accept = ".pdf,.txt";
	inputComponent.multiple = true;
	inputComponent.click();

	inputComponent.onchange = async (e) => {
		const files = inputComponent.files as any;
		const filesData = (await Promise.all(
			Array.from(files).map(async (file: any) => {
				const reader = new FileReader();
				reader.readAsArrayBuffer(file);
				return new Promise((resolve) => {
					reader.onload = async () => {
						resolve({
							name: file.name,
							buffer: reader.result as ArrayBuffer,
						});
					};
				});
			})
		)) as Array<{ name: string; buffer: ArrayBuffer; dados?: Record<string, any> }>;

		const obterDadosAutomaticamente = await modal.showAsync("info", {
			title: "Obter dados automaticamente",
			message: "Deseja extrair os dados dos currículos com inteligência artifical?",
			buttons: [{ label: "Sim" }, { label: "Não" }],
		});

		// Inicia o timer
		console.time("Extrair dados");

		if (!obterDadosAutomaticamente) {
			for (const file of filesData) {
				const nome = ref();
				const genero = ref("Não Especificado");

				const canContinue = await modal.showAsync("info", {
					title: "Dados do currículo",
					customContent: () => (
						<div class="flex flex-col gap-5">
							<div class="flex flex-col flex-1 gap-2">
								<label for="cp-hex" class="block font-bold">
									Nome do candidato(a)
								</label>
								<InputTextComponent v-model={nome.value} />
							</div>

							<div class="flex flex-col flex-1 gap-2">
								<label for="cp-hex" class="block font-bold">
									Gênero
								</label>
								<SelectButtonComponent v-model={genero.value} options={["Masculino", "Feminino", "Outros", "Não Especificado"]} />
							</div>
						</div>
					),
				});

				if (!canContinue) {
					selectedPastas.value = null;
					return;
				}

				file.dados = {
					perfil: {
						nome: nome.value,
						genero: genero.value,
					},
					contato: {},
					experiencias: [],
				};
			}
		} else {
			modal.showSync("loading");

			const processarBloco = async (bloco: typeof filesData) => {
				return Promise.all(
					bloco.map(async (file) => {
						const formData = new FormData();
						formData.append("curriculo", new Blob([file.buffer]));

						const { data } = await $axios.post("/banco-de-curriculos/curriculo/extrair", formData, {
							headers: {
								"Content-Type": "multipart/form-data",
							},
						});

						file.dados = data.data;
					})
				);
			};

			const dividirEmBlocos = (arr: typeof filesData, tamanho: number) => {
				const blocos: (typeof filesData)[] = [];
				for (let i = 0; i < arr.length; i += tamanho) {
					blocos.push(arr.slice(i, i + tamanho));
				}
				return blocos;
			};

			const blocos = dividirEmBlocos(filesData, 10);

			for (const bloco of blocos) await processarBloco(bloco);

			modal.hide();
		}

		modal.showSync("loading");

		try {
			await Promise.all(
				filesData.map((file) => {
					let url = "banco-de-curriculos/" + route.params.id + "/pasta/" + pastaAberta.value!._id + "/curriculo";

					if (isSubPastaOpen.value) url += "?idPastaPai=" + isSubPastaOpen.value!._id;

					return $axios.post(url, {
						...file.dados,
						...file.dados?.perfil,
						documento: Buffer.from(file.buffer).toString("base64"),
					});
				})
			);

			if (isSubPastaOpen.value) {
				await startup(false);

				const { data } = await $axios.get("banco-de-curriculos/" + route.params.id + "/pasta/" + pastaAberta.value!._id);
				pastaAberta.value = {
					...data.data,
					...data.data.pasta,
					nome: "..." + data.data.pasta.nome,
				};
			} else {
				await startup();
			}
		} catch (err: any) {
			console.error(err);
			axiosToastError(err, toast);
		} finally {
			console.timeEnd("Extrair dados");
			modal.hide();
		}
	};
}

async function excluirPasta() {
	if (!selectedPastas || !selectedPastas.value?.length) return;

	const selected = [...selectedPastas.value];

	const continuar = await modal.showAsync("info", {
		title: "Excluir pasta",
		message: "Deseja realmente excluir a(s) pasta(s) selecionada(s)?",
	});

	if (!continuar) return;

	modal.showSync("loading");

	try {
		await Promise.all(selected.map((pasta) => $axios.delete("banco-de-curriculos/" + route.params.id + "/pasta/" + pasta._id)));
		await startup();
	} catch (err: any) {
		axiosToastError(err, toast);
	} finally {
		modal.hide();
	}
}

const candidatosEncontrados = ref<{
	ids: {
		_id: string;
		nome: string;
		motivo: string;
		pastaId: string;
	}[];
	motivoFalha: string;
}>();
async function buscarCandidato() {
	if (!pastaAberta.value) return;
	if (candidatosEncontrados.value) return (candidatosEncontrados.value = undefined);

	try {
		const busca = await modal.showAsync("info", {
			title: "Buscar candidato(a) ideal",
			// message: "Digite o nome do candidato(a) que deseja buscar",
			input: {
				label: "Descrição da vaga",
				placeholder: "ex: Candidato com mais de 2 anos de experiência em ...",
				required: true,
				validateFunction: (v: string) => (v.length < 30 ? "A descrição da vaga deve ter no mínimo 30 caracteres" : undefined),
				textarea: true,
			},
		});

		if (!busca) return;

		modal.showSync("loading");

		console.time("Buscar candidatos");
		const { data } = await $axios.get(`/banco-de-curriculos/curriculo/buscar-candidato/${banco.value?._id}/${pastaAberta.value._id}`, {
			params: { busca },
		});
		console.timeEnd("Buscar candidatos");

		candidatosEncontrados.value = data.data;
	} catch (err: any) {
		axiosToastError(err, toast);
	} finally {
		modal.hide();
	}
}

const onRowContextMenu = (event: any) => {
	selectedPastas.value = [event.data];
	cm.value.show(event.originalEvent);
};

watch(pastaAberta, () => {
	if (!pastaAberta.value) startup();
});

onMounted(startup);
</script>

<template>
	<Panel class="container mx-auto">
		<template v-if="banco" #header>
			<Breadcrumb :model="breadcrumb" />
		</template>

		<Toolbar v-if="!selectedTalento" class="mb-6">
			<template v-if="!candidatosEncontrados" #start>
				<Button v-if="!isSubPastaOpen" class="mr-2" @click="() => novaPasta()">
					<Icon name="fa6-solid:plus" />
					Nova Pasta
				</Button>
				<Button v-if="pastaAberta" severity="info" outlined class="mr-2" @click="() => addFile()">
					<Icon name="fa6-solid:upload" />
					Adicionar Arquivo
				</Button>
				<Button
					v-if="!isSubPastaOpen && !pastaAberta"
					class="flex gap-2 w-[100px]"
					icon="pi pi-trash"
					severity="danger"
					outlined
					@click="excluirPasta"
					:disabled="!selectedPastas || !selectedPastas.length"
				>
					<Icon name="fa6-solid:trash" />
					Excluir
				</Button>
			</template>

			<template #end>
				<Button v-if="pastaAberta" :severity="candidatosEncontrados ? 'danger' : 'info'" outlined class="mr-2" @click="buscarCandidato">
					<Icon v-if="!candidatosEncontrados" name="fa6-solid:magnifying-glass" />
					<Icon v-else name="fa6-solid:x" />
					{{ !candidatosEncontrados ? "Buscar candidato(a) ideal" : "Cancelar Busca" }}
				</Button>
			</template>
		</Toolbar>

		<ContextMenu
			ref="cm"
			:model="[
				{
					label: 'Editar',
					command: () => novaPasta(true),
					disabled: selectedPastas?.length !== 1,
				},

				{
					label: 'Excluir',
					command: excluirPasta,
				},
			]"
			@hide="selectedPastas = null"
		/>

		<div v-if="!pastaAberta && !candidatosEncontrados">
			<DataTable
				v-model:selection="selectedPastas"
				:value="pastas"
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
				@row-dblclick="(e) => (pastaAberta = e.data)"
			>
				<template #empty> Nenhuma pasta de currículos cadastrada, comece criando uma agora mesmo! </template>

				<Column style="width: 20px; text-align: center">
					<template #body="{ data }">
						<Icon
							v-if="data.documentos.lengh > 0 || data.subPastas.length > 0"
							name="fa6-solid:folder"
							:style="{
								color: data.cor ? `#${data.cor}` : 'black',
							}"
						/>
						<Icon
							v-else
							name="fa6-solid:folder-open"
							:style="{
								color: data.cor ? `#${data.cor}` : 'black',
							}"
						/>
					</template>
				</Column>

				<Column style="width: 20px; text-align: center" field="documentos">
					<template #body="{ data }"> {{ data.documentos.length }}x </template>
				</Column>

				<Column field="nome" header="Nome" sortable> </Column>

				<Column style="width: 430px" field="atualizadoEm" header="Última Modificação">
					<template #body="{ data }">
						<div class="font-mono">
							{{ DateTime.fromISO(data.atualizadoEm).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) }}
						</div>
					</template>
				</Column>
			</DataTable>
		</div>
		<div>
			<AppSubPastasCurriculos
				:banco="banco!"
				:pasta-pai="pastaAberta!"
				:candidatosEncontrados="candidatosEncontrados"
				@close="pastaAberta = null"
				@refreshParent="startup"
				@subPastaDoubleClick="(p) => ((isSubPastaOpen = { ...pastaAberta! }), (pastaAberta = p))"
				@editarPasta="novaPasta"
				@selectedTalento="selectedTalento = $event"
			/>
		</div>
	</Panel>
</template>
