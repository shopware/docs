---
nav:
  title: Update Shopware version
  position: 40
---

# Guide: Using the Shopware PaaS Vault

This guide explains how to update Shopware in the PaaS Native context.

## Pre-requisite
The update should only be started if the latest deploy is successful (state: `DEPLOYING_STORE_SUCCESS`).

This can be checked with the following command `sw-paas app deploy list`:
```
sw-paas app deploy list
Selected: shopware
Selected: demo-shop
Found one application: demo-shop
╭────────────────────────────────────┬────────────────────────────────────┬───────────────────────┬────────────────────────────────────┬───────────────────┬───────────────────╮
│                 ID                 │              BUILD ID              │        STATUS         │             CREATED BY             │    CREATED AT     │    APPLIED AT     │
├────────────────────────────────────┼────────────────────────────────────┼───────────────────────┼────────────────────────────────────┼───────────────────┼───────────────────┤
│2492b221-aea6-46ce-9683-085714b8f0af│85c7246b-f788-11f0-adcf-be3c369299e8│DEPLOYING_STORE_SUCCESS│3324f8f2-20e1-70e2-5dbd-69ca97476cce│22.01.2026 11:51:13│22.01.2026 13:35:07│
│1ba79041-39a3-4172-bb36-24cd263ff6cc│65d399f4-f067-11f0-b5ac-4eb6c6ab52cb│DEPLOYING_STORE_SUCCESS│93343872-b001-7062-fbba-3a6314e4428d│13.01.2026 10:06:08│22.01.2026 07:32:29│
│ef58aa25-d303-4b56-b671-cb3918ad75c4│87ea381e-db2b-11f0-a41d-b643c268ee83│DEPLOYING_STORE_SUCCESS│c3446852-f0c1-7095-5131-8d424df937d0│17.12.2025 12:02:57│13.01.2026 08:47:39│
│3d0ebf52-c0f2-4798-b5ba-05ec01c9cf52│87ea381e-db2b-11f0-a41d-b643c268ee83│DEPLOYING_STORE_SUCCESS│c3446852-f0c1-7095-5131-8d424df937d0│17.12.2025 11:38:03│17.12.2025 11:39:42│
│a470ee4d-acea-414f-ad6e-54b2e06e97cf│87ea381e-db2b-11f0-a41d-b643c268ee83│DEPLOYING_STORE_SUCCESS│3324f8f2-20e1-70e2-5dbd-69ca97476cce│17.12.2025 09:56:47│17.12.2025 10:00:38│
│42834c59-c946-4c8e-81e3-62a115ae3fa2│87ea381e-db2b-11f0-a41d-b643c268ee83│DEPLOYING_STORE_SUCCESS│3324f8f2-20e1-70e2-5dbd-69ca97476cce│17.12.2025 09:34:56│17.12.2025 09:40:28│
│4d12f6c7-301f-4756-9c48-807d18d6d497│4be633d9-db21-11f0-a41d-b643c268ee83│DEPLOYING_STORE_SUCCESS│93343872-b001-7062-fbba-3a6314e4428d│17.12.2025 08:22:01│17.12.2025 08:24:57│
│2e1e5b43-da0d-4e87-bdfb-a66c42a71a68│d3e822ec-d994-11f0-b2b5-4ec7b4325483│DEPLOYING_STORE_SUCCESS│3324f8f2-20e1-70e2-5dbd-69ca97476cce│15.12.2025 09:03:49│15.12.2025 09:07:25│
╰────────────────────────────────────┴────────────────────────────────────┴───────────────────────┴────────────────────────────────────┴───────────────────┴───────────────────╯
```

If the state is `DEPLOYING_STORE_FAILED`, you should **NOT** initiate a Shopware update, fix the deployment before trying to anything.

## Update

### Preliminary task
It's recommended to do a backup (called `snapshot`) of your application data (database and Shopware filesystem), you can do it with the following command:
```
sw-paas snapshot create
```

Wait until the snapshot is done.


### Update the code base
You should proceed as follow:
- Create a new branch: `git checkout -b my-new-branch`
- In `composer.json` udpate `shopware/core` to the new version
- Run `composer update --no-scripts`
- Run `composer recipes:update`
- Commit your changes: `git add . && git commit -m "Updating Shopware to version X.Y.Z"` (keep the commit SHA at hand)
- Push your branch: `git push -u origin my-new-branch`

Now your code is updated, but it needs to be deployed.

### Update the running application
Before updating the application you should run then following Shopware command, to prepare the update.
Open an exec session: `sw-paas exec --new`, on your in the session run the following command: `bin/console system:update:prepare`. 

Once this command is done, you can update the application, do the following: `sw-paas application update`.
You can track the progress of the deployment using `sw-paas app deploy list` and/or `sw-paas app deploy get`.

### Post update task

Once the application is succesfully updated you tell the system that the update is finished, open a new exec session: `sw-paas exec --new`, then run the following command: `bin/console system:update:finish`. 