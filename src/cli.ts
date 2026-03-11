import 'dotenv/config';
import { runOrchestrator } from "./agent/orchestrator.js";
import chalk from "chalk";

const specFile = process.argv[2];

if (!specFile) {
  console.log(chalk.red("❌ Error: No se proporcionó archivo de especificación"));
  console.log(chalk.yellow("Uso correcto:"));
  console.log(chalk.cyan("  npx tsx ./src/cli.ts requerimientos.md"));
  process.exit(1);
}

console.log(chalk.blue("🚀 Iniciando Copilot Microservice Agent"));
console.log(chalk.gray(`📄 Archivo de especificación: ${specFile}\n`));

try {
  await runOrchestrator(specFile);
} catch (error) {
  console.error(chalk.red("❌ Error fatal:"), error);
  process.exit(1);
}
