---
nav:
  title: Contribution Guidelines
  position: 10

---

# Contribution Guidelines

## Introduction

First of all, thank you! :)
You have decided to contribute code to our software and become a member of the large Shopware community.
We appreciate your hard work and want to handle it with the most possible respect.

To ensure the quality of our code and our products, we have created a list of guidelines for you.
It helps you and us to collaborate with our software.
Following these guidelines will help us integrate your changes into our daily workflow.

## Requirements for a successful pull request

To avoid your pull request getting rejected, you should always check that you provided all the necessary information so that we can easily integrate your changes.
Here is a checklist of requirements you should always consider when committing new changes:

* A pull request to the Shopware core always has to be made to the [main shopware](https://github.com/shopware/shopware) repository.
* Fill out the [pull request info template](https://github.com/shopware/shopware/blob/trunk/.github/PULL_REQUEST_TEMPLATE.md) as detailed as possible.
* Create a changelog file with documentation of your changes.
  Refer to [Changelog](https://github.com/shopware/shopware/blob/master/adr/2020-08-03-implement-new-changelog.md) section for more detailed information about writing changelog.
* Check if your pull request addresses the correct Shopware branch.
  It should always target the `trunk` branch.
  If you would like to have your changes in the previous major version, we have the possibility to do a backport quite easily.
  Let us know about this in the pull request description.
* Check if your implementation is missing some important parts - For example, translations, backwards compatibility, deprecations etc.
* Provide tests for your implementation.
* Check if there is already an existing pull request tackling the same issue.
* Write your commit messages in English. The individual commit messages in the PR are not critical since the PR will be squashed on merge.
  However, ensure your **pull request title** follows the [Conventional Commits](https://www.conventionalcommits.org/) format, as this will become the final commit message.
  * Example PR titles:
    * `feat: Add new product import API`
    * `fix: Resolve cart calculation issue`
    * `docs: Update installation instructions`

::: danger
Pull requests which do not fulfill these requirements will most likely not be accepted by our team.
To avoid your changes going through unnecessary workflow cycles, make sure to check this list with every pull request.
:::

## The developing workflow on GitHub

When you create a new pull request on GitHub, please ensure:

1. Your PR title follows the **conventional commits** format as it will become the squashed commit message
2. You've provided all necessary information in the PR description
3. Your changes are complete and tested

You are responsible for maintaining and updating your pull request. This includes:

* Responding to review comments in a timely manner
* Updating the code according to review feedback
* Keeping the PR up to date with the target branch if conflicts arise
* Making sure that all pipeline checks succeed on your PR

::: tip
Once your PR is public, avoid rebasing or force-pushing to the branch.
Adding new commits makes it easier for reviewers to track changes and see what was updated in response to feedback.
The PR will be automatically squashed when merged.
:::

::: tip
Allow us to make changes to your PR.
This will help getting the PR merged faster, as we can fix small issues ourselves.
Refer to the [GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork) on how to do it.
:::

::: warning
Pull requests that become stale (no activity from the author for two weeks after a review or request for changes) will be closed.
You can always reopen the pull request when you're ready to continue working on it.
:::

## What happens after a pull request has been created

Everyday weekdays, we assign the pull request to a domain (team) which is responsible for the specific part of the Shopware software.
The area will then review your pull request and decide what to do next.
The team can either accept your pull request, decline it, or ask you to update it with more information or changes.

## Why a pull request gets declined

So the worst thing happened; Your pull request was declined.
No reason to be upset.
We know that it can sometimes be hard to understand why your pull request was rejected.
We want to be as transparent as possible, but sometimes it can also rely on internal decisions.

Here is a list of common reasons why we reject a pull request:

* The pull request does not fulfill the requirements of the list above.
* You did not update your pull request with the necessary info after a specific label was added.
* The change you made is already a part of a current change by Shopware and is handled internally.
* The benefit of your change is not relevant to the whole product but only to your intent.
* Your change implements a feature that does not fit our roadmap or our company values.

To avoid a decline of the PR beforehand, create a new issue or discussion in the Shopware repository.
Especially if you want to implement a new feature or change the behavior of an existing one.
