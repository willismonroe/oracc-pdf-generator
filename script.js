import {corpusList, textList} from "./templates.js";
import projectList from './projectlist.js';
import {loadJSONFromZip, formatBytes} from './utils.js';
import {ORACCReader} from './oracc_text_reader.js';

let zip = JSZip();

// https://css-tricks.com/reactive-uis-vanillajs-part-1-pure-functional-style/

let corpusZip;


let doc = new PDFDocument({autoFirstPage: false});
let stream = doc.pipe(blobStream());
stream.on('finish', function () {
    let downloadButton = document.querySelector('#download_button');
    downloadButton.href = stream.toBlobURL('application/pdf');
    downloadButton.classList.toggle('disabled');
});

let PDFOptions = {};

let selectedTexts = [];

function zipArrays(arrays) {
    return arrays[0].map(function (_, i) {
        return arrays.map(function (array) {
            return array[i]
        })
    });
}

async function loadText(pnum) {
    let folder = Object.keys(corpusZip.files)[0] + 'corpusjson/';
    console.log("Loading: " + folder + `${pnum}.json`);
    let text = await loadJSONFromZip(corpusZip, folder + `${pnum}.json`);
    folder = Object.keys(corpusZip.files)[0];
    console.log("Loading: " + folder + 'catalogue.json');
    let catalogue = await loadJSONFromZip(corpusZip, folder + 'catalogue.json');
    let credits = catalogue["members"][pnum]["credits"];
    let title = catalogue["members"][pnum]["title"];
    if (title === undefined) {
        title = "unknown title";
    }
    let author = catalogue["members"][pnum]["ancient_author"];
    if (author === undefined) {
        author = "unknown author";
    }
    let designation = catalogue["members"][pnum]["designation"];
    console.log("Credits: " + credits);
    let or = new ORACCReader(text);
    let norm = or.getText("norm");
    let form = or.getText("form");
    let cuneiform = or.getText("cuneiform");
    // let output = zipArrays([cuneiform, form, norm]);
    let lines = {
        'cuneiform': cuneiform,
        'form': form,
        'norm': norm
    };
    let output = {
        'credits': credits,
        'text': lines,
        'title': title,
        'author': author,
        'designation': designation
    };
    console.log("Loaded text...");
    console.log(output);
    return output;
}

function loadBrill() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'Brill.ttf', true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function (e) {
        if (this.status === 200) {
            doc.registerFont('Brill', xhr.response);
            doc.save();
            loadCuneiform();
        }
    };

    xhr.send();
}

