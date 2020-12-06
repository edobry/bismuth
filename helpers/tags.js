const
    { stripIndent, TemplateTag, trimResultTransformer } = require("common-tags");

const isOnlyWhitespace = str =>
    str.replace(/\s/g, "").length == 0;

const stripOuterEmptyLines = {
    onEndResult(endResult) {
        let [ head, ...rest ] = endResult.split("\n");
        const tail = rest[rest.length - 1];
        rest = rest.slice(0, rest.length - 1);

        if(!isOnlyWhitespace(head))
            rest.unshift(head);
        if(!isOnlyWhitespace(tail))
            rest.push(tail);

        return rest.join("\n");
    }
};

const leadingWhitespace = /^[ \t]*(?=\S)/gm;

const undent = {
    onEndResult(endResult) {
        const resultLines = endResult.split("\n");

        const ignoreFirst = resultLines[0][0] != " ";

        const resultPart = ignoreFirst
            ? resultLines.slice(1).join("\n")
            : endResult;

        const match = resultPart.match(leadingWhitespace);

        // return early if there's nothing to strip
        if (match === null)
            return endResult;

        const indent = Math.min(...match.map(el => el.length));
        const regexp = new RegExp(`^[ \\t]{${indent}}`, "gm");

        return indent > 0
            ? endResult.replace(regexp, "")
            : endResult;
    }
};

const leadingSpaces = /^\s+/;

const multilineSubstitutions = {
    onSubstitution(resultSoFar, sub) {
        const lines = resultSoFar.split("\n");
        const lastLine = lines[lines.length - 1];

        const foundLeadingSpaces = lastLine.match(leadingSpaces);
        if(!foundLeadingSpaces)
            return sub;

        const indent = foundLeadingSpaces[0];
        const subLines = (sub || "").toString().split("\n");

        return [
            subLines[0],
            ...subLines.slice(1).map(line =>
                indent + line)
        ].join("\n");
    }
};

const stamper =  (...transformers) => {
    const {
        subprocessors,
        endprocessors
    } = transformers.reduce((agg, { onSubstitution, onEndResult }) => {
        if(onSubstitution)
            agg.subprocessors.push(onSubstitution);
        if(onEndResult)
            agg.endprocessors.push(onEndResult);

        return agg;
    }, {
        subprocessors: [],
        endprocessors: []
    });

    return (strings, ...subs) => {
        const result = subs
            .map((sub, i) => [strings[i + 1], sub])
            .reduce(
                (soFar, [nextString, sub]) =>
                    soFar +
                    subprocessors.reduce((sub, processor) =>
                        processor(soFar, sub), sub) +
                    nextString,
                strings[0]);

        return endprocessors.reduce((end, processor) =>
            processor(end), result);
    };
};

const source = stamper(
    stripOuterEmptyLines,
    multilineSubstitutions,
    undent
);

module.exports = { stamper, source };
