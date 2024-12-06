export enum eTipoDeLogradouro {
	RUA = "rua",
	AVENIDA = "avenida",
	PRACA = "praca",
	TRAVESSA = "travessa",
	RODOVIA = "rodovia",
	ESTRADA = "estrada",
	ALAMEDA = "alameda",
	VILA = "vila",
}

export const tiposDeLogradouro = [
	{ name: "Rua", value: eTipoDeLogradouro.RUA },
	{ name: "Avenida", value: eTipoDeLogradouro.AVENIDA },
	{ name: "Praça", value: eTipoDeLogradouro.PRACA },
	{ name: "Travessa", value: eTipoDeLogradouro.TRAVESSA },
	{ name: "Rodovia", value: eTipoDeLogradouro.RODOVIA },
	{ name: "Estrada", value: eTipoDeLogradouro.ESTRADA },
	{ name: "Alameda", value: eTipoDeLogradouro.ALAMEDA },
	{ name: "Vila", value: eTipoDeLogradouro.VILA },
];

export interface GoogleAuthResponse {
	id: string;
	email: string;
	verified_email: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
}

export interface MicrosoftAuthResponse {
	userPrincipalName: string;
	id: string;
	displayName: string;
	surname: string;
	givenName: string;
	preferredLanguage: string;
	mail: string;
	mobilePhone: string;
	jobTitle: string;
	officeLocation: string;
	businessPhones: string;
	microsoft_access_token: string;
}

export interface CertificateAuthResponse {
	params: string;
	cpfCnpj: string;
	name: string;
	email: string;
	valid: string;
	expired: string;
}

export interface IBancoDeCurriculo {
	_id: string;
	nome: string;
	icone: string;
}

export interface IPasta {
	_id: string;
	nome: string;
	cor: string;
	documentos: Record<string, any>[];
	bancoDeCurriculo?: IBancoDeCurriculo;
	subPastas?: IPasta[];
	atualizadoEm: string;
}

export interface ISubPastaEDocumentos {
	_id?: string;
	nome: string;
	cor?: string;
	documentos?: Record<string, any>[];
	bancoDeCurriculo?: IBancoDeCurriculo;

	tipo: "pasta" | "documento";

	atualizadoEm?: string;
}

export interface ICurriculo {
	nome: string;
	idade?: string;
	empregoOuCargoAtual?: string;
	sobre?: string;
	genero: "Masculino" | "Feminino" | "Não Especificado";
	habilidades?: string[];
	experiencias: Experiencia[];
	formacoes?: FormacaoOuCurso[];
	cursos?: FormacaoOuCurso[];
	contato: Contato;
	objetivo?: string;
	dadosExtras?: Array<{ nome: string; valor: string }>;
	pasta: string;
	documento: string;
}

interface Contato {
	telefones?: string[];
	cidade?: string;
	email?: string;
	redesSociais?: {
		nome: string;
		url: string;
	}[];
}

interface Experiencia {
	tempo: string;
	local: string;
	descricao?: string;
}

interface FormacaoOuCurso {
	instituicao: string;
	nome?: string;
	descricao?: string;
	tempo?: string;
}
