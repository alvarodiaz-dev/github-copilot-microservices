import { CopilotClient } from "@github/copilot-sdk";
import { specificationAgent } from "../subagents/specificationAgent.js";
import { architectureAgent } from "../subagents/architectureAgent.js";
import { codeAgent } from "../subagents/codeAgent.js";
import { repoAgent } from "../subagents/repoAgent.js";
import chalk from "chalk";

const copilot = new CopilotClient({ 
    logLevel: "debug" // Cambiado de "all" a "debug" para mejor visibilidad
});

export async function runOrchestrator(specPath: string) {
  await copilot.start();
  console.log(chalk.green("✓ Copilot Client iniciado\n"));

  // PASO 1: Análisis de especificación
  console.log(chalk.yellow("📋 PASO 1/4: Analizando especificación..."));
  const spec = await specificationAgent(copilot, specPath);
  console.log(chalk.green("✓ Especificación analizada"));
  console.log(chalk.gray("Resultado:"), spec.substring(0, 200) + "...\n");

  // PASO 2: Diseño de arquitectura
  console.log(chalk.yellow("🏗️  PASO 2/4: Diseñando arquitectura..."));
  const architecture = await architectureAgent(copilot, spec);
  console.log(chalk.green("✓ Arquitectura diseñada"));
  console.log(chalk.gray("Resultado:"), architecture.substring(0, 200) + "...\n");

  // PASO 3: Generación de código
  console.log(chalk.yellow("💻 PASO 3/4: Generando código..."));
  const codeResult = await codeAgent(copilot, architecture);
  console.log(chalk.green("✓ Código generado"));
  console.log(chalk.gray("Archivos creados en ./output/\n"));

  // PASO 4: Creación de repositorio
  console.log(chalk.yellow("📦 PASO 4/4: Creando repositorio en GitHub..."));
  const repoResult = await repoAgent(copilot, codeResult);
  console.log(chalk.green("✓ Repositorio creado exitosamente"));
  console.log(chalk.cyan("🔗 URL del repositorio:"), repoResult.url || "Ver respuesta completa arriba\n");

  console.log(chalk.green.bold("✅ Sistema finalizado exitosamente"));

  await copilot.stop();
}
