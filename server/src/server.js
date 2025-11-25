import { buildApp } from "./app.js";
import { config } from "./config/env.js";

const app = buildApp();

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
