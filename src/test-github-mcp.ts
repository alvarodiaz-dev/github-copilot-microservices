import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

const GH_TOKEN = process.env.GH_TOKEN;

if (!GH_TOKEN) {
  console.error(chalk.red("❌ GH_TOKEN no encontrado en .env"));
  process.exit(1);
}

console.log(chalk.blue("🚀 Subiendo archivos con MCP directo (sin cuota de Copilot)\n"));

async function uploadWithMCP() {
  const outputDir = path.join(process.cwd(), "output");
  
  if (!await fs.pathExists(outputDir)) {
    console.error(chalk.red("❌ No existe ./output/"));
    process.exit(1);
  }

  const files = await getAllFiles(outputDir);
  console.log(chalk.gray(`📁 Archivos a subir: ${files.length}\n`));

  // Crear cliente MCP
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      ...process.env,
      GITHUB_PERSONAL_ACCESS_TOKEN: GH_TOKEN || ""
    }
  });

  const client = new Client({
    name: "github-uploader",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log(chalk.green("✓ Conectado al servidor MCP de GitHub\n"));

  try {
    // Listar herramientas disponibles
    const toolsList = await client.listTools();
    console.log(chalk.cyan("🔧 Herramientas disponibles:"));
    toolsList.tools.forEach((tool: any) => {
      console.log(chalk.gray(`  - ${tool.name}`));
    });
    console.log();

    // Obtener username del token (parseando el token o usando una búsqueda)
    // El token tiene el formato: ghp_... o gho_...
    // Necesitamos obtener el username de otra forma
    
    // Opción 1: Buscar un repo existente para obtener el owner
    console.log(chalk.yellow("🔍 Buscando repositorios para obtener username...\n"));
    
    const searchResult = await client.callTool({
      name: "search_repositories",
      arguments: {
        query: "user:@me",
        per_page: 1
      }
    });

    let username = "unknown";
    
    const searchContent = (searchResult.content as any)[0];
    if (typeof searchContent === 'object' && 'text' in searchContent) {
      try {
        const searchData = JSON.parse(searchContent.text);
        if (searchData.items && searchData.items.length > 0) {
          username = searchData.items[0].owner.login;
        }
      } catch (e) {
        console.log(chalk.yellow("⚠️  No se pudo parsear resultado de búsqueda"));
      }
    }

    // Si no encontramos username, usar el del token o pedir input
    if (username === "unknown") {
      console.log(chalk.yellow("⚠️  No se pudo detectar username automáticamente"));
      console.log(chalk.gray("Ingresa tu username de GitHub manualmente o verifica tu token\n"));
      
      // Alternativa: extraer del token si es posible
      // O simplemente usar un valor por defecto y que falle si es incorrecto
      throw new Error("No se pudo obtener el username. Verifica tu GH_TOKEN.");
    }

    console.log(chalk.green(`✓ Usuario detectado: ${username}\n`));

    // Crear repositorio
    const repoName = `weather-microservice-${Date.now()}`;
    console.log(chalk.yellow(`📦 Creando repositorio: ${repoName}\n`));

    const createRepoResult = await client.callTool({
      name: "create_repository",
      arguments: {
        name: repoName,
        description: "Microservicio de pronóstico del clima en C# con ASP.NET Core",
        private: false,
        auto_init: true // Inicializa con README para crear la rama main
      }
    });

    console.log(chalk.green("✓ Repositorio creado"));
    
    const repoContent = (createRepoResult.content as any)[0];
    if (typeof repoContent === 'object' && 'text' in repoContent) {
      console.log(chalk.gray(repoContent.text.substring(0, 200)));
    }
    console.log();

    // Esperar a que se inicialice el repo
    console.log(chalk.gray("⏳ Esperando inicialización del repositorio...\n"));
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Subir archivos
    console.log(chalk.cyan(`📤 Subiendo ${files.length} archivos...\n`));

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i]!;
      const relativePath = path.relative(outputDir, filePath).replace(/\\/g, '/');
      const content = await fs.readFile(filePath, "utf-8");

      console.log(chalk.gray(`  [${i + 1}/${files.length}]`), relativePath);

      try {
        await client.callTool({
          name: "create_or_update_file",
          arguments: {
            owner: username,
            repo: repoName,
            path: relativePath,
            content: content,
            message: `Add ${relativePath}`,
            branch: "main"
          }
        });

        console.log(chalk.green(`    ✓ Subido`));
      } catch (error: any) {
        console.log(chalk.red(`    ❌ Error: ${error.message}`));
      }

      // Pequeña pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(chalk.green.bold(`\n✅ Proceso completado`));
    console.log(chalk.cyan.bold(`🔗 Repositorio: https://github.com/${username}/${repoName}`));

  } catch (error: any) {
    console.error(chalk.red("\n❌ Error:"), error.message);
    console.error(chalk.gray(error.stack));
  } finally {
    await client.close();
  }
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

uploadWithMCP().catch(console.error);
