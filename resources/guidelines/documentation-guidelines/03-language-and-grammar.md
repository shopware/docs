# Language and Grammar

Basic guidelines for the apt use of language and grammar in the documentation are discussed in this section. In order to create a consistent product solution, Shopware maintains consistent documentation not just in terms of content but also style. A distinctive editorial voice helps create high-quality, readable, and consistent documentation.

Use American English to cater to a global audience. You may refer to the [Cambridge dictionary](https://dictionary.cambridge.org/dictionary/essential-american-english/) for American vocabulary, spell check, and alternate words.

## Voice and tone

Shopware voices a friendly and conversational tone. We are direct, clear, and more human at conveying information.

### Our voice principles

* **Friendly** — Be less formal and more down-to-earth. Developer documentation is technical, but you can vocalize your writing to sound more human than a robot. Occasionally be funny when it is appropriate.

* **Direct and clear** — Be to the point. Write in such a way that just a skim through provides a clear idea to the reader. Make it simple above all.

* **Customer focussed** — Assume that the reader is knowledgeable but has varying proficiency levels. So, understand their real needs and offer help in the right way.

## Active voice and passive voice

In general, use the active voice (the subject is the person or thing performing the action) instead of the passive voice (the subject is the person or thing being acted upon). For example,

::: tip
**Active Voice** - The user passes the access-key.
:::

::: danger
**Passive Voice** - The access-key is passed by the user.
:::

It is okay to use passive voice in the following cases:

* To emphasize an object over an action — for example, *The file is modified*.

* To de-emphasize a subject — for example, *Over 20 bugs were found in the code*.

* The action doer is not necessarily to be known — for example, *The database was updated in the last week*.

## Second-person over first-person

* In general, use the second-person instead of the first-person, such as *you* instead of *we* or *I*. However, first-person usage is an exception for FAQs.

* If you are guiding the reader to perform something, use an imperative form with an implicit you. For example:

::: tip
  **Recommended** - Create a PDF file.
:::

::: danger
  **Not recommended** - You need to create a PDF file.
:::

* Avoid the usage of *our* in sentences.

## Gender-neutral reference

* Use gender-neutral pronouns, such as *they* rather than *he, she, his, him, her*.

* Use gender-neutral words such as, humankind instead of mankind.

## Abbreviations

Abbreviations include initialisms, acronyms, shortened words, and contractions. They are intended to save the writer's and the reader's time.

### Initialisms and acronyms

* An initialism is formed from the first letters of words in a phrase — for example, *API, SQL, DDL*; whereas an acronym is formed from the initial letters of words in a phrase and pronounced as a word — for example, *ASCII, NASA*. Collectively, let's term it as abbreviation itself.

* When an abbreviation is not familiar to the audience, spell out the term followed by the abbreviation in parentheses, for example, *JSON Web Token (JWT)*. For all subsequent mentions, use the abbreviation only.

* Some abbreviations rarely need to be spelled out — for example, *API, HTTPS, SSA,* File formats such as *PDF, XML, PNG, or HTML*.

* Do not create abbreviations for product or feature names. Always spell out Shopware product and feature names.

* Abbreviations in plural form end with “s” — for example, *APIs, SKEs, and IDEs*. However, if the acronym itself ends in s, sh, ch, or x, then add es — for example, *OSes, and SSHes*.

* Don't define your own abbreviations. Use only the recognized industry-standard.

### Shortened words

* A shortened word is just part of a word or phrase — for example, *etc* for et cetera, *app* for application, *sync* for synchronization.

* Be consistent. Use either the shortened or the full word throughout the document.

### Contractions

* Contractions are unique words that are formed as a combination of two or more words with an apostrophe — for example, *it’s, you’re, you’ll, let’s, or we’re*. Such contractions add a more informal and friendly tone. So limit the usage of it.

* On the other hand, negation contractions (such as *isn't, don't, and can't*) are recommended to use as it is easy for a reader to miss the word *not*, whereas it is harder to misread *don't* as *do*.

## Tense

* In general, use the simple present tense.

* Avoid future or past tense. When you are talking about the future, the reader will be writing or running code in the future. This makes the description look ridiculous. The same holds true for past references.

## Articles

* Indefinite articles, *A* and *An* represent a singular noun.

* While *The* is a definite article used before singular and plural nouns in particular.

* Use an article with the acronym (an ISP, or a URL), nouns (the product database), etc.

## Capitalization

* Capitalize the first letter of the word immediately following a colon.

* Follow capitalization for the names of companies, software, products, services, features, and terms defined by companies and open-source communities.

* When a hyphenated word is the first word in a sentence, capitalize only the first element in the word unless a subsequent element is a proper noun or proper adjective.

## Spellings

* Spellings are based on [Cambridge dictionary](https://dictionary.cambridge.org/dictionary/essential-american-english/).

* It is ideal to use filenames, URLs, and data parameters in words that are not spelled differently by different English dictionaries — for example, color and colour.

## Conjugations

* Don't use */ (slash)* as conjugation. Use *or* instead.

* Don't use *& (ampersands)* as conjunctions. Use *and* instead.

## Punctuations

### Comma

* In a series of three or more items, use a comma before the sentence's final conjugation (and, or) — for example, *Bundles and plugins can provide their own resources like assets, controllers, services, or tests*.

* Place a comma after an introductory word or phrase — for example, *Also, each plugin is represented as a Composer package*.

* Use a semicolon, a period, or a dash before a conjunctive adverb, such as *otherwise, however*. Place a comma after the conjunctive adverb.

* Conjunction (and, but, or, nor, for, so, or yet) separate two independent clauses. Insert a comma after the first clause (before the conjunction) unless both clauses are very short — for example, *The more time you put into indexing data, the faster it is possible to read it*.

### Dashes and hyphens

To indicate a break in the flow of a sentence,  use an em dash (long dash) — for example, *Some programming languages — Pascal, COBOL, Ada are long gone*.

However, use a hyphen (small dash) in the following cases :

* Word prefixes — for example, *self-aware*

* Range of numbers — for example, *25-30 GB*

* Compound nouns — for example, *Mac-specific users*

* To remove ambiguity and clarify the meaning — for example, *logged-in, re-mark*.

* When the prefix ends in a vowel and the word it precedes starts with the same vowel — for example, *co-op, de-energize*.

### Period

* End every sentence with a period.

* Don't end headings with period.

* Don't end a URL with a period. Instead, place the URL in between the description.

* When a sentence ends with quotation marks, place the period inside the quotation marks.

* End every complete sentence with a period in a list. The exception is for phrases. For example,

```markdown
New cart features:

1. Store-level sales tax
2. Shipping modifier
3. Minimum and maximum order quantities
```

### Slashes

* Don't use date formats that rely on slashes.

* Don't use slashes with fractions because they can be ambiguous.

* Don't use slashes to separate alternatives — for example, *blue/red*.

### Parenthesis

Don't add important information in parentheses to describe it in detail.

## Do's and dont's

* Don't use informal internet slang.

* Avoid usage of buzzwords and jargons.

* Avoid the usage of idioms and phrases.

* Don't start all sentences with the same phrase such as, *In order to, To do, You can*.

* It is good to use polite words such as *may,* and *might* — for example, *That might require you to pass the parameter*.

* Avoid the usage of requesting words such as, please, request — for example, *please use this method, please take a look at the below table*.

* Don't write the way you speak; speaking may be more colloquial and verbose. Instead, add a pinch of formal style with it to convey only enough information to our audience that is sufficient to perform their tasks. This avoids cluttering the page.

Apart from language style, proper fonts and formats must be chosen to promote readers' legibility. The following section covers what fonts and formats need to be used.
