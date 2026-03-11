import { CopilotClient } from "@github/copilot-sdk";
import { analyzeAndDesignSkill } from "../skills/analyzeAndDesignSkill.js";
import { generateMicroserviceSkill } from "../skills/generateMicroserviceSkill.js";
import { repoAgentMCPDirect } from "../subagents/repoAgentMCPDirect.js";
import chalk from "chalk";
import fs from "fs-extra";

const copilot = new CopilotClient({ logLevel: "error" });

export async function runOrchestrator(specPath: string) {
  await copilot.start();

  await fs.emptyDir("./output");

  console.log(chalk.yellow("📋 Analizando y diseñando..."));
  const design = await analyzeAndDesignSkill(copilot, specPath);
  console.log(chalk.green("✓ Diseño listo\n"));

  console.log(chalk.yellow("💻 Generando microservicio..."));
  await generateMicroserviceSkill(copilot, design);
  console.log(chalk.green("✓ Código generado\n"));

  await copilot.stop(); // ✅ importante para no gastar tokens extra

  console.log(chalk.yellow("📦 Subiendo a GitHub..."));
  const repo = await repoAgentMCPDirect();
  console.log(chalk.cyan("🔗 Repo:"), repo.url);

  console.log(chalk.green.bold("\n✅ Proceso completado"));
}
