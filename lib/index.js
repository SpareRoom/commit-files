const cmdExecutor = require('cmd-executor');
const githubAction = require('@actions/core');

const gitClient = cmdExecutor.git;

const getBranch = async () => {
  const githubRef = process.env.GITHUB_REF;

  if (githubRef.search(/refs\/heads\//g) !== -1) {
    return githubRef.replace('refs/heads/', '');
  }
  throw new Error('Unable to retrieve branch name to commit to');
};

const commitFiles = async () => {
  const commitMessage = githubAction.getInput('commit_message');
  const githubToken = githubAction.getInput('github_token');
  const githubUsername = githubAction.getInput('github_username');

  const gitBranch = await getBranch().catch(githubAction.setFailed);
  const activeChanges = await gitClient.status('--porcelain');

  const githubRepo = process.env.GITHUB_REPOSITORY;

  // Skip step if no changes.
  if (!activeChanges) {
    githubAction.warning('No changes were found');
    process.exit(1); // Exit with success
  }

  await gitClient
    .remote(
      `set-url origin https://${githubUsername}:${githubToken}@github.com/${githubRepo}.git`,
    )
    .catch(githubAction.setFailed);

  // Debug info to confirm it's all working correctly
  if (githubAction.isDebug()) {
    githubAction.debug(`Current branch: ${
      await gitClient['rev-parse']('--abbrev-ref HEAD')
    }`);
  }

  await gitClient.add('-A').catch(githubAction.setFailed);

  await gitClient
    .config(`--global user.name "${githubUsername}"`)
    .catch(githubAction.setFailed);

  await gitClient
    .config('--global user.email "<>"')
    .catch(githubAction.setFailed);

  await gitClient
    .commit(`-m "${commitMessage}"`)
    .catch(githubAction.setFailed);

  await gitClient
    .push(`--set-upstream origin ${gitBranch}`)
    .catch(githubAction.setFailed);

  process.exit(1); // Exit with success
};

module.exports = {
  commitFiles,
};
