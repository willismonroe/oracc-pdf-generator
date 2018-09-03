export class ORACCReader {
    constructor(jsonString) {
        this.data = jsonString;
        this.pnum = this.data['textid'];
    }

    getText(outputType) {
        let lines = [];
        let line = [];
        for (let k in this.data) {
            for (let x of this.walkLine(this.data[k], outputType)) {
                if (x === "new line") {
                    if (line.length > 0) {
                        lines.push(line);
                    }
                    line = [];
                } else {
                    line.push(x);
                }
            }
            lines.push(line);
        }
        return lines;
    }

    parseLemma(lemma, outputType) {
        if (lemma["inst"] === "u") {
            return "x";
        } else {
            if (outputType === "cuneiform") {
                let sign = '';
                for (let k in lemma) {
                    for (let value of this.pullCuneiform(lemma[k])) {
                        sign += value;
                    }
                }
                return sign;
            } else {
                if (outputType === 'form') {
                    return lemma['frag'];
                } else if (outputType === 'norm') {
                    return lemma["f"]['norm'];
                }
            }
        }
    }

    * pullCuneiform(lemma) {
        if (Object.prototype.toString.call(lemma) === '[object Object]') {
            if ("gdl_utf8" in lemma) {
                yield lemma["gdl_utf8"];
            } else {
                for (let k in lemma) {
                    yield* this.pullCuneiform(lemma[k]);
                }
            }
        } else if (Object.prototype.toString.call(lemma) === "[object Array]") {
            for (let i = 0; i < lemma.length; i++) {
                yield* this.pullCuneiform(lemma[i]);
            }
        }
    }

    * walkLine(node, outputType) {
        if (Object.prototype.toString.call(node) === '[object Object]') {
            if (node["node"] === "l") {
                yield this.parseLemma(node, outputType);
            } else if (node["node"] === "d") {
                if (node["type"] === "line-start") {
                    yield "new line";
                }
            } else {
                for (let k in node) {
                    yield* this.walkLine(node[k], outputType)
                }
            }
        } else if (Object.prototype.toString.call(node) === "[object Array]") {
            for (let i = 0; i < node.length; i++) {
                yield* this.walkLine(node[i], outputType);
            }
        }
    }
}


