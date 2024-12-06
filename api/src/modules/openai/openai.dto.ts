import { IsArray, IsOptional, IsString, Validate, ValidateNested } from "class-validator";

export class ChatBotDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Validate((value) => value.role === "user" || value.role === "system" || value.role === "assistant", {
		message: "Role deve ser 'user' ou 'system'",
	})
	previousMessages: { role: "user" | "system" | "assistant"; content: string }[];

	@IsString()
	newMessage: string;

	@IsOptional()
	@IsArray()
	files: {
		name: string;
		data: string;
		curriculo: string;
	}[];
}

export class SaveConfigsDto {
	@IsString()
	key: string;

	@IsString()
	personality: string;

	@IsString()
	model: string;
}
