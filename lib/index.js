const cmdExecutor = require("cmd-executor");
const githubAction = require('@actions/core');

const gitClient = cmdExecutor.git;

const checkoutToBranch = async (branch) => {
  if (githubAction.isDebug()) githubAction.debug(`Checking out to '${branch}'`);

  await gitClient.checkout(`origin/${branch}`);
}

const getBranch = async () => {
  const githubRef = process.env.GITHUB_REF;

  if (githubRef.search(/refs\/heads\//g) != -1) {
    return githubRef.replace("refs/heads/", "");
  } else {
    throw new Error("Unable to retrieve branch name to commit to");
  }
}

const commitFiles = async () => {
  const commitMessage = githubAction.getInput("commit_message");
  const githubToken = githubAction.getInput("github_token");
  const githubUsername = githubAction.getInput("github_username");
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const gitBranch = await getBranch().catch(githubAction.setFailed);

  githubAction.debug(
    `set-url origin https://${githubUsername}:${githubToken}@github.com/${githubRepo}.git`
  );

  await gitClient.remote(
    `set-url origin https://${githubUsername}:${githubToken}@github.com/${githubRepo}.git`
  ).catch(githubAction.setFailed);

  // Debug info to confirm it's all working correctly
  if (githubAction.isDebug()) {
    githubAction.debug(`Working directory: ${await cmdExecutor.pwd()}`);
    githubAction.debug(`Current branch: ${
      await gitClient["rev-parse"]("--abbrev-ref HEAD")
    }`);
  }

  await checkoutToBranch(gitBranch).catch(githubAction.setFailed);

  const stagedChanges = await hasActiveChanges();
  const activeChanges = await hasActiveChanges(1);

  if (activeChanges) {
    console.log(`Status command output: ${await git.status()}`);
    if (!stagedChanges) await gitClient.add("-A").catch(githubAction.setFailed); // Add all unstaged files if the changes aren't staged

    await gitClient.commit(`-m ${commitMessage}`).catch(githubAction.setFailed);

    await gitClient
      .push(`--set-upstream origin ${gitBranch}`)
      .catch(githubAction.setFailed);
  } else {
    githubAction.setOutput("changes_commited", "No changes to be commited");
    return false;
  }
}

const hasActiveChanges = async (staged) => {
  let commandArguments = '--quiet --ignore-submodules HEAD 2>/dev/null; echo $?';

  if (staged) commandArguments = "--cached " + commandArguments;

  const changes = await gitClient["diff"](commandArguments);

  return changes.trim() != 1 ? false : true
}

module.exports = {
  commitFiles
}
