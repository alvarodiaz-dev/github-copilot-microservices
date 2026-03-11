import { defineTool } from "@github/copilot-sdk";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

export const writeFileTool = defineTool("write_file", {
  description: "Escribe un archivo de código en el sistema de archivos dentro del directorio output/",
  parameters: {
    type: "object",
    properties: {
      filename: { 
        type: "string",
        description: "Ruta relativa del archivo (ej: 'API/Program.cs')"
      },
      content: { 
        type: "string",
        description: "Contenido completo del archivo"
      }
    },
    required: ["filename", "content"]
  },
  handler: async ({ filename, content }: { filename: string; content: string }) => {
    try {
      const outputPath = path.join(process.cwd(), "output", filename);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, content, "utf-8");
      
      console.log(chalk.green(`    ✓ Archivo creado: ${filename} (${content.length} bytes)`));
      
      return `Archivo ${filename} creado exitosamente`;
    } catch (error: any) {
      console.error(chalk.red(`    ❌ Error escribiendo ${filename}: ${error.message}`));
      throw error;
    }
  }
});
