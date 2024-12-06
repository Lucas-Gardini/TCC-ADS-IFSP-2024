<script setup lang="ts">
import { Settings } from "luxon";

Settings.defaultLocale = "pt-BR";
Settings.defaultZone = "America/Sao_Paulo";
</script>

<template>
	<NuxtLayout>
		<AppModal />
		<Toast position="bottom-right" />

		<Suspense>
			<NuxtPage></NuxtPage>
		</Suspense>
	</NuxtLayout>
</template>
1
