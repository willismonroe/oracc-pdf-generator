export function corpusList(listOfCorpora) {
    return `<div class="ui relaxed divided selection list" id="step_one_body">
    ${listOfCorpora.map(corpusItem).join('')}
</div>`
}

export function corpusItem(corpusData) {
    // language=HTML
    return `
<div class="item" url="${corpusData['downloadUrl']}">
    <i class="large folder middle aligned icon"></i>
    <div class="content">
        <a class="header">${corpusData['abbrev']}</a>
        <div class="description">${corpusData['blurb']}</div>
    </div>
</div>`
}

export function textList(listOfTexts) {
    return `<div class="ui relaxed divided selection list" id="step_two_body">
    ${listOfTexts.map(textItem).join('')}
</div>`
}

export function textItem(textData) {
    // language=HTML
    return `<div class="item" id="${textData['id_text'] || textData['id_composite']}">
    <i class="file icon middle aligned left floated"></i>
    <i class="circle outline icon middle aligned right floated"></i>
    <!-- check circle outline-->
    <div class="content">
        <a class="header">${textData['id_text'] || textData['id_composite']}</a>
        <div class="description">${textData['designation']}</div>
    </div>
</div>`
}
