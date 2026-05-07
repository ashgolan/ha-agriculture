import { createCRUD } from "../utils/crudFactory.js";
import { createRoutes } from "../utils/routeFactory.js";
import { Client } from "../models/client.model.js";

const controller = createCRUD(Client, "Client");
export default createRoutes(controller);
