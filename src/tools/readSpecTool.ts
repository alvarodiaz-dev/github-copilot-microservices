import { defineTool } from "@github/copilot-sdk";
import fs from "fs/promises";
import chalk from "chalk";

export const readSpecTool = defineTool("read_specification", {
  description: "Lee un archivo de especificación técnica desde el sistema de archivos",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Ruta del archivo de especificación"
      }
    },
    required: ["path"]
  },
  handler: async ({ path }: { path: string }) => {
    try {
      console.log(chalk.gray(`    📖 Leyendo archivo: ${path}`));
      const content = await fs.readFile(path, "utf-8");
      console.log(chalk.green(`    ✓ Archivo leído (${content.length} caracteres)`));
      return content;
    } catch (error: any) {
      console.error(chalk.red(`    ❌ Error leyendo archivo: ${error.message}`));
      throw error;
    }
  }
});
