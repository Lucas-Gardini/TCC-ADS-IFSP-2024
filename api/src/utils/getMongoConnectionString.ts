/**
 * Retorna a string de conexão do MongoDB a partir das variáveis de ambiente.
 * Monta a URL de conexão do MongoDB considerando a autenticação e outras opções de configuração.
 *
 * @returns Um objeto contendo a URL de conexão do MongoDB com a senha desmascarada e uma versão com a senha mascarada.
 */
export function getMongoConnectionString() {
	// Obtém as variáveis de ambiente necessárias para construir a URL de conexão
	const user = process.env.MONGO_USER;
	const pwd = process.env.MONGO_PASS;
	const host = process.env.MONGO_HOST;
	const port = process.env.MONGO_PORT;
	const data = process.env.MONGO_DATA;

	// Parâmetros adicionais para a conexão com o MongoDB
	const params = "retryWrites=true&authSource=admin&w=majority&readPreference=primary";

	// Inicializa a URL de conexão
	let url = `mongodb://`;

	// Adiciona credenciais, se fornecidas
	if (user && pwd) url += `${user}:********@`;

	// Adiciona o host e a porta, se fornecidos
	url += `${host}`;
	if (port) url += `:${port}`;

	// Adiciona o nome do banco de dados, se fornecido
	if (data) url += `/${data}`;

	// Adiciona os parâmetros de conexão
	url += `?${params}`;

	// Retorna a URL com a senha desmascarada e a URL com a senha mascarada
	return {
		url: url.replace("********", encodeURIComponent(pwd)),
		masked: url,
	};
}
