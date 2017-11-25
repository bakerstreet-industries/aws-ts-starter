import { Container } from "inversify";
import { MODULE_TYPES } from "./models";
import { IModuleRepo, ModuleRepo } from "./repos";
import { IModuleService, ModuleService } from "./services";

let container = new Container();
container.bind<IModuleRepo>(MODULE_TYPES.IModuleRepo).to(ModuleRepo);
container.bind<IModuleService>(MODULE_TYPES.IModuleService).to(ModuleService);

export default container;