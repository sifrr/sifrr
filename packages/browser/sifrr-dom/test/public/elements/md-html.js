const { html, memo, createTemplateFromString } = Sifrr.Template;
const CSS = `<style>h1,
    h3 {
      font-size: 24px;
      margin: 8px 0;
    }
    p {
      margin: 6px 0;
    }
    .s-6 {
      width: 50%;
      float: left;
    }
    .s-12 {
      width: 100%;
      float: left;
    }
    #converter {
      height: calc(100% - 130px);
    }
    #md,
    #html {
      padding: 16px;
      font-size: 16px;
      line-height: 24px;
      overflow-y: scroll;
      border: 1px solid black;
      height: 100%;
      resize: none;
    }
    * {
      box-sizing: border-box;
      font-family: system-ui;
    }</style>`;
const HTML = html`
  ${CSS}
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/sindresorhus/github-markdown-css@gh-pages/github-markdown.css"
  />
  <div class="s-12" id="headings">
    <h1>Markdown To HTML with Sifrr diffing</h1>
    <p>
      For this big md text, one keypress takes ~16ms with Sifrr Live preview as compared to ~50ms in
      showdown's <a href="http://demo.showdownjs.com/">live preview demo</a>
    </p>
    <h3 class="s-6">Markdown</h3>
    <h3 class="s-6">Live HTML Preview with github styles</h3>
  </div>
  <div class="s-12" id="converter">
    <textarea
      class="s-6"
      id="md"
      :oninput=${memo((element) => (e) => element.setState({ content: e.target.value }), [])}
      :value=${({ state }) => state.content}
      ::on-prop-change=${console.log}
      rows="10000"
    >
    </textarea>
    <div class="s-6 markdown-body" id="html" :sifrr-html="true">
      ${(el) => createTemplateFromString(el.mdtohtml()).content.childNodes}
    </div>
  </div>
`;
const sd = new window.showdown.Converter({
  ghCompatibleHeaderId: true,
  ghMentionsLink: 'https://github.com/{u}',
  smoothLivePreview: true,
  tasklists: true,
  ghCodeBlocks: true,
  tables: true,
  strikethrough: true,
  parseImgDimensions: true,
  simplifiedAutoLink: true
});
const content = `# ShowdownJS

Showdown is a Javascript Markdown to HTML converter, based on the original works by John Gruber. It can be used client side (in the browser) or server side (with Node or io).


# Installation

## Download tarball

You can download the latest release tarball directly from [releases](releases)

## Bower

    bower install showdown

## npm (server-side)

    npm install showdown

## CDN

You can also use one of several CDNs available:

* rawgit CDN

        https://cdn.rawgit.com/showdownjs/showdown/<version tag>/dist/showdown.min.js

* cdnjs

        https://cdnjs.cloudflare.com/ajax/libs/showdown/<version tag>/showdown.min.js


[sd-logo]: https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png
[releases]: https://github.com/showdownjs/showdown/releases
[atx]: http://www.aaronsw.com/2002/atx/intro
[setext]: https://en.wikipedia.org/wiki/Setext

---------

# Syntax


## Table of contents

- [Introduction](#introduction)
- [Paragraphs](#paragraphs)
- [Headings](#headings)
    * [Atx Style](#atx-style)
    * [Setext style](#setext-style)
    * [Header IDs](#header-ids)
- [Blockquotes](#blockquotes)
- [Bold and Italic](#bold-and-italic)
- [Strikethrough](#strikethrough)
- [Emojis](#emojis)
- [Code formatting](#code-formatting)
    * [Inline formats](#inline-formats)
    * [Multiple lines](#multiple-lines)
- [Lists](#lists)
    * [Unordered lists](#unordered-lists)
    * [Ordered lists](#ordered-lists)
    * [TaskLists (GFM Style)](#tasklists--gfm-style-)
    * [List syntax](#list-syntax)
    * [Nested blocks](#nested-blocks)
    * [Nested lists](#nested-lists)
    * [Nested code blocks](#nested-code-blocks)
- [Links](#links)
    * [Simple](#simple)
    * [Inline](#inline)
    * [Reference Style](#reference-style)
- [Images](#images)
    * [Inline](#inline-1)
    * [Reference Style](#reference-style-1)
    * [Image dimensions](#image-dimensions)
    * [Base64 encoded images](#base64-encoded-images)
- [Tables](#tables)
- [Mentions](#mentions)
- [Handling HTML in markdown documents](#handling-html-in-markdown-documents)
- [Escaping entities](#escaping-entities)
    * [Escaping markdown entities](#escaping-markdown-entities)
    * [Escaping html tags](#escaping-html-tags)
- [Known differences and Gotchas](#known-differences-and-gotchas)

## Introduction

Showdown was created by John Fraser as a direct port of the original parser written by markdown's creator, John Gruber. Although Showdown has evolved since its inception, in "vanilla mode", it tries to follow the [original markdown spec][md-spec] (henceforth refereed as vanilla) as much as possible. There are, however, a few important differences, mainly due to inconsistencies in the original spec, which we addressed following the author's advice as stated in the [markdown's "official" newsletter][md-newsletter].

Showdown also support "extra" syntax not defined in the original spec as opt-in features. This means new syntax elements are not enabled by default and require users to enable them through options.

This document provides a quick description the syntax supported and the differences in output from the original markdown.pl implementation.

## Paragraphs

Paragraphs in Showdown are just **one or more lines of consecutive text** followed by one or more blank lines.

\`\`\`md
On July 2, an alien mothership entered Earth's orbit and deployed several dozen
saucer-shaped "destroyer" spacecraft, each 15 miles (24 km) wide.

On July 3, the Black Knights, a squadron of Marine Corps F/A-18 Hornets,
participated in an assault on a destroyer near the city of Los Angeles.
\`\`\`

The implication of the “one or more consecutive lines of text” is that Showdown supports
“hard-wrapped” text paragraphs. This means the following examples produce the same output:

\`\`\`md
A very long line of text
\`\`\`

\`\`\`md
A very
long line
of text
\`\`\`

If you DO want to add soft line breaks (which translate to\`<br\` in HTML) to a paragraph,
you can do so by adding 3 space characters to the end of the line \` \`).

You can also force every line break in paragraphs to translate to\`<br\` (as Github does) by
enabling the option *\`simpleLineBreak\`*.

## Headings

### Atx Style

You can create a heading by adding one or more # symbols before your heading text. The number of # you use will determine the size of the heading. This is similar to [**atx style**][atx].

\`\`\`md
# The largest heading (an <h1> tag)
## The second largest heading (an <h2> tag)
…
###### The 6th largest heading (an <h6> tag)
\`\`\`

The space between\`\` and the heading text is not required but you can make that space mandatory by enabling the option *\`requireSpaceBeforeHeadingTex\`*.

You can wrap the headings in\`\`. Both leading and trailing\`\` will be removed.

\`\`\`md
## My Heading ##
\`\`\`

If, for some reason, you need to keep a leading or trailing\`\`, you can either add a space or escape it:

\`\`\`md
# # My header # #

#\\# My Header \\# #
\`\`\`

### Setext style

You can also use [**setext style**][setext] headings, although only two levels are available.

\`\`\`md
This is an H1
=============

This is an H2
-------------
\`\`\`

**Note:**
In live preview editors, when a paragraph is followed by a list it can cause an awkward effect.

![awkward effect][]

You can prevent this by enabling the option *\`smoothPrevie\`*.

### Header IDs

Showdown generates bookmarks anchors in titles automatically, by adding an id property to an heading.

\`\`\`md
# My cool header with ID
\`\`\`

\`\`\`html
<h1 id="mycoolheaderwithid">My cool header with ID</h1>
\`\`\`

This behavior can be modified with options:

 - *\`noHeaderI\`* disables automatic id generation;
 - *\`ghCompatibleHeaderI\`* generates header ids compatible with github style (spaces are replaced with dashes and a bunch of non alphanumeric chars are removed)
 - *\`prefixHeaderI\`* adds a prefix to the generated header ids (either automatic or custom).
 - *\`headerLevelStar\`* sets the header starting level. For instance, setting this to 3 means that\`# heade\` will be converted to\`<h3\`.

Read the [README.md][readme] for more info

## Blockquotes

You can indicate blockquotes with a >.

\`\`\`md
In the words of Abraham Lincoln:

> Pardon my french
\`\`\`

Blockquotes can have multiple paragraphs and can have other block elements inside.

\`\`\`md
> A paragraph of text
>
> Another paragraph
>
> - A list
> - with items
\`\`\`

## Bold and Italic

You can make text bold or italic.

    *This text will be italic*
    **This text will be bold**

Both bold and italic can use either a \\* or an \\_ around the text for styling. This allows you to combine both bold and italic if needed.

    **Everyone _must_ attend the meeting at 5 o'clock today.**

## Strikethrough

With the option *\`strikethroug\`* enabled, Showdown supports strikethrough elements.
The syntax is the same as GFM, that is, by adding two tilde \`~\`) characters around
a word or groups of words.

\`\`\`md
a ~~strikethrough~~ element
\`\`\`

a ~~strikethrough~~ element

## Emojis

Since version 1.8.0, showdown supports github's emojis. A complete list of available emojis can be foun [here][emoji list].

\`\`\`md
this is a :smile: smile emoji
\`\`\`

this is a :smile: smile emoji

## Code formatting

### Inline formats

Use single backticks \` to format text in a special monospace format. Everything within the backticks appear as-is, with no other special formatting.

\`\`\`md
Here's an idea: why don't we take \`SuperiorProject\` and turn it into\`**Reasonable**Project\`.
\`\`\`

\`\`\`
<p>Here's an idea: why don't we take <code>SuperiorProject</code> and turn it into <code>**Reasonable**Project</code>.</p>
\`\`\`

### Multiple lines

To create blocks of code you should indent it by four spaces.

\`\`\`md
    this is a piece
    of
    code
\`\`\`

If the options *\`ghCodeBlock\`** is activated (which is by default), you can use triple backticks (\`\`\`) to format text as its own distinct block.

    Check out this neat program I wrote:

    \`\`\`
    x = 0
    x = 2 + 2
    what is x
    \`\`\`

## Lists

Showdown supports ordered (numbered) and unordered (bulleted) lists.

### Unordered lists

You can make an unordered list by preceding list items with either a *, a - or a +. Markers are interchangeable too.

\`\`\`md
* Item
+ Item
- Item
\`\`\`

### Ordered lists

You can make an ordered list by preceding list items with a number.

\`\`\`md
1. Item 1
2. Item 2
3. Item 3
\`\`\`

It’s important to note that the actual numbers you use to mark the list have no effect on the HTML output Showdown produces. So you can use the same number in all items if you wish to.

### TaskLists (GFM Style)

Showdown also supports GFM styled takslists if the *\`tasklist\`* option is enabled.

\`\`\`md
 - [x] checked list item
 - [ ] unchecked list item
\`\`\`

 - [x] checked list item
 - [ ] unchecked list item

### List syntax

List markers typically start at the left margin, but may be indented by up to three spaces.

\`\`\`md
   * this is valid
   * this is too
\`\`\`

List markers must be followed by one or more spaces or a tab.

To make lists look nice, you can wrap items with hanging indents:

\`\`\`md
*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
    viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
    Suspendisse id sem consectetuer libero luctus adipiscing.
\`\`\`

But if you want to be lazy, you don’t have to

If one list item is separated by a blank line, Showdown will wrap all the list items in\`<p\` tags in the HTML output.
So this input:

\`\`\`md
* Bird

* Magic
* Johnson
\`\`\`

Results in:

\`\`\`html
<ul>
<li><p>Bird</p></li>
<li><p>Magic</p></li>
<li><p>Johnson</p></li>
</ul>
\`\`\`

This differs from other markdown implementations such as GFM (github) or commonmark.

### Nested blocks

List items may consist of multiple paragraphs. Each subsequent paragraph in a list item must be indented by either 4 spaces or one tab:

\`\`\`md
1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.
\`\`\`

This is valid for other block elements such as blockquotes:

\`\`\`md
*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
\`\`\`

or event other lists.

### Nested lists

You can create nested lists by indenting list items by **four** spaces.

\`\`\`md
1.  Item 1
    1. A corollary to the above item.
    2. Yet another point to consider.
2.  Item 2
    * A corollary that does not need to be ordered.
    * This is indented four spaces
    * You might want to consider making a new list.
3.  Item 3
\`\`\`

This behavior is consistent with the original spec but differs from other implementations such as GFM or commonmark. Prior to version 1.5, you just needed to indent two spaces for it to be considered a sublist.
You can disable the **four spaces requirement** with option *\`disableForced4SpacesIndentedSublist\`**

To nest a third (or more) sublist level, you need to indent 4 extra spaces (or 1 extra tab) for each level.

\`\`\`md
1.  level 1
    1.  Level 2
        *   Level 3
    2.  level 2
        1.  Level 3
1.  Level 1
\`\`\`

### Nested code blocks

You can nest fenced codeblocks the same way you nest other block elements, by indenting by fours spaces or a tab:

\`\`\`md
1.  Some code:

    \`\`\`js
    var foo = 'bar';
    console.log(foo);
    \`\`\`
\`\`\`

To put a *indented style* code block within a list item, the code block needs to be indented twice — 8 spaces or two tabs:

\`\`\`md
1.  Some code:

    var foo = 'bar';
    console.log(foo);
\`\`\`

## Links

### Simple

If you wrap a valid URL or email in\`<\` it will be turned into a link whose text is the link itself.

\`\`\`md
link to <http://www.google.com/>

this is my email <somedude@mail.com>
\`\`\`

In the case of email addreses, Showdown will also perform a bit of randomized decimal and hex entity-encoding to help obscure your address from address-harvesting spambots.
You can disable this obfuscation setting *\`encodeEmail\`* option to\`false\`.

With the option *\`simplifiedAutoLin\`* enabled, Showdown will automagically turn every valid URL it finds in the text body to links for you, without the need to wrap them in\`<\`.

\`\`\`md
link to http://www.google.com/

this is my email somedude@mail.com
\`\`\`

### Inline

You can create an inline link by wrapping link text in brackets (\`[ \` ), and then wrapping the link in parentheses (\`( \` ).

For example, to create a hyperlink to github.com/showdownjs/showdown, with a link text that says, Get Showdown!, you'd write this in Markdown:\`[Get Showdown!](https://github.com/showdownjs/showdown\`.

### Reference Style

You can also use the reference style, like this:

\`\`\`md
this is a [link to google][1]

[1]: www.google.com
\`\`\`

Showdown also supports implicit link references:

\`\`\`md
this is a link to [google][]

[google]: www.google.com
\`\`\`

## Images

Markdown uses an image syntax that is intended to resemble the syntax for links, also allowing for two styles: inline and reference.

### Inline

Inline image syntax looks like this:

\`\`\`md
![Alt text](url/to/image)

![Alt text](url/to/image "Optional title")
\`\`\`

That is:

 + An exclamation mark: !;
 + followed by a set of square brackets, containing the alt attribute text for the image;
 + followed by a set of parentheses, containing the URL or path to the image, and an optional title attribute enclosed in double or single quotes.


### Reference Style

Reference-style image syntax looks like this:

\`\`\`md
![Alt text][id]
\`\`\`

Where “id” is the name of a defined image reference. Image references are defined using syntax identical to link references:

\`\`\`md
[id]: url/to/image  "Optional title attribute"
\`\`\`

Implicit references are also supported in images, similar to what happens with links:

\`\`\`md
![showdown logo][]

[showdown logo]: http://showdownjs.github.io/demo/img/editor.logo.white.png
\`\`\`

### Image dimensions

When the option *\`parseImgDimensio\`* is activated, you can also define the image dimensions, like this:

\`\`\`md
![Alt text](url/to/image =250x250 "Optional title")
\`\`\`

or in reference style:

\`\`\`md
![Alt text][id]

[id]: url/to/image =250x250
\`\`\`

### Base64 encoded images

Showdown also supports Base64 encoded images, both reference and inline style.
**Since version 1.7.4**, wrapping base64 strings, which are usually extremely long lines of text, is supported.
You can add newlines arbitrarily, as long as they are added after the\`\` character.

**inline style**
\`\`\`md
![Alt text](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAY
SURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=)
\`\`\`

**reference style**
\`\`\`md
![Alt text][id]

[id]:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
AcdvqGQAAAAYSURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=
\`\`\`

Please note that with reference style base64 image sources, regardless of "wrapping", a double newline is needed after the base64 string to separate them from a paragraph or other text block (but references can be adjacent).

**wrapped reference style**
\`\`\`md
![Alt text][id]
![Alt text][id2]

[id]:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
AcdvqGQAAAAYSURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=
[id2]:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
AcdvqGQAAAAYSURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=

this text needs to be separated from the references by 2 newlines
\`\`\`


## Tables

Tables aren't part of the core Markdown spec, but they are part of GFM and Showdown supports them by turning on the option\`table\`.

Colons can be used to align columns.

In the new version, the outer pipes \`\`) are optional, matching GFM spec.

You also don't need to make the raw Markdown line up prettily.

You can also use other markdown syntax inside them.

\`\`\`md
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| **col 3 is**  | right-aligned | $1600 |
| col 2 is      | *centered*    |   $12 |
| zebra stripes | ~~are neat~~  |    $1 |
\`\`\`

## Mentions

Showdown supports github mentions by enabling the option *\`ghMention\`*. This will turn every\`@usernam\` into a link to their github profile.

\`\`\`md
hey @tivie, check this out
\`\`\`

Since version 1.6.2 you can customize the generated link in mentions with the option *\`ghMentionsLin\`*.
For instance, setting this option to\`http://mysite.com/{u}/profil\`:

\`\`\`html
<p>hey <a href="http://mysite.com/tivie/profile">@tivie</a>, check this out</p>
\`\`\`

## Handling HTML in markdown documents

Showdown, in most cases, leaves HTML tags alone, leaving them untouched in the output document.

\`\`\`md
some markdown **here**
<div>this is *not* **parsed**</div>
\`\`\`

\`\`\`html
<p>some markdown <strong>here</strong></p>
<div>this is *not* **parsed**</div>
\`\`\`

However, there are exceptions to this. With\`<code\` and\`<pre><code\` tags, their contents are always escaped.

\`\`\`md
some markdown **here** with <code>foo & bar <baz></baz></code>
\`\`\`

 \`\`\`html
<p>some markdown <strong>here</strong> with <code>foo &amp; bar &lt;baz&gt;&lt;/baz&gt;</code></p>
\`\`\`

If you wish to enable markdown parsing inside a specific HTML tag, you can enable it by using the html attribute *\`markdow\`* or  *\`markdown="1\`*  or *\`data-markdown="1\`*.

\`\`\`md
some markdown **here**
<div markdown="1">this is *not* **parsed**</div>
\`\`\`

\`\`\`html
<p>some markdown <strong>here</strong></p>
<div markdown="1"><p>this is <em>not</em> <strong>parsed</strong></p></div>
\`\`\`

## Escaping entities

### Escaping markdown entities

Showdown allows you to use backslash \`\\\`) escapes to generate literal characters which would otherwise have special meaning in markdown’s syntax. For example, if you wanted to surround a word with literal underscores (instead of an HTML\`<em\` tag), you can use backslashes before the unserscores, like this:

\`\`\`md
\\_literal underscores\\_
\`\`\`

Showdown provides backslash escapes for the following characters:

\`\`\`
\\   backslash\`   backtick
*   asterisk
_   underscore
{}  curly braces
[]  square brackets
()  parentheses
#   hash mark
+   plus sign
-   minus sign (hyphen)
.   dot
!   exclamation mark
\`\`\`

### Escaping HTML tags

Since [version 1.7.2](https://github.com/showdownjs/showdown/tree/1.7.2) backslash escaping HTML tags is supported when\`backslashEscapesHTMLTag\` option is enabled.

\`\`\`md
\\<div>a literal div\\</div>
\`\`\`

## Known differences and Gotchas

In most cases, Showdown's output is identical to that of Perl Markdown v1.0.2b7.  What follows is a list of all known deviations.  Please file an issue if you find more.

* **Since version 1.4.0, showdown supports the markdown="1" attribute**, but for older versions, this attribute is ignored. This means:

        <div markdown="1">
             Markdown does *not* work in here.
        </div>


* You can only nest square brackets in link titles to a depth of two levels:

        [[fine]](http://www.github.com/)
        [[[broken]]](http://www.github.com/)

    If you need more, you can escape them with backslashes.


* A list is **single paragraph** if it has only **1 line-break separating items** and it becomes **multi paragraph if ANY of its items is separated by 2 line-breaks**:

   \`\`\`md
    - foo

    - bar
    - baz
   \`\`\`
   becomes

    \`\`\`html
    <ul>
      <li><p>foo</p></li>
      <li><p>bar</p></li>
      <li><p>baz</p></li>
    </ul>
    \`\`\`

This new ruleset is based on the comments of Markdown's author John Gruber in the [Markdown discussion list][md-newsletter].

[md-spec]: http://daringfireball.net/projects/markdown/
[md-newsletter]: https://pairlist6.pair.net/mailman/listinfo/markdown-discuss
[atx]: http://www.aaronsw.com/2002/atx/intro
[setext]: https://en.wikipedia.org/wiki/Setext
[readme]: https://github.com/showdownjs/showdown/blob/master/README.md
[awkward effect]: http://i.imgur.com/YQ9iHTL.gif
[emoji list]: https://github.com/showdownjs/showdown/wiki/emoji`;

class MdHtml extends Sifrr.Dom.Element {
  constructor() {
    super();
    this.state = { content };
  }

  onConnect() {
    const me = this;
    window.addEventListener(
      'hashchange',
      () => {
        me.$(location.hash).scrollIntoView(true);
      },
      false
    );
  }

  mdtohtml() {
    return sd.makeHtml(this.state.content);
  }
}
MdHtml.template = HTML;

Sifrr.Dom.register(MdHtml);
