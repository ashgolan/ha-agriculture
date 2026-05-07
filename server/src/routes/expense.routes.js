import { createCRUD } from "../utils/crudFactory.js";
import { createRoutes } from "../utils/routeFactory.js";
import { Expense } from "../models/expenses.model.js";

const controller = createCRUD(Expense, "Expense");
export default createRoutes(controller);
