<script setup lang="ts">
import { ref } from "vue";

const authStore = useAuthStore();
const dadosEmpresa = ref();

const items = ref([
	{
		label: "Início",
		icon: "fa6-solid:house-chimney",
		to: "/app",
	},
	{
		label: "Banco de Currículos/Talentos",
		icon: "fa6-solid:clipboard-user",
		to: "/app/banco-talentos/bancos",
	},
	{
		label: "Vagas",
		icon: "fa6-solid:briefcase",
		items: [
			{
				label: "Todas",
				icon: "fa6-solid:cart-flatbed-suitcase",
				to: "/app/vagas/todas",
			},
			{
				label: "Em aberto",
				icon: "fa6-solid:folder-open",
				to: "/app/vagas/abertas",
			},
			{
				label: "Fechadas",
				icon: "fa6-solid:folder-closed",
				to: "/app/vagas/fechadas",
			},
		],
	},
	{
		label: "Configurações",
		icon: "fa6-solid:gear",
		to: "/app/configuracoes",
	},
]);

const modal = useAppModal();
onMounted(() => {
	modal.showSync("loading");
	authStore
		.getDadosEmpresa()
		.then((res) => (dadosEmpresa.value = res))
		.finally(() => modal.hide());
});
</script>

<template>
	<div class="sticky top-0 z-50 card">
		<Menubar :model="items">
			<template #start>
				<div class="flex items-center h-full gap-2">
					<NuxtLink to="/" class="flex items-center">
						<NuxtImg src="/images/logo.png" alt="Image" class="h-[32px] my-auto" />
					</NuxtLink>
				</div>
			</template>
			<template #item="{ item, props, hasSubmenu, root }">
				<a v-ripple class="flex items-center" v-bind="props.action">
					<NuxtLink :to="item.to" class="flex items-center w-full">
						<Icon :name="item.icon!" class="mr-2" />
						<span class="ml-2">{{ item.label }}</span>
						<Icon v-if="hasSubmenu" :name="root ? 'fa6-solid:angle-down' : 'fa6-solid:angle-up'" class="ml-2" />
					</NuxtLink>
				</a>
			</template>

			<template #end>
				<div class="flex items-center gap-2">
					<span class="hidden sm:flex">{{ dadosEmpresa?.data?.nomeFantasia }} |</span>

					<div class="flex flex-row items-center justify-center">
						<span class="hidden sm:flex">{{ authStore.userData?.nomeExibicao }}</span>
						<Icon v-tooltip.bottom="'Sair'" name="fa6-solid:door-open" class="mx-2 cursor-pointer" @click="authStore.logout" />
					</div>
				</div>
			</template>
		</Menubar>
	</div>
</template>
