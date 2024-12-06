import { Global, Module } from "@nestjs/common";
import { GridFsService } from "./gridfs.service";

/**
 * Módulo responsável pela integração com o GridFS do MongoDB.
 *
 * O GridFS é um sistema de arquivos para armazenar arquivos grandes em MongoDB.
 * Este módulo fornece um serviço para interagir com o GridFS, permitindo o upload, download e gerenciamento de arquivos.
 */
@Global()
@Module({
	providers: [GridFsService], // Fornece o serviço GridFsService para ser usado em outros módulos.
	exports: [GridFsService], // Exporta o serviço GridFsService para que possa ser injetado em outros módulos.
})
export class GridfsModule {}
