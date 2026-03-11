import type { CopilotClient } from "@github/copilot-sdk";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

export async function repoAgent(copilot: CopilotClient, projectInfo: string) {
  const outputDir = path.join(process.cwd(), "output");
  const filesExist = await fs.pathExists(outputDir);
  
  if (!filesExist) {
    throw new Error("❌ No se encontraron archivos generados en ./output/");
  }

  const allFiles = await getAllFiles(outputDir);
  console.log(chalk.gray(`  📁 Total de archivos: ${allFiles.length}`));

  // Leer contenido de archivos
  const filesWithContent = await Promise.all(
    allFiles.map(async (filePath) => {
      const relativePath = path.relative(outputDir, filePath);
      const content = await fs.readFile(filePath, "utf-8");
      return { path: relativePath, content };
    })
  );

  const session = await copilot.createSession({
    model: "gpt-4o",
    onPermissionRequest: async (request) => {
      console.log(chalk.cyan("  🔧"), request.tool);
      return { kind: "approved" };
    },
    systemMessage: {
      content: `Eres un agente DevOps especializado en GitHub.

Usa las herramientas del servidor MCP de GitHub para:
1. Crear un repositorio público
2. Subir todos los archivos proporcionados

Sé directo y eficiente.`
    },
    mcpServers: {
      github: {
        type: "local",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        tools: ["*"],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GH_TOKEN || process.env.COPILOT_API_KEY || ""
        }
      }
    }
  });

  // Crear lista compacta de archivos
  const fileList = filesWithContent.map(f => f.path).join("\n");

  const response = await session.sendAndWait({
    prompt: `Crea un repositorio en GitHub y sube estos archivos:

**Repositorio:**
- Nombre: dotnet-microservice-weather
- Descripción: Microservicio en C# con ASP.NET Core
- Público: true

**Archivos (${filesWithContent.length}):**
${fileList}

**Instrucciones:**
1. Usa create_repository para crear el repo
2. Usa create_or_update_file para subir cada archivo
3. Proporciona la URL del repositorio

Los archivos están en: ${outputDir}

Comienza ahora. Sé eficiente.`
  });

  if (!response) {
    console.log(chalk.red("  ❌ No response from session"));
    return {
      content: "",
      url: null
    };
  }

  const content = response.data.content || "";
  console.log(chalk.gray("  📄 Respuesta:"), content.substring(0, 200) + "...");

  return {
    content: content,
    url: extractRepoUrl(content)
  };
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

function extractRepoUrl(content: string): string | null {
  const urlMatch = content.match(/https:\/\/github\.com\/[^\s)]+/);
  return urlMatch ? urlMatch[0] : null;
}
