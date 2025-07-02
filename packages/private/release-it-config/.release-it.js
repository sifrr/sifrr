const version = '${version}';
const packageName = process.env.npm_package_name;
const scope = process.cwd().split('/').pop();

const headerPattern = /^(\w*)(?:\((.*)\))?!?: (.*)$/;
const breakingHeaderPattern = /^(\w*)(?:\((.*)\))!: (.*)$/;

module.exports = {
  plugins: {
    '@release-it/conventional-changelog': {
      path: '.',
      infile: 'CHANGELOG.md',
      header: `# Changelog (${packageName})`,
      preset: 'conventionalcommits',
      gitRawCommitsOpts: {
        path: '.'
      },
      parserOpts: {
        headerPattern,
        headerCorrespondence: ['type', 'scope', 'subject'],
        breakingHeaderPattern
      },
      // copied from https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/src/whatBump.js
      whatBump(commits) {
        let level = 2;
        let breakings = 0;
        let features = 0;

        commits.forEach((commit) => {
          // added ignore other scopes in original function and check with custom breaking header pattern
          if (commit.scope && commit.scope !== scope) return;
          if (breakingHeaderPattern.test(commit.header)) {
            breakings += 1;
            level = 0;
          } else if (commit.type === 'feat' || commit.type === 'feature') {
            features += 1;

            if (level === 2) {
              level = 1;
            }
          }
        });

        const result = {
          level,
          reason:
            breakings === 1
              ? `There is ${breakings} BREAKING CHANGE and ${features} features`
              : `There are ${breakings} BREAKING CHANGES and ${features} features`
        };
        console.log(result);

        return result;
      },
      transform: (cm, cb) => {
        // Remove scope so changelog doesn't contain prefixes
        if (cm.scope && cm.scope === scope) {
          cb(null, { ...cm, scope: null });
        } else if (cm.scope) {
          // Ignore commits from other scopes
          cb(null, null);
        } else {
          cb(null, cm);
        }
      }
    }
  },
  git: {
    push: false,
    commitMessage: `chore(${scope}): bump ${packageName} to v\${version}`,
    tagName: `${packageName}-v${version}`,
    commitsPath: '.',
    requireCommits: true,
    requireCommitsFail: false,
    requireCleanWorkingDir: false
  },
  npm: {
    publish: false,
    versionArgs: ['--force']
  },
  github: false
};
