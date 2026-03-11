import type { CopilotClient } from "@github/copilot-sdk";
import { readSpecTool } from "../tools/readSpecTool.js";
import chalk from "chalk";

export async function specificationAgent(copilot: CopilotClient, path: string) {
  const session = await copilot.createSession({
    model: "gpt-4o",
    onPermissionRequest: async (request) => {
      console.log(chalk.cyan("  🔧 Tool llamada:"), request.tool);
      return { kind: "approved" };
    },
    systemMessage: {
      content: `Eres un analista de software senior.

Analiza el documento de requerimientos y extrae:
- Funcionalidades principales
- Entidades del dominio
- Endpoints REST
- Requisitos técnicos

Usa read_specification para leer el archivo.
Responde de forma CONCISA (máximo 50 líneas).`
    },
    tools: [readSpecTool]
  });

  const response = await session.sendAndWait({
    prompt: `Lee y analiza: ${path}

Usa read_specification y proporciona un análisis BREVE y estructurado.`
  });

  if (!response) {
    console.log(chalk.red("  ❌ No response from session"));
    return "";
  }

  console.log(chalk.gray("  📊 Response received"));

  return response.data.content || "";
}
