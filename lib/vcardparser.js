"use strict";
/*
 * @package vcardparser
 * @copyright (©) Wouter Vroege <wouter AT woutervroege DOT nl>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

/*
parse vcard to object
*/

function parseVCardToObject(vcard) {
    const card = stripUnixChars(vcard);
    const cardLines = splitAtNewLines(card);
    const propertyLines = evalProperties(cardLines);
    const propertiesChunks = parseLinesToPropertiesChunks(propertyLines);
    const properties = parseChunksToProperties(propertiesChunks);
    return properties;
}

/*
parse string
*/

function parseString(string, callback) {
    const json = parseVCardToObject(string);
    callback(null, json);
}

/*
parse file
*/

function parseFile(pathToFile, callback) {
    require("fs").readFile(pathToFile, function(err, data) {
        if (err) return callback(err);
        const json = parseVCardToObject(data.toString());
        callback(null, json);
    });
}

/*
strip unix \r chars
*/

function stripUnixChars(str) {
    return str.replace(/\r/g, "");
}

/*
split string at every new line
*/

function splitAtNewLines(str) {
    return str.split(/\n/g);
}

/*
evaluate properties
*/

function evalProperties(cardLines) {
    const numLines = cardLines.length;

    var validLines = [];
    var validLinesIndex = -1;

    for (var i = 0; i < numLines; i++) {
        var isValidProperty = evalTextLine(cardLines[i]);

        if (isValidProperty) {
            validLinesIndex++;
            validLines[validLinesIndex] = cardLines[i];
        } else {
            validLines[validLinesIndex] += cardLines[i];
        }
    }

    return validLines;
}

/*
evaluate text line
*/

function evalTextLine(textLine) {
    const hasPropertyElement = textLine.match(/[A-Z]*:/);

    if (hasPropertyElement && hasPropertyElement.constructor.name == "Array") {
        return true;
    } else {
        return false;
    }
}

/*
parseLinesToProperties
*/

function parseLinesToPropertiesChunks(propertyLines) {
    const numLines = propertyLines.length;
    var properties = [];

    for (var i = 0; i < numLines; i++) {
        properties.push(parsePropertyChunks(propertyLines[i]));
    }

    return properties;
}

/*
parseProperty
*/

function parsePropertyChunks(propertyLine) {
    const arr = propertyLine.split(":");
    var chunks = [];
    chunks[0] = arr[0] || "";

    chunks[1] = "";
    for (var i = 1; i < arr.length; i++) {
        chunks[1] += ":" + arr[i];
    }
    chunks[1] = chunks[1].substr(1);

    return chunks;
}

/*
parseChunksToProperties
*/

function parseChunksToProperties(propertiesChunks) {
    const numPropertiesChunks = propertiesChunks.length;
    var properties = {};
    for (var i = 0; i < numPropertiesChunks; i++) {
        const property = parsePropertyChunksToObject(propertiesChunks[i]);

        if (properties[property.name]) {
            switch (properties[property.name].constructor.name) {
                case "Object":
                    //convert object to array, store new item into it
                    properties[property.name] = [properties[property.name], property.value];
                    break;
                case "Array":
                    //add new value to array
                    properties[property.name].push(property.value);
                    break;
            }
        } else {
            switch (property.name) {
                default:
                    properties[property.name] = property.value;
                    break;
                case "tel":
                case "email":
                case "impp":
                case "url":
                case "adr":
                case "x-socialprofile":
                case "x-addressbookserver-member":
                case "member":
                    properties[property.name] = [property.value];
                    break;
            }
        }
    }

    return properties;
}

/*
parsePropertyChunksToObject
*/

function parsePropertyChunksToObject(propertyChunks) {
    var obj = {};

    var leftPart = propertyChunks[0];
    var rightPart = propertyChunks[1];

    var leftPartPieces = leftPart.split(";");
    var numLeftPartPieces = leftPartPieces.length;

    var propTypes = [];

    for (var i = 1; i < numLeftPartPieces; i++) {
        if (leftPartPieces[i].substr(0, 5).toUpperCase() == "TYPE=") {
            propTypes.push(leftPartPieces[i].substr(5).toLowerCase());
        }
    }

    obj.name = leftPartPieces[0].replace(/(item|ITEM)[0-9]./, "").toLowerCase();

    switch (obj.name) {
        case "n":
            obj.value = parseName(rightPart);
            obj.test = "boe";
            break;
        case "adr":
            obj.value = parseAddress(rightPart, propTypes);
            break;
        case "tel":
        case "email":
        case "impp":
        case "url":
            obj.value = parseMVProperty(rightPart, propTypes);
            break;
        case "org":
            obj.value = parseOrganization(rightPart);
            break;
        case "photo":
            obj.value = parsePhoto(rightPart, propTypes);
            break;
        default:
            obj.value = rightPart;
            break;
    }

    return obj;
}

/*
parseMVProperty
*/

function parseMVProperty(mvValue, types) {
    return {
        type: types,
        value: mvValue
    };
}

/*
parseAddresss
*/

function parseAddress(adrValues, types) {
    const addressValues = adrValues.split(";", 7);

    const address = {
        street: addressValues[0] + addressValues[1] + addressValues[2],
        city: addressValues[3],
        region: addressValues[4],
        zip: addressValues[5],
        country: addressValues[6]
    };
    return {
        type: types,
        value: address
    };
}

/*
parseName
*/

function parseName(nameValues) {
    nameValues = nameValues.split(";", 5);
    return {
        last: nameValues[0],
        first: nameValues[1],
        middle: nameValues[2],
        prefix: nameValues[3],
        suffix: nameValues[4]
    };
}

/*
parseOrganization
*/

function parseOrganization(orgValues) {
    orgValues = orgValues.split(";", 2);
    return {
        name: orgValues[0],
        dept: orgValues[1]
    };
}

/*
parsePhoto
*/
function parsePhoto(base64string, types) {
    return {
        type: types,
        value: base64string
    };
}

//export
exports.parseString = parseString;
exports.parseFile = parseFile;
