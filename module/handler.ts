import { wrapFunction } from "../utils/wrapper"
import * as main from "./main"

export const post = wrapFunction(main.post);
export const get = wrapFunction(main.get);
//export const list = wrapFunction(handlers.list);
export const del = wrapFunction(main.del);
export const put = wrapFunction(main.put);