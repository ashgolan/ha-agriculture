import { createCRUD } from "../utils/crudFactory.js";
import { createRoutes } from "../utils/routeFactory.js";
import { Bid } from "../models/bid.model.js";

const controller = createCRUD(Bid, "Bid");
export default createRoutes(controller);
