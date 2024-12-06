<script setup lang="ts">
defineProps<{ objeto: Record<string, any> }>();

function parseTitle(title: string) {
	return title.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-2">
			<div v-for="(value, key) of Object.entries(objeto)" :key="key" class="flex gap-2">
				<span class="font-semibold">{{ parseTitle(value[0]) }}</span>
				<span v-if="!value[1]">Sem dados</span>
				<RenderArray v-else-if="Array.isArray(value[1])" :lista="value[1]" />
				<RenderObject v-else-if="typeof value[1] === 'object'" :objeto="value[1]" />
				<span v-else>{{ value[1] }}</span>
			</div>
		</div>
	</div>
</template>
