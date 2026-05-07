import { createCRUD } from "../../utils/crudFactory.js";
import { createRoutes } from "../../utils/routeFactory.js";
import { PersonalInvestment } from "../../models/personal/personalInvestments.model.js";

export default createRoutes(createCRUD(PersonalInvestment, "PersonalInvestment"));
