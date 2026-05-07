import { createCRUD } from "../../utils/crudFactory.js";
import { createRoutes } from "../../utils/routeFactory.js";
import { PersonalProductExpenses } from "../../models/personal/personalProductsExpenses.model.js";

export default createRoutes(createCRUD(PersonalProductExpenses, "PersonalProductExpenses"));
