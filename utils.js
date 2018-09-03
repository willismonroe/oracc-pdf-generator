// // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
export function formatBytes(a, b) {
    if (a === 0) return '0 Bytes';
    let c = 1024;
    let d = b || 2;
    let e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let f = Math.floor(Math.log(a) / Math.log(c));
    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + ' ' + e[f];
}

// Load a specific file from a zip archive and return a JSON object
// https://javascript.info/promise-chaining
export function loadJSONFromZip(zFile, filename) {
    return zFile
        .file(filename)
        .async('string')
        .then(file => JSON.parse(file));
}

