var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';

var url = new URL(window.location.href);
// Set theme
var param = url.searchParams.get('light');
if (param == 1) {
	document.getElementById('lights-on').checked = true;
	switchTheme();
} else {
	document.getElementById('lights-on').checked = false;
}

readTextFile(repo + 'resources/versions.txt', 'versions');
// Set version
param = url.searchParams.get('version');
if (document.getElementById('availableVersions').value.includes(param)) {
	var array = document.getElementById('availableVersions').value.split(';');
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
	var lines = text.split('\n');
	
	if (id == 'versions') {
		var values = ''
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				values += lines[i] + ';';
				element.innerHTML += '<option value="' + lines[i]  + '">' + lines[i] + '</option>';
			}
		}
		document.getElementById('availableVersions').value = values;
	} else if (id == 'fallbackVersion') {
		document.getElementById('fallbackVersion').value = lines[0];
	} else if (id == 'questLines') {
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				element.innerHTML += '<div class="questLine"><img src="./resources/image/item/' + lines[i++] + '.png" alt="No Image"> <span> ' + lines[i] + '</span> </div>';
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
		document.getElementById('questLineImg').src = event.target.children[0].src;
		document.getElementById('questLineName').textContent = event.target.children[1].textContent;
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