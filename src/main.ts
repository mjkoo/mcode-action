import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

// Return local path to donwloaded or cached CLI
async function mcodeCLI(): Promise<string> {
  // Get latest version from API
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
  const mcodePath = await tc.downloadTool(
    `https://mayhem.forallsecure.com/cli/${os}/${bin}`
  );
  chmodSync(mcodePath, 0o755);
  const folder = await tc.cacheFile(mcodePath, bin, bin, cliVersion, os);
  return `${folder}/${bin}`;
}

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput("milliseconds");
    core.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString());
    await wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());

    core.setOutput("time", new Date().toTimeString());
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
