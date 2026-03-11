import type { CopilotClient } from "@github/copilot-sdk";
import { writeFileTool } from "../tools/writeFileTool.js";
import fs from "fs/promises";

export async function generateMicroserviceSkill(
  copilot: CopilotClient,
  architecture: string
) {
  const skillContent = await fs.readFile(
    ".skills/dotnet-microservice-generator.md",
    "utf-8"
  );

  const session = await copilot.createSession({
    model: "gpt-4.1-mini",
    streaming: false,
    tools: [writeFileTool],
    onPermissionRequest: async () => ({ kind: "approved" }),
    systemMessage: {
      content: skillContent
    }
  });

  await session.sendAndWait({
    prompt: `
Generate the microservice based on this architecture:

${architecture}
`
  },300000);
}
