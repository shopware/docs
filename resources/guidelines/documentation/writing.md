# Writing

Once you are assigned to a certain topic or area, consider yourself the "knowledge lead" for this particular area of our documentation. Prepare a rough outline containing the following points and prompt other maintainers for feedback.

* Who is going to read this
* What are the prerequisites for readers?
* What are you going to write about ?
* Which questions are you going to answer?
* Which other topics might be relevant / interesting to read afterwards.

## Starting to write

After you've discussed this abstract, start writing the first 30% of your article.

* Motivate sections of the documentation \(why do we do this or that?\)
* Try to use non Shopware-specific language when possible \(or explain them e.g. "DAL" / provide link to description\)
* Expect your readers to understand less than half of what you understand
* Have a common thread throughout your article
* Work with cross-references \(knowledge is a network, not a one-way-street\)

## Quick Review

After writing the first 30%, consult a reviewer to give some initial feedback. Discuss the current progress and re-arrange some parts if needed.

As a reviewer, check the general approach, tone and wording of the text and give some early direction and feedback. Having multiple reviewers can be beneficial.

## Publishing

Before finishing off the documentation, check back with your questions posed at the beginning, send it to another reviewer and finalise based on the feedback.

When you started writing, there will be a new draft created with your changes. Each draft can have a description. Please follow the following schema for draft descriptions

```text
[Ticket-Reference] - [Description]
```

After your draft has been reviewed a final time, it will be published once you notify one of the administrators.

## Maintaining Versions

All content of this content is based on Shopware Major versions, such as 6.3, 6.4, 6.5 etc. The current version is reflected by our GitHub repositories' `master` branch, whereas each older version has its respective separate branch.

If a documented feature or functionality is introduced within major versions (and also in cases where you think it's applicable), please include a hint showing the version constraints:

{% hint style="info" %}
This functionality is available starting with Shopware 6.4.3.0.
{% endhint %}

The markup for this hint:

{% raw %}
```
{% hint style="info" %}
This functionality is available starting with Shopware 6.4.3.0.
{% endhint %}
```
{% endraw %}