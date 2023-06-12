var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';

var url = new URL(window.location.href);
alert("url: " + url);
// Set theme
var param = url.searchParams.get('light');
alert("param: " + param);
if (param == '1') {
alert("light=1");
	document.getElementById('lights-on').checked = true;
	switchTheme();
} else {
	document.getElementById('lights-on').checked = false;
}

readTextFile(repo + 'resources/versions.txt', 'versions');
// Set version
param = url.searchParams.get('version');
if (document.getElementById('availableVersions').value.includes(param)) {
	var array = document.getElementById('availableVersions').value.split('\u0007');
	for (var i = 0; i < array.length; i++) {
		if (array[i] == param) {
			document.getElementById('versions').options[i].selected = 'selected';
			break;
		}
	}
} else {
	readTextFile(repo + 'resources/fallbackVersion.txt', 'fallbackVersion');
	var fallbackVersion = document.getElementById('fallbackVersion').value;
	if (param != null) {
		alert('Version: ' + param + ' does not exist, fallback to ' + fallbackVersion);
	}
	document.getElementById('versions').value = fallbackVersion;
}

readTextFile(repo + 'resources/' + document.getElementById('versions').value + '/questLines.txt', 'questLines');

function readTextFile(file, id) {
	var rawFile = new XMLHttpRequest();
	rawFile.open('GET', file, false);
	rawFile.onreadystatechange = function ()
	{
		if (rawFile.readyState === 4)
		{
			if (rawFile.status === 200 || rawFile.status == 0)
			{
				populateElement(rawFile.responseText, id)
			}
		}
	}
	rawFile.send();
}

function populateElement(text, id) {
	var element = document.getElementById(id);
	var lines = text.split('\u0007');
	
	if (id == 'versions') {
		var values = ''
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				values += lines[i] + '\u0007';
				element.innerHTML += '<option value="' + lines[i]  + '">' + lines[i] + '</option>';
			}
		}
		document.getElementById('availableVersions').value = values;
	} else if (id == 'fallbackVersion') {
		document.getElementById('fallbackVersion').value = lines[0];
	} else if (id == 'questLines') {
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				element.innerHTML += '<div class="questLine"> <input type="hidden" value="' + i + '" /><img src="./resources/image/item/' + lines[i++] + '.png" alt="No Image"> <span> ' + lines[i] + '</span> </div>';
			}
		}
	}
}

/* Dropdown List with Images */
function showList() {
	document.getElementById('questLines').classList.toggle('show');
}

window.onclick = function(event) {
	if (event.target.matches('.questLine')) {
		document.getElementById('questLineId').src = event.target.children[0].src;
		document.getElementById('questLineImg').src = event.target.children[1].src;
		document.getElementById('questLineName').textContent = event.target.children[2].textContent;
		var dropdowns = document.getElementsByClassName('dropdown-content');
		for (var i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

function switchTheme(event) {
	var elems = document.getElementsByClassName('dark');
	for (var i = 0; i < elems.length; i++) {
		elems[i].classList.toggle('light');
	}
}

/*
JSON.parse() takes a JSON string as input and converts it into JavaScript object:

const me = `{ "name": "Atta", "age": 30, "twitter": "@attacomsian" }`
const data = JSON.parse(me)
console.log(data.name)		// Atta
console.log(data.age)		// 30
console.log(data.twitter) 	// @attacomsian

JSON.stringify() does the opposite. It takes a JavaScript object as input and transforms it into a string that represents it in JSON:

const data = {
	name: 'Atta',
	age: '30',
	twitter: '@attacomsian'
}
const me = JSON.stringify(data)
console.log(me)		// {"name":"Atta","age":"30","twitter":"@attacomsian"}
*/