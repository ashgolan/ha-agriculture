import { createCRUD } from "../utils/crudFactory.js";
import { createRoutes } from "../utils/routeFactory.js";
import { Sale } from "../models/sale.model.js";

const controller = createCRUD(Sale, "Sale");
export default createRoutes(controller);
