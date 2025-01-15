---
nav:
  title: Contribution Guidelines
  position: 10

---

# Contribution Guidelines

## Introduction

First of all, thank you! :)
You have decided to contribute code to our software and become a member of the large Shopware community. We appreciate your hard work and want to handle it with the most possible respect.

To ensure the quality of our code and our products, we have created a list of guidelines for you. It helps you and us to collaborate with our software. Following these guidelines will help us integrate your changes into our daily workflow.

## Requirements for a successful pull request

To avoid your pull request getting rejected, you should always check that you provided all the necessary information so that we can easily integrate your changes into our internal workflow. Here is a checklist of requirements you should always consider when committing new changes:

* A pull request to the Shopware core always has to be made to the [main shopware](https://github.com/shopware/shopware) repository.
* Fill out the [pull request info template](https://github.com/shopware/shopware/blob/trunk/.github/PULL_REQUEST_TEMPLATE.md) as detailed as possible.
* Create a changelog file with documentation of your changes. Refer to [Changelog](https://github.com/shopware/shopware/blob/master/adr/2020-08-03-implement-new-changelog.md) section for more detailed information about writing changelog.
* Check if your pull request addresses the correct Shopware branch: 6.5.x for upcoming 6.5 version and trunk for next upcoming 6.6 version.
* Check if your implementation is missing some important parts - For example, translations, backwards compatibility etc.
* Provide the necessary tests for your implementation.
* Check if there is already an existing pull request tackling the same issue.
* Write your commit messages in English. The individual commit messages in the PR are not critical since the PR will be squashed on merge. However, ensure your **Pull Request title** follows the [Conventional Commits](https://www.conventionalcommits.org/) format, as this will become the final commit message.
  * Example PR titles:
    * `feat: Add new product import API`
    * `fix: Resolve cart calculation issue`
    * `docs: Update installation instructions`

::: danger
Pull requests which do not fulfill these requirements will never be accepted by our team. To avoid your changes going through unnecessary workflow cycles, make sure to check this list with every pull request.
:::

## The developing workflow on GitHub

When you create a new pull request on GitHub, please ensure:

1. Your PR title follows the **Conventional Commits** format as it will become the squashed commit message
2. You've provided all necessary information in the PR description
3. Your changes are complete and tested

You are responsible for maintaining and updating your pull request. This includes:

* Responding to review comments in a timely manner
* Updating the code according to review feedback
* Keeping the PR up to date with the target branch if conflicts arise
* Making sure that all pipeline checks succeed on your PR
  * We only have one required job called `check`. The job just makes sure that all integration tests are passing. It uses the action [`re-actors/alls-green`](https://github.com/re-actors/alls-green)

::: tip
Once your PR is public, avoid rebasing or force-pushing to the branch. Adding new commits makes it easier for reviewers to track changes and see what was updated in response to feedback. The PR will be automatically squashed when merged.
:::

::: warning
Pull requests that become stale (no activity from the author for 2 weeks after a review or request for changes) will be closed. You can always reopen the pull request when you're ready to continue working on it.
:::

Your PR will normally get the first review within a week. We do regular meetings to screen all new pull requests on GitHub. In this meeting, a team of Shopware developers with different specializations will discuss your changes. Together, we decide what will happen next to your pull request. We will set one of the following labels, which indicates the pull request's status. Here is a list of all possible states:

|                                  GitHub Label / Tag                                  | What does it mean? |
|:------------------------------------------------------------------------------------:| :--- |
|       ![GitHub label incomplete](../../../assets/github-label-incomplete.png)        | Your pull request is incomplete. It is either missing some of the necessary information, or your code implementation is not sufficient to fix the issue. Mostly there will be a comment by our developers which gives you further information about what is missing.   **Important:** The label "Incomplete" means you have to take action. After your pull request has this label assigned, you have up to two weeks to update the pull request and provide the missing information or implementation. If there is no reaction from you within those two weeks, your pull request can be declined due to inactivity. This procedure ensures there are no orphaned pull requests in the backlog. |
|         ![GitHub label declined](../../../assets/github-label-declined.png)          | Your pull request was declined by our developers and is closed. We understand that it can sometimes be hard to understand the reason behind this. Mostly there will be a comment by our developers about why it was declined. |
|        ![GitHub label scheduled](../../../assets/github-label-scheduled.png)         | Your changes have been reviewed by our developers, and they decided that you provided a benefit for our product. Your pull request will be imported into our ticket system and will go through our internal workflow. You will find a comment containing the ticket number to follow the status. |
|        ![GitHub label quickpick](../../../assets/github-label-quickpick.png)         | The changes you provide seem to be easy to test and implement. Our developers decided to integrate this quickly into our software. There will probably be no ticket for this change to follow, but you will be informed by the accepted label on this pull request that your change was finally merged into the product. |
|         ![GitHub label accepted](../../../assets/github-label-accepted.png)          | Your changes are finally accepted. The pull request passed our internal workflow. Your changes will be released with one of the next releases. |
|    ![GitHub label missing tests](../../../assets/github-label-missing-tests.png)     | Your pull request lacks the necessary tests for your changes. E.g. [Jest](../../../guides/plugins/plugins/testing/jest-admin) or [Cypress](../../../guides/plugins/plugins/testing/end-to-end-testing) tests for frontend changes or [PHPUnit](../../../guides/plugins/plugins/testing/php-unit) tests for backend changes. |

## What happens after a pull request has been created

Everyday weekdays, we assign the pull request to a Domain (team) which is responsible for the specific part of the Shopware software. The Area will then review your pull request and decide what to do next.
The team can either accept your pull request, decline it, or ask you to update it with more information or changes.

## Why a pull request gets declined

So the worst thing happened; Your pull request was declined. No reason to be upset. We know that it can sometimes be hard to understand why your pull request was rejected. We want to be as transparent as possible, but sometimes it can also rely on internal decisions.

Here is a list of common reasons why we reject a pull request:

* The pull request does not fulfill the requirements of the list above.
* You did not update your pull request with the necessary info after a specific label was added.
* The change you made is already a part of a current change by Shopware and is handled internally.
* The benefit of your change is not relevant to the whole product but only to your intent.
* The benefit of your change is too minor. Sometimes we do not have enough resources to handle every small change.
* Your change implements a feature that does not fit our roadmap or our company values.
