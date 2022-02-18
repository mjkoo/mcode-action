import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as github from "@actions/github";
import * as tc from "@actions/tool-cache";
import { chmodSync } from "fs";

async function giftwrapTool(): Promise<string> {
  const cliVersion = "latest";
  const os = "Linux";
  const bin = "giftwrap";

  // Return cache if available
  const cachedPath = tc.find(bin, cliVersion, os);
  if (cachedPath) {
    core.debug(`found cache: ${cachedPath}`);
    return `${cachedPath}/${bin}`;
  }

  // Download the CLI and cache it if version is set
  // TODO: Don't host this in git, BFG this
  const giftwrapPath = await tc.downloadTool(
    "https://github.com/mjkoo/mcode-action/raw/main/bin/giftwrap"
  );
  chmodSync(giftwrapPath, 0o755);
  const folder = await tc.cacheFile(giftwrapPath, bin, bin, cliVersion, os);

  return `${folder}/${bin}`;
}

async function run(): Promise<void> {
  try {
    const giftwrap = await giftwrapTool();

    const mayhemUrl: string = core.getInput("mayhem-url", { required: true });
    const mayhemToken: string = core.getInput("mayhem-token", {
      required: true,
    });
    const githubToken: string | undefined = core.getInput("github-token");

    if (githubToken !== undefined) {
      const octokit = github.getOctokit(githubToken);
      const context = github.context;
      const head_sha: string | undefined =
        context.payload.after ||
        context.payload.pull_request?.head.sha ||
        process.env.GITHUB_SHA;

      await octokit.rest.checks.create({
        ...context.repo,
        name: "Mayhem for Code",
        head_sha,
        started_at: new Date().toISOString(),
        status: "in_progress",
      });

      core.debug(`${JSON.stringify(context)}`);
    }

    //process.env["MAYHEM_TOKEN"] = mayhemToken;
    //process.env["MAYHEM_URL"] = mayhemUrl;
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
