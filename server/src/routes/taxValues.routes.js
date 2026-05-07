import { createCRUD } from "../utils/crudFactory.js";
import { createRoutes } from "../utils/routeFactory.js";
import { TaxValues } from "../models/taxValues.model.js";

const controller = createCRUD(TaxValues, "TaxValues");
export default createRoutes(controller);
