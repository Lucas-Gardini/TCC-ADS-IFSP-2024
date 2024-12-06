<script setup lang="tsx">
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { DateTime } from "luxon";

interface IChatData {
	who: "user" | "assistant" | "loading";
	message: string;
	time: string;
	extraData?: any;
	files?: { name: string; data: string }[];
}

const menu = ref(null);
const toast = useToast();
const modal = useAppModal();

const messageToSend = ref<string>("");
const filesToSend = ref<Array<{ name: string; data: string; curriculo: boolean }>>([]);
const chatData = ref<Array<IChatData>>([]);
const sendingMessage = ref<boolean>(false);

async function getPDFsAndTextFiles() {
	const inputComponent: HTMLInputElement = document.createElement("input");
	inputComponent.type = "file";
	inputComponent.accept = ".pdf,.txt";
	inputComponent.multiple = true;
	inputComponent.click();

	inputComponent.onchange = async (e) => {
		const curriculo = (await modal.showAsync("info", {
			title: "Os arquivos selecionados são currículos?",
		})) as boolean;

		const files = inputComponent.files as any;
		const filesData = (await Promise.all(
			Array.from(files).map(async (file: any) => {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				return new Promise((resolve) => {
					reader.onload = () =>
						resolve({
							name: file.name,
							data: reader.result as string,
							curriculo,
						});
				});
			})
		)) as Array<{ name: string; data: string; curriculo: boolean }>;

		filesToSend.value.push(...filesData);
	};
}

const { $axios } = useNuxtApp();
async function sendMessage() {
	const messageQuantity = chatData.value.reduce((acc, m) => (m.who === "user" ? acc + 1 : acc), 0);
	if (messageQuantity >= 20) return;
	if (!messageToSend.value) return;
	sendingMessage.value = true;

	chatData.value.push({
		who: "user",
		message: messageToSend.value,
		time: DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" }),
		files: filesToSend.value,
	});

	const message = messageToSend.value;
	const files = filesToSend.value;

	messageToSend.value = "";
	filesToSend.value = [];

	try {
		function getExtraData(m: Record<string, any> | null) {
			if (m && m?.extraData) {
				if (Array.isArray(m.extraData) && m.extraData.length === 0) return null;
				else if (JSON.stringify(m.extraData) === "{}") return null;
				else return JSON.stringify(m.extraData);
			}

			return null;
		}

		const { data } = await $axios.post("openai/chat-bot", {
			previousMessages: chatData.value.map((m) => ({
				role: m.who,
				content: m.message + (getExtraData(m) ?? ""),
			})),
			newMessage: message,
			files: files,
		});

		if (data.data) {
			const message = data.data.resposta;
			const curriculos = data.data.curriculos;
			chatData.value.push({
				who: "assistant",
				message: message,
				extraData: curriculos,
				time: DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" }),
			});
		}

		// Verifica o máximo de mensagens
		if (messageQuantity >= 19) {
			chatData.value.push({
				who: "assistant",
				message:
					"Nossa, conversamos bastante! Infelizmente minha memória é limitada e não consigo mais lembrar de tudo que conversamos. 😅\nVamos recomeçar?",
				time: DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" }),
			});
		}
	} finally {
		sendingMessage.value = false;
	}
}

const nowHourMinutesSeconds = DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" });
function resetChat() {
	chatData.value = [];

	toast.add({
		severity: "success",
		summary: "Conversa resetada",
		detail: "A conversa com a CloudIA foi resetada com sucesso.",
		life: 3000,
	});
}
</script>

<template>
	<div class="card">
		<ClientOnly>
			<Panel toggleable>
				<template #header>
					<div class="flex items-center gap-2">
						<!-- <Avatar image="images/cloudia.png" size="large" shape="circle" /> -->
						<span class="font-bold">Conversar com a CloudIA</span>
					</div>
				</template>
				<template #footer>
					<div class="flex flex-wrap items-center justify-between gap-4">
						<a class="mr-auto underline cursor-pointer text-surface-500 dark:text-surface-400">
							{{ chatData.reduce((acc, m) => (m.who === "user" ? acc + 1 : acc), 0) }} / 20 mensagens
						</a>

						<a @click="resetChat" class="ml-auto underline cursor-pointer text-surface-500 dark:text-surface-400">Resetar conversa</a>
					</div>
				</template>

				<AppChatBubble
					side="left"
					name="CloudIA"
					:hour="nowHourMinutesSeconds"
					message="Olá! Tudo bem? Me chamo CloudIA e estou aqui para te ajudar com qualquer dúvida que você tiver do mundo do RH, tanto nas áreas de recrutamento e seleção, quanto nas áreas de treinamento e desenvolvimento. 😊"
				/>

				<div v-for="(message, i) of chatData" :key="i">
					<AppChatBubble
						:side="message.who === 'user' ? 'right' : 'left'"
						:name="message.who === 'user' ? 'Você' : 'CloudIA'"
						:hour="message.time"
						:message="message.message"
						:files="message.files"
						:extraData="message.extraData"
					/>
				</div>

				<AppChatBubble
					v-if="sendingMessage"
					side="left"
					name="CloudIA"
					:hour="nowHourMinutesSeconds"
					message="Como posso te ajudar hoje?"
					:loading="sendingMessage"
				/>

				<div>
					<Divider />

					<div class="flex flex-wrap gap-2">
						<div v-for="(file, i) of filesToSend" :key="i" class="flex items-center gap-2 m-2 rounded-lg chat-bubble">
							<Icon name="fa6-solid:file" />
							<span>{{ file.name }}</span>

							<Icon name="fa6-solid:x" @click="filesToSend.splice(i, 1)" class="cursor-pointer" />
						</div>
					</div>

					<IconField>
						<InputIcon>
							<Icon
								v-tooltip.bottom="'Anexar Arquivo'"
								@click="getPDFsAndTextFiles"
								name="fa6-solid:paperclip"
								class="cursor-pointer"
							/>
						</InputIcon>
						<InputText v-model="messageToSend" @keypress.enter="sendMessage" fluid placeholder="Digite uma mensagem..." />
						<InputIcon>
							<Icon @click="sendMessage" v-tooltip.bottom="'Enviar'" name="fa6-solid:paper-plane" class="cursor-pointer" />
						</InputIcon>
					</IconField>
				</div>
			</Panel>
		</ClientOnly>
	</div>
</template>
