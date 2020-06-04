const cmdExecutor = require("cmd-executor");
const githubAction = require('@actions/core');
const github = require("@actions/github");

const gitClient = cmdExecutor.git;

const checkoutToBranch = async (branch) => {
  if (githubAction.isDebug()) githubAction.debug(`Checking out to '${branch}'`);

  await gitClient.fetch();
  await gitClient.checkout(`origin/${branch}`);
}

const getBranch = async () => {
  const githubRef = process.env.GITHUB_REF;

  if (githubRef.search(/ref\/heads\//g) == -1) {
    return string.replace("ref/heads/", "");
  } else {
    throw new Error("Unable to retrieve branch name to commit to");
  }
}

const commitFiles = async () => {
  const commitMessage = githubAction.getInput("commit_message");
  let gitBranch;

  try {
    gitBranch = await getBranch();
  } catch (e) {
    core.setFailed(e);
  }

  // Debug info to confirm it's all working correctly
  if (githubAction.isDebug()) {
    githubAction.debug(`Working directory: ${await cmdExecutor.pwd()}`);
    githubAction.debug(`Current branch: ${
      await gitClient["rev-parse"]("--abbrev-ref HEAD")
    }`);
  }

  await checkoutToBranch(gitBranch);

  const stagedChanges = await hasActiveChanges();
  const activeChanges = await hasActiveChanges({ staged: 1 });

  if (activeChanges) {
    if (!stagedChanges) await gitClient.add("-A"); // Add all unstaged files if the changes aren't staged

    await gitClient.commit(`-m ${commitMessage}`);
    await gitClient.push(`--set-upstream origin ${gitBranch}`);
  } else {
    githubAction.setOutput("changes_commited", "No changes to be commited");
    return false;
  }
}

const hasActiveChanges = async ({ staged }) => {
  let commandArguments = '--quiet --ignore-submodules HEAD 2>/dev/null; echo $?';

  if (staged) commandArguments = "--cached " + commandArguments;

  const changes = await gitClient["diff"](commandArguments);

  return changes.trim() != 1 ? false : true
}

module.exports = {
  commitFiles
}
