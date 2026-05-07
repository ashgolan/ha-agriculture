import { createCRUD } from "../../utils/crudFactory.js";
import { createRoutes } from "../../utils/routeFactory.js";
import { Workers } from "../../models/personal/personalWorkers.model.js";

export default createRoutes(createCRUD(Workers, "Workers"));
