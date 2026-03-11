import 'dotenv/config';
import { runOrchestrator } from "./agent/orchestrator.js";
import chalk from "chalk";

const specFile = process.argv[2];

if (!specFile) {
  console.log(chalk.red("❌ Debes indicar archivo de requerimientos"));
  process.exit(1);
}

console.log(chalk.blue("🚀 Copilot Microservice Agent\n"));

await runOrchestrator(specFile);
