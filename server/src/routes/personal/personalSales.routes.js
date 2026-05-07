import { createCRUD } from "../../utils/crudFactory.js";
import { createRoutes } from "../../utils/routeFactory.js";
import { PersonalSale } from "../../models/personal/personalSales.model.js";

export default createRoutes(createCRUD(PersonalSale, "PersonalSale"));
