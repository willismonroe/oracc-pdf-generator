# [oracc-pdf-generator](https://willismonroe.github.io/oracc-pdf-generator/)
This tool will let you create PDFs based on selected texts from the ORACC corpora.
At the moment it's quite basic, it just loads the text data from the projects individual text JSON files.
Some projects have cuneiform signs included, some have normalization, some only have transliteration.
Right now the tool is not smart enough to tell you what's available before it generates the PDF.

This tool can be used to create PDFs of texts for classroom use, or personal study and reading.
All texts are credited according to the information in the ORACC JSON file.

The general workflow is as follows:

1. Select a corpus to load. This will download and unzip the corpus file from the ORACC Github
[repository](https://github.com/oracc/json) in the background and populate a list of texts from that archive.

2. Select one or more texts to include in your PDF. It can be useful here to use your webbrowsers find feature
(usually Ctrl-F or Command-F) to search for texts.

3. Select the options for the PDF: page size, and which lines from the text to include (cuneiform,
transliteration, normalization).

This tool was created by Willis Monroe, and I'd be grateful for any feedback. Is there a particular corpus
or text that breaks the PDF output? Is there an additional needed option? Could the workflow be improved?

Send any issues/queries/improvements my way.
