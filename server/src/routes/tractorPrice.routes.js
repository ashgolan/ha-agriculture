import { createCRUD } from "../utils/crudFactory.js";
import { createRoutes } from "../utils/routeFactory.js";
import { TractorPrice } from "../models/tractorPrice.model.js";

const controller = createCRUD(TractorPrice, "TractorPrice");
export default createRoutes(controller);
