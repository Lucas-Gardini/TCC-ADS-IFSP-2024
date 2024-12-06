import type { ButtonProps } from "primevue/button";
import type { JSX } from "vue/jsx-runtime";

/**
 * Tipos de estados que o modal pode exibir.
 */
export type LoadingModalType = "none" | "loading" | "success" | "error" | "warning" | "info";

/**
 * Interface que define os dados e a configuração do modal.
 */
export interface IModalData {
	/** Tipo de estado do modal. */
	type: LoadingModalType;
	/** Título opcional do modal. */
	title?: string;
	/** Mensagem opcional a ser exibida no modal. */
	message?: string;
	/** Mostra o picker de emoji (o emoji pode ser pré-selecionado ao ser passado como string) */
	emojiPicker?: boolean | string;

	/** Dados do input opcional, se houver. */
	input?: {
		/** Rótulo do input. */
		label: string;
		/** Valor inicial do input. */
		value?: string;
		/** Tipo do input (e.g., "text", "password"). */
		type?: string;
		/** Texto do placeholder do input. */
		placeholder?: string;
		/** Indica se o input é obrigatório. */
		required?: boolean;
		/** Indica se o input é um textarea. */
		textarea?: boolean;
		/** Função de validação opcional para o valor do input. */
		validateFunction?: (value: string) => string | null | undefined;
	};

	/** Função opcional para renderizar um cabeçalho personalizado para o modal. */
	customHeader?: () => JSX.Element;
	/** Função opcional para renderizar o conteúdo personalizado do modal. */
	customContent?: () => JSX.Element;
	/** Função opcional para renderizar o rodapé personalizado do modal. */
	customFooter?: () => JSX.Element;

	/** Botões opcionais a serem exibidos no modal. */
	buttons?: { label?: string; severity?: ButtonProps["severity"] }[];

	/** Função de callback opcional que é chamada quando um botão é acionado. */
	callback?: (action: any) => void;
}

/**
 * Hook que fornece o estado do modal.
 *
 * @returns Estado reativo do modal.
 */
export default function () {
	const state = useState<IModalData>("appmodal", () => ({ type: "none" }));
	function showAsync<T>(type: IModalData["type"], modal: Omit<IModalData, "callback" | "type"> = {}) {
		return new Promise((resolve) => {
			state.value = {
				...modal,
				type,
				callback: resolve as any,
			};
		}) as Promise<T>;
	}

	function showSync(type: IModalData["type"], modal: Omit<IModalData, "callback" | "type"> = {}, callback?: IModalData["callback"]) {
		state.value = {
			...modal,
			type,
			callback,
		};
	}

	function hide() {
		state.value = { type: "none" };
	}

	return { state, showSync, showAsync, hide };
}
