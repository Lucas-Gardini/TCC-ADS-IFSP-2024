<script setup lang="ts">
/** Tipo de formulário ativo na página. */
const formType = ref<"login" | "register">("login");

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
	authStore.validateSession().catch(() => {
		router.push("/acessar");
	});
});

definePageMeta({
	layout: "auth",
});
</script>

<template>
	<div>
		<AuthLoginForm v-if="formType === 'login'" @toggle-form="(form: 'login' | 'register') => (formType = form)" />
		<AuthRegisterForm
			v-else-if="formType === 'register'"
			@toggle-form="(form: 'login' | 'register') => {
				formType = form;
			}"
		/>
	</div>
</template>
