import type { CopilotClient } from "@github/copilot-sdk";
import { readSpecTool } from "../tools/readSpecTool.js";
import fs from "fs/promises";

export async function analyzeAndDesignSkill(
  copilot: CopilotClient,
  specPath: string
) {
  const skillContent = await fs.readFile(
    ".skills/dotnet-architecture.md",
    "utf-8"
  );

  const session = await copilot.createSession({
    model: "gpt-4.1-mini",
    streaming: false,
    tools: [readSpecTool],
    onPermissionRequest: async () => ({ kind: "approved" }),
    systemMessage: {
      content: skillContent
    }
  });

  const res = await session.sendAndWait({
    prompt: `Analyze and design architecture for: ${specPath}`
  },300000);

  return res?.data.content || "";
}
