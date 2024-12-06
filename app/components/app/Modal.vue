<script setup lang="ts">
import EmojiPicker, { type EmojiExt } from "vue3-emoji-picker";
// import success from "~/assets/lottie/success.json";
// import loading from "~/assets/lottie/loading.json";
// import error from "~/assets/lottie/error.json";
// import info from "~/assets/lottie/info.json";
// import warning from "~/assets/lottie/warning.json";

// import { Vue3Lottie } from "vue3-lottie";

// Configurações do modal
const modal = useAppModal(); // Hook para acessar o modal
const visible = ref(false); // Controle de visibilidade do modal
const iconData = computed(() => getIcon()); // Dados do ícone do modal

// Dados do input
const input = ref(""); // Valor do input do modal
const inputError = ref(""); // Mensagem de erro do input
const selectedEmoji = ref<EmojiExt>(); // Emoji selecionado

// Observa mudanças no tipo de modal para atualizar a visibilidade e o valor do input
watchEffect(() => {
	if (modal.state.value.type !== "none") {
		visible.value = true;
		selectedEmoji.value = undefined;

		if (modal.state.value.input) {
			input.value = modal.state.value.input.value ?? "";
			inputError.value = "";
		}

		if (typeof modal.state.value.emojiPicker === "string") selectedEmoji.value = { i: modal.state.value.emojiPicker } as EmojiExt;
	} else {
		visible.value = false;
	}
});

/**
 * Retorna o ícone correspondente ao tipo de modal.
 */
function getIcon(): { icon: string } {
	switch (modal.state.value.type) {
		case "loading":
			// return { data: loading, loop: true };
			return { icon: "svg-spinners:180-ring-with-bg" };
		case "success":
			// return { data: success, loop: false };
			return { icon: "line-md:check-all" };
		case "error":
			// return { data: error, loop: false };
			return { icon: "line-md:close-small" };
		case "info":
			// return { data: info, loop: false };
			return { icon: "line-md:bell" };
		case "warning":
			// return { data: warning, loop: false };
			return { icon: "line-md:alert" };
	}

	return { icon: "" };
}

/**
 * Oculta o modal e dispara o evento de callback com base na confirmação do usuário.
 *
 * @param confirm - Indica se o usuário confirmou a ação.
 */
function hideModalAndDispatchEvent(confirm: boolean) {
	if (modal.state.value.callback) {
		if (!confirm) {
			modal.state.value.callback(confirm);
		} else {
			if (modal.state.value.input) {
				if (validateInputError()) return; // Verifica erros de validação do input
			}

			if (selectedEmoji.value) {
				modal.state.value.callback([selectedEmoji.value?.i, input.value]);
				return;
			}

			modal.state.value.callback(modal.state.value.input ? input.value : confirm);
		}
	}

	visible.value = false;
}

/**
 * Valida o valor do input usando a função de validação fornecida no modal.
 *
 * @returns `true` se houver erro de validação, `false` caso contrário.
 */
function validateInputError() {
	if (modal.state.value.input?.validateFunction) {
		const error = modal.state.value.input.validateFunction(input.value);
		if (error) {
			inputError.value = error;
			return true;
		}
	}

	inputError.value = "";
	return false;
}
</script>

<template>
	<ClientOnly>
		<Dialog
			v-model:visible="visible"
			:closable="modal.state.value.type !== 'loading'"
			modal
			:header="modal.state.value.title"
			:show-header="!!modal.state.value.title"
			:style="{ width: modal.state.value.type === 'loading' ? '200px' : '400px' }"
			:content-style="{ padding: '1rem' }"
			:draggable="false"
		>
			<template #header>
				<div v-if="!modal.state.value.customHeader" class="flex flex-row justify-start">
					<Icon :name="iconData?.icon" class="w-[24px] h-[24px] mr-2" />
					<span class="font-bold translate-y-[1.5px]">{{ modal.state.value.title }}</span>
				</div>
				<component v-else :is="modal.state.value.customHeader"></component>
			</template>

			<div v-if="!modal.state.value.customContent" class="w-full">
				<span v-if="modal.state.value.message" class="block mb-8 text-surface-500 dark:text-surface-400">{{
					modal.state.value.message
				}}</span>

				<div v-if="modal.state.value.type === 'loading'" class="flex items-center justify-center w-full">
					<Icon name="svg-spinners:180-ring-with-bg" class="w-[100px] h-[100px] mx-auto" />
				</div>

				<form v-if="modal.state.value.input" class="grid w-full gap-5">
					<div class="mb-3 input-group">
						<label for="input" class="block mb-2 font-medium text-gray-900">
							{{ modal.state.value.input.label }} <span v-if="modal.state.value.input.required" class="text-red-500">*</span>
						</label>

						<Password
							v-if="modal.state.value.input.type === 'password'"
							id="password-input"
							v-model="input"
							fluid
							:feedback="false"
							toggleMask
							autocomplete="current-password"
							:placeholder="modal.state.value.input.placeholder"
							@blur="validateInputError"
						/>
						<Textarea
							v-else-if="modal.state.value.input.textarea"
							v-model="input"
							id="input"
							fluid
							:placeholder="modal.state.value.input.placeholder"
							@blur="validateInputError"
							rows="4"
						/>
						<InputText
							v-else
							v-model="input"
							id="input"
							fluid
							:placeholder="modal.state.value.input.placeholder"
							:type="modal.state.value.input.type ?? 'text'"
							@blur="validateInputError"
						/>

						<small id="input-help" class="text-red-500">
							{{ inputError }}
						</small>
					</div>
				</form>
			</div>
			<component v-else :is="modal.state.value.customContent"></component>

			<div v-if="modal.state.value.emojiPicker">
				<span class="block mb-2 font-medium text-gray-900"
					>Selecione um emoji <span v-if="selectedEmoji">(Selecionado: {{ selectedEmoji.i }})</span></span
				>
				<EmojiPicker
					:native="true"
					@select="(e) => (selectedEmoji = e)"
					style="margin-left: 0 !important; margin-right: 0 !important; width: 100%"
				/>
			</div>

			<template v-if="modal.state.value.type !== 'loading'" #footer>
				<div v-if="modal.state.value.callback && !modal.state.value.customFooter">
					<Button
						:label="modal.state.value?.buttons?.[1]?.label ?? 'Cancelar'"
						text
						:severity="modal.state.value?.buttons?.[1]?.severity ?? 'secondary'"
						@click="hideModalAndDispatchEvent(false)"
					/>
					<Button
						:label="modal.state.value?.buttons?.[0]?.label ?? 'Confirmar'"
						:severity="modal.state.value?.buttons?.[0]?.severity"
						@click="hideModalAndDispatchEvent(true)"
						autofocus
					/>
				</div>
				<component v-else :is="modal.state.value.customFooter"></component>
			</template>
		</Dialog>
	</ClientOnly>
</template>
