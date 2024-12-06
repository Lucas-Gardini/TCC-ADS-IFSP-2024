/**
 * Enumeração que define os diferentes tipos de permissões disponíveis para usuários.
 */
export enum ePermissao {
	/**
	 * Permissão para usuários com acesso total e controle completo sobre o sistema.
	 * Geralmente reservado para administradores principais ou usuários com privilégios especiais.
	 */
	MASTER = "MASTER",

	/**
	 * Permissão para usuários que prestam suporte, com acesso a funcionalidades relacionadas ao suporte e assistência.
	 */
	SUPORTE = "SUPORTE",

	/**
	 * Permissão para administradores de empresas, com acesso para gerenciar e configurar a empresa.
	 */
	ADMIN = "ADMIN",

	/**
	 * Permissão para usuários regulares com acesso básico ao sistema.
	 */
	USUARIO = "USUARIO",
}
