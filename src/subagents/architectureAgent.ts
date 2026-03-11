import type { CopilotClient } from "@github/copilot-sdk";
import chalk from "chalk";

export async function architectureAgent(copilot: CopilotClient, specification: string) {
  const session = await copilot.createSession({
    model: "gpt-4o",
    onPermissionRequest: async () => ({ kind: "approved" }),
    systemMessage: {
      content: `Eres un arquitecto .NET senior.

Diseña la arquitectura de un microservicio en C# con ASP.NET Core.

Responde SOLO con la estructura de carpetas y archivos en formato de lista.
NO incluyas explicaciones largas, solo la estructura.

Formato esperado:
ProjectName.Domain/
  Entities/
    Entity1.cs
    Entity2.cs
  Interfaces/
    IRepository.cs
ProjectName.Application/
  ...

Sé CONCISO.`
    }
  });

  const response = await session.sendAndWait({
    prompt: `Diseña la arquitectura para esta especificación:

${specification}

Responde SOLO con:
1. Nombre del proyecto
2. Estructura de carpetas y archivos (lista simple)
3. Dependencias NuGet principales

Máximo 100 líneas. Sé directo.`
  });

  if (!response) {
    console.log(chalk.red("  ❌ No response from session"));
    return "";
  }

  console.log(chalk.gray("  📊 Response received"));

  return response.data.content || "";
}
