import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";

@Module({
  imports: [AuthModule, CatalogModule],
})
export class AppModule {}
