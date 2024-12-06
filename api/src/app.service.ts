import { Injectable } from "@nestjs/common";
import { AuthService } from "./modules/auth/auth.service";
import { EmpresaService } from "./modules/empresas/empresas.service";

@Injectable()
export class AppService {
	/**
	 * Cria uma instância de `AppService`.
	 * @param authService - Serviço de autenticação para gerenciar usuários.
	 * @param empresasService - Serviço de empresas para gerenciar os registros de empresas.
	 */
	constructor(
		private authService: AuthService,
		private empresasService: EmpresaService,
	) {}
}
