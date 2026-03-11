import type { CopilotClient } from "@github/copilot-sdk";
import { writeFileTool } from "../tools/writeFileTool.js";
import chalk from "chalk";

export async function codeAgent(copilot: CopilotClient, architecture: string) {
  console.log(chalk.gray("  📦 Generando código en múltiples iteraciones...\n"));

  const session = await copilot.createSession({
    model: "gpt-4o",
    onPermissionRequest: async (request) => {
      console.log(chalk.gray("    📝"), request.requestingToolName || "herramienta");
      return { kind: "approved" };
    },
    systemMessage: {
      content: `Eres un desarrollador C# experto en .NET 8.

Genera archivos de código uno por uno usando la herramienta write_file.

IMPORTANTE:
- Genera SOLO los archivos que te pida en cada mensaje
- Usa write_file para cada archivo
- Código completo y funcional
- Sin explicaciones largas, solo genera los archivos`
    },
    tools: [writeFileTool]
  });

  // ITERACIÓN 1: Archivos de proyecto
  console.log(chalk.cyan("  📦 Iteración 1/6: Archivos .csproj"));
  await session.sendAndWait({
    prompt: `Basado en esta arquitectura:
${architecture}

Genera SOLO los archivos .csproj de todos los proyectos (Domain, Application, Infrastructure, API).
Usa write_file para cada uno.`
  });

  // ITERACIÓN 2: Dominio
  console.log(chalk.cyan("  📦 Iteración 2/6: Domain (Entities e Interfaces)"));
  await session.sendAndWait({
    prompt: `Ahora genera SOLO los archivos del proyecto Domain:
- Entities/*.cs
- Interfaces/*.cs

Usa write_file para cada archivo.`
  });

  // ITERACIÓN 3: Application - DTOs
  console.log(chalk.cyan("  📦 Iteración 3/6: Application (DTOs y Validators)"));
  await session.sendAndWait({
    prompt: `Ahora genera SOLO:
- Application/DTOs/*.cs
- Application/Validators/*.cs

Usa write_file para cada archivo.`
  });

  // ITERACIÓN 4: Application - Services
  console.log(chalk.cyan("  📦 Iteración 4/6: Application (Services y Mappings)"));
  await session.sendAndWait({
    prompt: `Ahora genera SOLO:
- Application/Services/*.cs
- Application/Interfaces/*.cs
- Application/Mappings/*.cs

Usa write_file para cada archivo.`
  });

  // ITERACIÓN 5: Infrastructure
  console.log(chalk.cyan("  📦 Iteración 5/6: Infrastructure"));
  await session.sendAndWait({
    prompt: `Ahora genera SOLO los archivos de Infrastructure:
- Infrastructure/Data/AppDbContext.cs
- Infrastructure/Repositories/*.cs
- Infrastructure/UnitOfWork.cs

Usa write_file para cada archivo.`
  });

  // ITERACIÓN 6: API
  console.log(chalk.cyan("  📦 Iteración 6/6: API y configuración"));
  const response = await session.sendAndWait({
    prompt: `Finalmente, genera:
- API/Program.cs
- API/Controllers/*.cs
- API/appsettings.json
- API/appsettings.Development.json
- README.md
- .gitignore

Usa write_file para cada archivo.`
  });

  console.log(chalk.green("  ✓ Todas las iteraciones completadas"));

  if (!response) {
    console.log(chalk.red("  ❌ No response from session"));
    return "";
  }

  return response.data.content || "";
}
