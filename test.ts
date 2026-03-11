import "dotenv/config";
import { CopilotClient } from "@github/copilot-sdk"; 

const copilot= new CopilotClient({
  githubToken: process.env.GH_TOKEN
});

await copilot.start();

const session = await copilot.createSession({
  model: "gpt-4.1",
  onPermissionRequest: async (request) => {
    return { kind: "approved" };
  }
});

const res = await session.sendAndWait({
  prompt: "Hello"
});

console.log(res);

await copilot.stop();