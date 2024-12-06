<script setup lang="ts">
import showndown from "showdown";

const converter = new showndown.Converter({
	simplifiedAutoLink: true,
	strikethrough: true,
	tables: true,
	tasklists: true,
	emoji: true,
	simpleLineBreaks: true,
});

defineProps<{
	side: "left" | "right";
	name: string;
	message: string;
	hour: string;
	extraData?: {
		pdf: string;
		data: Record<string, any>;
	}[];
	loading?: boolean;
	files?: Array<{ name: string; data: string }>;
}>();

function getColumnsFromExtraData(pdfData: Record<string, any>) {
	if (!pdfData) return [];
	return Object.keys(pdfData).map((key) => ({
		field: key,
		header: key,
	}));
}

function parseTitle(title: string) {
	const convert = {
		coes: "ções",
		encias: "ências",
	};

	let replaced = title.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

	for (const key in convert) {
		if (replaced.includes(key)) replaced = replaced.replace(key, (convert as any)[key]);
	}

	return replaced;
}
</script>

<template>
	<div>
		<div :class="`chat ${side === 'left' ? 'chat-start' : 'chat-end'}`">
			<div class="flex text-center place-items-center chat-image avatar">
				<Avatar v-if="side === 'left'" image="images/cloudia.png" size="large" shape="circle" />
				<Avatar v-else size="large" shape="circle" style="display: flex !important">
					<template #icon>
						<Icon name="fa6-solid:user" />
					</template>
				</Avatar>
			</div>
			<div v-if="!loading" class="chat-header">
				{{ name }}
				<time class="text-xs opacity-50">{{ hour }}</time>
			</div>
			<div v-else class="chat-bubble">
				<Icon name="eos-icons:three-dots-loading" size="24" />
			</div>
			<!-- <div v-if="!loading" class="chat-bubble">{{ message }}</div> -->
			<span v-if="!loading" class="chat-bubble" v-html="converter.makeHtml(message)"></span>

			<div v-if="files" class="flex flex-wrap gap-2">
				<div v-for="(file, i) of files" :key="i" class="flex items-center gap-2 m-2 rounded-lg">
					<Icon name="fa6-solid:file" />
					<span>{{ file.name }}</span>
				</div>
			</div>
		</div>
		<div v-for="pdf of extraData" :key="pdf.pdf" class="flex flex-col gap-5 mt-2">
			<h2>Detalhes do arquivo: {{ pdf.pdf }}</h2>

			<Card v-for="(column, i) of getColumnsFromExtraData(pdf.data)" :key="i" class="card-slate">
				<template #title>{{ parseTitle(column.header) }}</template>
				<template #content>
					<p class="p-2 m-0 rounded-sm">
						<span v-if="!pdf.data[column.field]">Sem dados</span>
						<RenderArray v-else-if="Array.isArray(pdf.data[column.field])" :lista="pdf.data[column.field]" />
						<RenderObject v-else-if="typeof pdf.data[column.field] === 'object'" :objeto="pdf.data[column.field]" />
						<span v-else>{{ pdf.data[column.field] }}</span>
					</p>
				</template>
			</Card>
			<!-- <Column v-for="(column, i) of getColumnsFromExtraData(pdf.data)" :key="i" :field="column.field" :header="column.header"></Column> -->
		</div>
	</div>
</template>

<style lang="scss">
.card-slate > .p-card-body {
	background-color: rgb(226 232 240);
}
</style>
