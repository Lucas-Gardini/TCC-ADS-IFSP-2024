<script setup lang="ts">
const appConfig = useAppConfig();

useHead({
	title: `${appConfig.appName} | Acesso`,
});
</script>

<template>
	<main class="flex items-center justify-center w-screen min-h-screen py-10">
		<slot />
	</main>
</template>
