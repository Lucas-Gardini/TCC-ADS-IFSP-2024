<script setup lang="ts">
defineProps<{ lista: Record<string, any> }>();
</script>

<template>
	<div>
		<div class="flex flex-col gap-2">
			<div v-for="(value, key) of lista" :key="key" class="flex gap-2">
				<span v-if="!value">Sem dados</span>
				<RenderArray v-else-if="Array.isArray(value)" :lista="value" />
				<RenderObject v-else-if="typeof value === 'object'" :objeto="value" />
				<span v-else>{{ value }}</span>
			</div>
		</div>
	</div>
</template>
