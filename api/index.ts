import "dotenv/config";
import serverless from "serverless-http";
import { createApiApp } from "../server/_core/app";

const app = createApiApp();

export default serverless(app);
