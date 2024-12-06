import { isValidCPF, isValidCNPJ, formatCPF, formatCNPJ } from "@brazilian-utils/brazilian-utils";

export default function formatCpfCnpj(cpfCnpj: string): string {
	if (isValidCPF(cpfCnpj)) return formatCPF(cpfCnpj);

	if (isValidCNPJ(cpfCnpj)) return formatCNPJ(cpfCnpj);

	return cpfCnpj;
}
