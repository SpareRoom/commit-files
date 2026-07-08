const cmdExecutor = require('cmd-executor');
const githubAction = require('@actions/core');

const gitClient = cmdExecutor.git;

const getBranch = async () => {
  const githubRef = process.env.GITHUB_REF;

  if (!githubRef) {
    throw new Error('No GITHUB_REF is set');
  }

  if (githubRef.startsWith('refs/heads/')) {
    return githubRef.slice('refs/heads/'.length);
  }

  throw new Error('Unable to retrieve branch name to commit to');
};

const commitFiles = async () => {
  try {
    const commitMessage = githubAction.getInput('commit_message');
    const githubToken = githubAction.getInput('github_token');
    const githubUsername = githubAction.getInput('github_username');
    const forcedFileString = githubAction.getInput('forced_files');
    const githubRepo = process.env.GITHUB_REPOSITORY;
    const gitBranch = await getBranch();

    if (forcedFileString) {
      const forcedFiles = forcedFileString
        .split(',')
        .map((file) => file.trim())
        .filter(Boolean);

      await forcedFiles.reduce(
        (promise, forcedFile) => promise.then(() => gitClient.add(`--force ${forcedFile}`)),
        Promise.resolve(),
      );
    }

    const activeChanges = await gitClient.status('--porcelain');

    // Skip step if no changes.
    if (!activeChanges) {
      githubAction.warning('No changes were found');
      return;
    }

    await gitClient.remote(
      `set-url origin https://${githubUsername}:${githubToken}@github.com/${githubRepo}.git`,
    );

    await gitClient.pull(`origin ${gitBranch}`);

    // Debug info to confirm it's all working correctly
    if (githubAction.isDebug()) {
      githubAction.debug(`Current branch: ${
        await gitClient['rev-parse']('--abbrev-ref HEAD')
      }`);
    }

    await gitClient.add('-A');

    await gitClient.config(`--global user.name "${githubUsername}"`);
    await gitClient.config('--global user.email "<>"');
    await gitClient.commit(`-m "${commitMessage}"`);
    await gitClient.push(`--set-upstream origin ${gitBranch}`);
  } catch (error) {
    githubAction.setFailed(error instanceof Error ? error.message : String(error));
  }
};

module.exports = {
  commitFiles,
};
