export default function convertQueryStringToObject(queryString: string): Record<string, string> {
	const queryObject: Record<string, string> = {};
	const queryArray = queryString.split("&");
	queryArray.forEach((query) => {
		const [key, value] = query.split("=");
		queryObject[key] = value;
	});
	return queryObject;
}
