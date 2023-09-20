---
title: Npm packages pre-release versions
date: 2023-01-16
area: administration
tags: [npm, package, pre-release]
--- 

# Npm packages pre-release versions

::: info
This document represents an architecture decision record (ADR) and has been mirrored from the ADR section in our Shopware 6 repository.
You can find the original version [here](https://github.com/shopware/platform/blob/trunk/adr/2023-01-16-npm-packages-pre-release-versions.md)
:::

## Context
A pre-release package version is a version followed by a hyphen and an alphanumeric string.

Imagine the following scenario:
* An imaginary package is marked as insecure with version 1.8.7
* The issue is fixed with 2.0.0
* We use version `1.9.0-alpha1`
* Any pre-release package version like `1.9.0-alpha1` is interpreted as `<0.0.0` by npm

Why is this problematic?

The insecurity introduced with version `1.8.7` would never get reported to us by npm, unless we switch to a none pre-release version.

## Decision
Using pre-release package versions is prohibited.
This will be checked via a npm `preinstall` script.

## Consequences
Bug fix releases only available as a preview in a pre-release package can't be used.
