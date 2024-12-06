<template>
	<div v-if="curriculo" class="curriculo">
		<!-- Dados Pessoais -->
		<Card>
			<template #title>
				<div class="flex flex-col">
					<label>Nome</label>
					<InputText v-model="curriculo.nome" placeholder="Nome Completo" />
				</div>
			</template>
			<template #content>
				<div class="flex flex-col gap-2">
					<div class="flex flex-col">
						<label>Idade</label>
						<InputText v-model="curriculo.idade" placeholder="Idade" />
					</div>

					<div class="flex flex-col">
						<label>Gênero</label>
						<SelectButton v-model="curriculo.genero" :options="['Masculino', 'Feminino', 'Outros', 'Não Especificado']" />
					</div>

					<div class="flex flex-col">
						<label>Cargo Atual</label>
						<InputText v-model="curriculo.empregoOuCargoAtual" placeholder="Cargo Atual" />
					</div>

					<div class="flex flex-col">
						<label>Sobre</label>
						<TextArea v-model="curriculo.sobre" placeholder="Sobre você" rows="4" />
					</div>

					<div class="flex flex-col">
						<label>Objetivo</label>
						<TextArea v-model="curriculo.objetivo" placeholder="Objetivo" rows="2" />
					</div>
				</div>
			</template>
		</Card>

		<!-- Contato -->
		<Card>
			<template #title>Contato</template>
			<template #content>
				<div class="flex flex-col gap-2">
					<label>Cidade</label>
					<InputText v-model="curriculo.contato!.cidade" placeholder="Cidade" />
				</div>
				<div class="flex flex-col gap-2 mt-2 mb-2">
					<label>Email</label>
					<InputText v-model="curriculo.contato!.email" placeholder="Email" />
				</div>
				<label>Redes</label>
				<div class="flex flex-row flex-wrap gap-2 mt-2">
					<div v-for="(rede, i) in curriculo.contato!.redesSociais" :key="i" class="flex flex-row items-center gap-2">
						<InputGroup>
							<InputText fluid v-model="rede.nome" placeholder="Nome da Rede Social" />
							<InputText fluid v-model="rede.url" placeholder="Link da Rede Social" />
							<Button @click="curriculo.contato!.redesSociais!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
					</div>
					<Button class="w-[250px]" @click="curriculo.contato!.redesSociais!.push({ nome: '', url: '' })"> Adicionar Rede Social </Button>
				</div>
			</template>
		</Card>

		<!-- Telefones -->
		<Card>
			<template #title>Telefones</template>
			<template #content>
				<div class="flex flex-row flex-wrap gap-2">
					<div v-for="(telefone, i) in curriculo.contato!.telefones" :key="i" class="flex flex-row items-center gap-2">
						<InputGroup>
							<InputText v-model="curriculo.contato!.telefones![i]" placeholder="Número de Telefone" />
							<Button @click="curriculo.contato!.telefones!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
					</div>
					<Button class="w-[250px]" @click="curriculo.contato!.telefones!.push('')"> Adicionar Telefone </Button>
				</div>
			</template>
		</Card>

		<!-- Habilidades -->
		<Card>
			<template #title>Habilidades</template>
			<template #content>
				<div class="flex flex-row flex-wrap gap-2">
					<div v-for="(_, i) in curriculo.habilidades" :key="i">
						<InputGroup>
							<InputText fluid v-model="curriculo.habilidades![i]" placeholder="Habilidade" />
							<Button @click="curriculo.habilidades!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
					</div>
					<Button class="w-[250px]" @click="curriculo.habilidades!.push('')"> Adicionar Habilidade </Button>
				</div>
			</template>
		</Card>

		<!-- Experiências -->
		<Card>
			<template #title>Experiências</template>
			<template #content>
				<div class="flex flex-col flex-wrap gap-2">
					<div v-for="(exp, i) in curriculo.experiencias" :key="i" class="flex flex-row items-center gap-2">
						<InputGroup>
							<InputText fluid v-model="exp.local" placeholder="Local de Trabalho" />
							<InputText fluid v-model="exp.tempo" placeholder="Duração" />
							<Button @click="curriculo.experiencias!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
						<div class="flex flex-col">
							<label>Descrição</label>
							<TextArea class="w-[400px]" v-model="exp.descricao" rows="2" placeholder="Descrição do Curso" />
						</div>
					</div>
					<Button class="w-[250px] mt-2" @click="curriculo.experiencias!.push({ local: '', descricao: '', tempo: '' })">
						Adicionar Experiência
					</Button>
				</div>
			</template>
		</Card>

		<!-- Formação Acadêmica -->
		<Card>
			<template #title>Formação Acadêmica</template>
			<template #content>
				<div class="flex flex-col flex-wrap gap-2">
					<div v-for="(formacao, i) in curriculo.formacoes" :key="i" class="flex flex-row items-center gap-2">
						<InputGroup>
							<InputText fluid v-model="formacao.instituicao" placeholder="Instituição" />
							<InputText fluid v-model="formacao.nome" placeholder="Nome do Curso" />
							<InputText fluid v-model="formacao.tempo" placeholder="Duração" />
							<Button @click="curriculo.formacoes!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
						<div class="flex flex-col">
							<label>Descrição</label>
							<TextArea class="w-[400px]" v-model="formacao.descricao" rows="2" placeholder="Descrição do Curso" />
						</div>
					</div>
					<Button class="w-[250px] mt-2" @click="curriculo.formacoes!.push({ instituicao: '', nome: '', descricao: '', tempo: '' })">
						Adicionar Formação
					</Button>
				</div>
			</template>
		</Card>

		<!-- Cursos -->
		<Card>
			<template #title>Cursos/Certificados</template>
			<template #content>
				<div class="flex flex-col flex-wrap gap-2">
					<div v-for="(curso, i) in curriculo.cursos" :key="i" class="flex flex-row items-center gap-2">
						<InputGroup>
							<InputText fluid v-model="curso.instituicao" placeholder="Instituição" />
							<InputText fluid v-model="curso.nome" placeholder="Nome" />
							<InputText fluid v-model="curso.tempo" placeholder="Duração" />

							<Button @click="curriculo.experiencias!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
						<div class="flex flex-col">
							<label>Descrição</label>
							<TextArea class="w-[400px]" v-model="curso.descricao" rows="2" placeholder="Descrição do Curso" />
						</div>
					</div>
					<Button class="w-[250px] mt-2" @click="curriculo.cursos!.push({ instituicao: '', nome: '', descricao: '', tempo: '' })">
						Adicionar Curso/Certificado
					</Button>
				</div>
			</template>
		</Card>

		<!-- Dados Extras -->
		<Card>
			<template #title>Dados Extras</template>
			<template #content>
				<div class="flex flex-col flex-wrap gap-2">
					<div v-for="(extra, i) in curriculo.dadosExtras" :key="i" class="flex flex-row items-center gap-2">
						<InputGroup>
							<InputText fluid v-model="extra.nome" placeholder="Nome do Dado" />
							<InputText fluid v-model="extra.valor" placeholder="Valor do Dado" />
							<Button @click="curriculo.dadosExtras!.splice(i, 1)">
								<Icon name="fa6-solid:x" />
							</Button>
						</InputGroup>
					</div>
					<Button class="w-[250px]" @click="curriculo.dadosExtras!.push({ nome: '', valor: '' })"> Adicionar Dado Extra </Button>
				</div>
			</template>
		</Card>

		<!-- Ações -->
		<div class="flex justify-between w-full">
			<Button severity="danger" @click="excluir">Excluir</Button>

			<div class="flex flex-row gap-2">
				<Button severity="secondary" @click="cancelar">Cancelar</Button>
				<Button severity="success" @click="salvar">Salvar</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{ idBancoCurriculo: string; idPasta: string; id: string }>();
