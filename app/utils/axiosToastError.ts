import type { AxiosError } from "axios";
import type { ToastServiceMethods } from "primevue/toastservice";
import type { IServiceResponse } from "semantic-response";

export default function (err: AxiosError, toast: ToastServiceMethods) {
	if (!err) return;

	const data = err?.response?.data as IServiceResponse | undefined;

	if (Array.isArray(data?.message)) {
		return data.message.forEach((message) => {
			console.error(message);
			toast.add({
				severity: "error",
				detail: message,
				summary: "Erro ao realizar a operação",
				life: 5000,
			});
		});
	}

	if (typeof data?.message === "string") {
		return toast.add({
			severity: "error",
			detail: data.message,
			summary: "Erro ao realizar a operação",
			life: 5000,
		});
	}

	if (typeof data?.error?.message === "string") {
		return toast.add({
			severity: "error",
			detail: data.error.message,
			summary: "Erro ao realizar a operação",
			life: 5000,
		});
	}

	toast.add({
		severity: "error",
		detail: "Erro desconhecido",
		summary: "Erro ao realizar a operação",
		life: 5000,
	});
}
