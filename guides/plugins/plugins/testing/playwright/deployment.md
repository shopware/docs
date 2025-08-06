---
nav:
  title: Deployment
  position: 12
---

## Deployment Process

To deploy a new version of the Acceptance Test Suite, follow the steps below:

1. **Create a Pull Request**  
 Open a new pull request with your changes. Ensure that all commits follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to support automated versioning and changelog generation.

2. **Approval and Merge**  
 Once the pull request has been reviewed and approved, merge it into the main branch.

3. **Automated Deployment PR Creation**  
 After the merge, the [`release-please`](https://github.com/googleapis/release-please) tool will automatically open a new pull request. This deployment PR will include version bumps and a generated changelog.

4. **Review and Approve the Deployment PR**  
 The deployment pull request requires an additional approval before it can be merged.

5. **Merge the Deployment PR**  
 Once the deployment PR is approved and merged, a new release of the Acceptance Test Suite will be created in the GitHub repository. This action will also publish a new package version to NPM under  
 [@shopware-ag/acceptance-test-suite](https://www.npmjs.com/package/@shopware-ag/acceptance-test-suite).

6. **Use the New Version**  
 After a short delay, the newly published version will be available on NPM. You can then reference it in your project folders as needed.

### Troubleshooting

If you encounter any issues with the automated deployment process, please check the following [troubleshooting page of release-please](https://github.com/googleapis/release-please?tab=readme-ov-file#release-please-bot-does-not-create-a-release-pr-why).

In most cases, the problem is related to the commit messages not following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. Make sure to check your commit messages and rebase your branch if necessary. If your PR is merged with a commit message that does not follow the specification, you can do the following:

- **Create an empty commit to the main branch**  

  ```bash
      git commit --allow-empty -m "chore: release 2.0.0" -m "Release-As: 2.0.0"
  ```

  When a commit to the main branch has Release-As: x.x.x (case-insensitive) in the commit body, Release Please will open a new pull request for the specified version.

- **Push the changes**  

  ```bash
    git push origin <your-branch>
  ```

- **Adjust the release notes:** Remember to adjust the release notes in the deployment PR.
