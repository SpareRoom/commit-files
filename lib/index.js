const cmdExecutor = require("cmd-executor");
const githubAction = require('@actions/core');
const gitClient = cmdExecutor.git;

const commitFiles = async () => {
  const activeChanges = await hasActiveChanges();

  const commitMessage = githubAction.getInput("commit_message");
  const gitBranch = githubAction.getInput("branch");
  const debug = githubAction.getInput("debug");

  if (debug) console.log(`Working directory: ${await cmdExecutor.pwd()}`);
  if (debug) console.log(`Current directory tree: ${await cmdExecutor.ls("-la")}`);

  if (gitBranch) await gitClient.checkout(gitBranch);

  if (activeChanges) {
    if (!(await hasActiveChanges(1))) await gitClient.add("-A"); // Add all unstaged files if the changes aren't staged

    await gitClient.commit(`-m ${commitMessage}`);
    await gitClient.push("-u");
  } else {
    githubAction.setOutput(
      "changes_commited",
      "No changes to be commited"
    );
    return false;
  }
}

const hasActiveChanges = async (staged = 0) => {
  let commandArguments = '--quiet --ignore-submodules HEAD 2>/dev/null; echo $?';

  if (staged) commandArguments = "--cached " + commandArguments;

  const changes = await gitClient["diff"](commandArguments);

  return changes.trim() != 1 ? false : true
}

module.exports = {
  commitFiles
}
