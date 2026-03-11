import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs-extra";
import path from "path";

export async function repoAgentMCPDirect() {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error("GH_TOKEN missing");

  const outputDir = path.join(process.cwd(), "output");

  const files = await getAllFiles(outputDir);

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      ...process.env,
      GITHUB_PERSONAL_ACCESS_TOKEN: token
    }
  });

  const client = new Client(
    { name: "repo-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  const repoName = `dotnet-microservice-${Date.now()}`;

  await client.callTool({
    name: "create_repository",
    arguments: {
      name: repoName,
      description: "Generated .NET microservice",
      private: false,
      auto_init: true
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  const username = process.env.GH_USERNAME!;
  for (const file of files) {
    const relative = path.relative(outputDir, file).replace(/\\/g, "/");
    const content = await fs.readFile(file, "utf-8");

    await client.callTool({
      name: "create_or_update_file",
      arguments: {
        owner: username,
        repo: repoName,
        path: relative,
        content,
        message: `Add ${relative}`,
        branch: "main"
      }
    });
  }

  await client.close();

  return {
    url: `https://github.com/${username}/${repoName}`
  };
}

async function getAllFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  async function scan(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) await scan(full);
      else results.push(full);
    }
  }
  await scan(dir);
  return results;
}