const emit = defineEmits(["close"]);
const { $axios } = useNuxtApp();
const modal = useAppModal();
const toast = useToast();
const curriculo = ref<Partial<ICurriculo> | null>({
	habilidades: [],
	formacoes: [],
	experiencias: [],
	contato: {
		redesSociais: [],
		telefones: [],
	},
	dadosExtras: [],
});

async function startup() {
	modal.showAsync("loading");
	try {
		const response = await $axios.get(`/banco-de-curriculos/${props.idBancoCurriculo}/pasta/${props.idPasta}/curriculo/${props.id}`);
		curriculo.value = response.data.data;
	} catch (error: any) {
		console.error(error);
		axiosToastError(error, toast);
	} finally {
		modal.hide();
	}
}

async function cancelar() {
	startup();
}

async function salvar() {
	modal.showSync("loading");
	try {
		await $axios.put(`/banco-de-curriculos/${props.idBancoCurriculo}/pasta/${props.idPasta}/curriculo/${props.id}`, curriculo.value);
		toast.add({ severity: "success", summary: "Sucesso", detail: "Currículo salvo com sucesso", life: 5000 });
	} catch (error: any) {
		console.error(error);
		axiosToastError(error, toast);
	} finally {
		modal.hide();
	}
}

async function excluir() {
	modal.showSync("loading");
	try {
		await $axios.delete(`/banco-de-curriculos/${props.idBancoCurriculo}/pasta/${props.idPasta}/curriculo/${props.id}`);
		toast.add({ severity: "success", summary: "Sucesso", detail: "Currículo excluído com sucesso", life: 5000 });
		emit("close");
	} catch (error: any) {
		console.error(error);
		axiosToastError(error, toast);
	} finally {
		modal.hide();
	}
}

onMounted(() => {
	startup();
});
</script>

<style scoped>
.curriculo {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
</style>
