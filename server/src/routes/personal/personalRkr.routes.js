import { createCRUD } from "../../utils/crudFactory.js";
import { createRoutes } from "../../utils/routeFactory.js";
import { PersonalRkrExpenses } from "../../models/personal/personalRkrExpenses.model.js";

export default createRoutes(createCRUD(PersonalRkrExpenses, "PersonalRkrExpenses"));