function loadCuneiform() {
    let xhr = new XMLHttpRequest();
    // xhr.open('GET', 'CuneiformNA.ttf', true);
    xhr.open('GET', 'Assurbanipal.ttf', true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function (e) {
        if (this.status === 200) {
            doc.registerFont('Cuneiform', xhr.response);
            doc.save();
            generatePDF();
        }
    };

    xhr.send();
}

async function generatePDF() {
    console.log("Selected Text(s):");
    console.log(selectedTexts);
    for (let t = 0, p = Promise.resolve(); t < selectedTexts.length; t++) {
        await loadText(selectedTexts[t])
            .then((output) => {
                let credits = output['credits'];
                let text = output['text'];
                let title = output['title'];
                let author = output['author'];
                let designation = output["designation"];
                doc.font("Brill");
                doc.text(title + " - " + author);
                doc.text(designation);
                doc.moveDown();
                for (let i = 0; i < text['cuneiform'].length; i++) {
                    if (' ' + text['cuneiform'][i].length > 0) {
                        if (PDFOptions['lines'].includes('cuneiform')) {
                            doc.font('Cuneiform')
                                .fontSize(16)
                                .text(text['cuneiform'][i].join(' '));
                        }
                        if (PDFOptions['lines'].includes("transliteration")) {
                            doc.font("Brill")
                                .fontSize(10)
                                .text('   ' + text['form'][i].join(' '));
                        }
                        if (PDFOptions['lines'].includes("normalization")) {

                            doc.font("Brill")
                                .fontSize(10)
                                .text('   ' + text['norm'][i].join(' '));
                        }
                        doc.moveDown();
                    }
                }
                doc.moveDown();
                doc.text(credits);
                if (t < selectedTexts.length - 1) {
                    doc.addPage();
                }
            });
    }
    doc.end();
}

function getPDFOptions(selectedTexts) {
    let pageSize = document.querySelector('.radio.checked').getAttribute('id');
    let lines = Array.from(document.querySelectorAll('#text_lines > div > div.checked')).map((el) => el.getAttribute('id'));
    PDFOptions['pageSize'] = pageSize;
    PDFOptions['lines'] = lines;
    doc.addPage({size: pageSize});
    console.log("PDF Options:");
    console.log(PDFOptions);
    loadBrill();
}

function getSelectedTexts() {
    let stepTwoBody = document.querySelector('#step_two_body');
    stepTwoBody.querySelectorAll('.check').forEach((el) => {
        selectedTexts.push(el.parentNode.getAttribute('id'));
    });
    console.log("Selected text(s):");
    console.log(selectedTexts);
    $('.ui.accordion').accordion('toggle', 2);
    let stepThreeBody = document.querySelector('#step_three_body');
    stepThreeBody.innerHTML = `Texts selected (${selectedTexts.length}):  ${selectedTexts.join(', ')}`;
    document.querySelector('#generate_pdf').addEventListener('click', () => getPDFOptions(selectedTexts));
}

function buildCatalog(catalog) {
    let stepTwoBody = document.querySelector('#step_two_body');

    if (catalog.hasOwnProperty('members')) {
        let listOfTexts = Object.values(catalog.members);
        listOfTexts.sort((a, b) => {
            return b['designation'] < a['designation'] ? 1 : b['designation'] > a['designation'] ? -1 : 0;
        });

        stepTwoBody.innerHTML = textList(listOfTexts);
        Array.from(stepTwoBody.firstElementChild.querySelectorAll('div.item')).map((el) => {
            el.addEventListener('click', () => {
                el.querySelector('.circle').classList.toggle('check');
                el.querySelector('.circle').classList.toggle('outline');
            })
        });
    } else {
        stepTwoBody.innerHTML = 'No text catalog associated with project';
    }
}

function fetchCatalog(url) {
    fetch(url)
        .then(function (response) {
            if (response.status !== 200) {
                console.warn('Error with api call: ' + response.status);
                return;
            }
            return response.blob();
        })
        .then(blob => {
            zip.loadAsync(blob)
                .then(function (zip) {
                    corpusZip = zip;
                    console.log(corpusZip.files);
                    let folder = Object.keys(corpusZip.files)[0];
                    return loadJSONFromZip(corpusZip, folder + 'catalogue.json');
                })
                .then(catalog => {
                    buildCatalog(catalog);
                    document.querySelector('#submit_texts').addEventListener('click', () => getSelectedTexts())
                })
                .then(() => {
                    $('.ui.accordion').accordion('toggle', 1);
                });
        });
}

function buildCorpusList(listOfCorpora) {
    let stepOneBody = document.querySelector('#step_one_body');
    stepOneBody.innerHTML = corpusList(listOfCorpora);
    Array.from(stepOneBody.firstElementChild.querySelectorAll('div.item')).map((el) => {
        let url = el.getAttribute('url');
        el.addEventListener('click', () => {
            fetchCatalog(url)
        });
    })

}

function fetchCorpora() {
    let githubCorpusList = [];
    let githubUrl = 'https://api.github.com/repos/oracc/json/contents';
    // let oraccUrl = 'http://oracc.museum.upenn.edu/projectlist.json';
    fetch(githubUrl)
        .then(response => {
            if (response.status !== 200) {
                console.warn('Error with api call: ' + response.status);
                return;
            }
            return response.json();
        })
        .then(data => {
            data.forEach(corpus => {
                if (corpus.name.slice(-3) === 'zip') {
                    let name = corpus.name.slice(0, -4).replace(/-/g, '/');
                    let url = corpus.download_url;
                    let size = corpus.size;
                    githubCorpusList.push({
                        size: formatBytes(size, 2),
                        downloadUrl: url,
                        name: name
                    });
                }
            });
            // When online
            // return fetch(oraccUrl)
        })
        // .then((response) => {
        //     if (response.status != 200) {
        //         console.warn("Error with api call: " + response.status);
        //         return
        //     }
        //     return response.json();
        // })
        .then(() => {
            // eslint-disable-next-line no-undef
            // INFO: Grabs the ORACC project list from the projectlist.js file
            return projectList();
        })
        .then(data => {
            let ORACCCorpusList = [];
            data.projects.forEach(corpus => {
                let name = corpus.pathname;
                let githubCorpus = githubCorpusList.find(item => item['name'] === name);
                if (githubCorpus) {
                    githubCorpus.abbrev = corpus.abbrev;
                    githubCorpus.longName = corpus.name;
                    githubCorpus.blurb = corpus.blurb;
                }
                ORACCCorpusList.push(githubCorpus);
            });
            ORACCCorpusList = ORACCCorpusList.filter(item => item !== undefined);
            ORACCCorpusList.sort((a, b) => {
                return b.name < a.name ? 1 : b.name > a.name ? -1 : 0;
            });
            buildCorpusList(ORACCCorpusList);
        });
}

let start = function () {
    fetchCorpora();
};

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    start();
} else {
    document.addEventListener("DOMContentLoaded", start);
}