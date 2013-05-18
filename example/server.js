/*
* @package vcardparser
* @copyright (©) 2012 Wouter Vroege <wouter AT woutervroege DOT nl>
* @author Wouter Vroege <wouter AT woutervroege DOT nl>
*/

//basic imports
var vcardparser = require('../lib/vcardparser');

/*
parse from file
*/
vcardparser.parseFile(__dirname + "/johndoe.vcf", function(err, json) {
	if(err)
		return console.log(err);
	console.log("\n\nParse from file:\n\n", json);
})
	
/*
parse from string
*/
vcarddata = "BEGIN:VCARD\nVERSION:3.0\nPRODID:-//Apple Inc.//Mac OS X 10.8.2//EN\nN:Doe;John;;;\nFN:John Doe\nORG:Doe Inc.;\nTITLE:CEO\nEMAIL;type=INTERNET;type=HOME;type=pref:me@johndoe.com\nTEL;type=CELL;type=VOICE;type=pref:0123456789\nADR;type=HOME;type=pref:;;101 Main Street;Sim City;;1234;\nNOTE:Some notes\,\n\nMore notes...\nitem1.URL;type=pref:www.johndoe.com\nitem1.X-ABLabel:_$!<HomePage>!$_\nX-AIM;type=HOME;type=pref:@johndoe\nIMPP;X-SERVICE-TYPE=AIM;type=HOME;type=pref:aim:@johndoe\nUID:a6795dee-117f-4256-9a46-26775bfd4604\nX-ABUID:ED6FE137-B6AA-484A-AF53-059B7985430C:ABPerson\nEND:VCARD\n";

vcardparser.parseString(vcarddata, function(err, json) {
	if(err)
		return console.log(err);
	console.log("\n\nParse from string:\n\n", json);
})