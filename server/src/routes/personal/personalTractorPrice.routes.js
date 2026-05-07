import { createCRUD } from "../../utils/crudFactory.js";
import { createRoutes } from "../../utils/routeFactory.js";
import { PersonalTractorPrice } from "../../models/personal/personalTractorPrice.model.js";

export default createRoutes(createCRUD(PersonalTractorPrice, "PersonalTractorPrice"));
