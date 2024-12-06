<script setup lang="ts">
const appConfig = useAppConfig();
const authStore = useAuthStore();
const appModal = useAppModal();
const router = useRouter();

/**
 * Valida a sessão do usuário ao montar o componente e exibe um modal de carregamento durante o processo.
 *
 * @remarks
 * Se a validação da sessão falhar, o usuário é redirecionado para a página de acesso. O modal de carregamento é ocultado após a validação.
 */
onMounted(() => {
	appModal.showSync("loading");

	authStore
		.validateSession()
		.catch(() => {
			router.push("/acessar");
		})
		.finally(() => {
			appModal.hide();
		});
});

useHead({
	title: `${appConfig.appName} | Acesso`,
});
</script>

<template>
	<main>
		<ClientOnly>
			<AppNavBar />
		</ClientOnly>
		<div class="m-5">
			<slot />
		</div>
	</main>
</template>
