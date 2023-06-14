const repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';
var availableVersions = [];
var fallbackVersion = '';
var questLineId = '';
var questId = '';

readTextFile(repo + 'resources/versions.txt', 'versions');
readTextFile(repo + 'resources/fallbackVersion.txt', 'fallbackVersion');

// Parse URL parameters because regular way does not work on https://htmlpreview.github.io/
const parts = window.location.href.split('?');
const newParams = parts[parts.length - 1].split('&');
for (var i = 0; i < newParams.length; i++) {
	var param = newParams[i].split('=');
	if (param[0] == 'light') {				// Set theme
		if (param[1] == '1') {
			switchTheme();
		}
	} else if (param[0] == 'version') {		// Set version
		var index = availableVersions.indexOf(param[1]);
		if (index < 0) {
			alert('Version ' + param[1] + ' does not exist, fallback to ' + fallbackVersion);
			index = availableVersions.indexOf(fallbackVersion);
		}
		document.getElementById('versions').options[index].selected = 'selected';
	}
}

readTextFile(repo + 'resources/' + document.getElementById('versions').value + '/questLines.txt', 'questLines');

for (var i = 0; i < newParams.length; i++) {
	var param = newParams[i].split('=');
	if (param[0] == 'questLineId') {	// Set questLine
		loadQuestLineTree(param[1]);
		var qstLine = document.getElementById('questLines');
		document.getElementById('questLineImg').src = qstLine.children[param[1]].children[1].src;
		document.getElementById('questLineName').textContent = qstLine.children[param[1]].children[2].textContent;
	} else if (param[0] == 'questId') {		// Set quest
		
	}
}

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
	var data = text.split('\u0007');
	
	if (id == 'versions') {
		for (var i = 0; i < data.length; i++) {
			availableVersions.push(data[i]);
			element.innerHTML += '<option value="' + data[i]  + '">' + data[i] + '</option>';
		}
	} else if (id == 'fallbackVersion') {
		fallbackVersion = data[0];
	} else if (id == 'questLines') {
		var j = 0;
		for (var i = 0; i < data.length; i++) {
			element.innerHTML += '<div class="questLine"> <input type="hidden" value="' + j + '" /><img src="./resources/image/item/' + data[i++] + '.png" alt="No Image"> <span> ' + data[i] + '</span> </div>';
			j++;
		}
	} else if (id == 'questLineTree') {
		document.getElementById('questLineDesc').innerHTML = data[0];
		element.style.width = data[1] + 'px';
		element.style.height = data[2] + 'px';
		element.innerHTML = ""
		for (var i = 3; i < data.length; i++) {
			var questId = data[i++];
			var x = data[i++];
			var y = data[i++];
			var iconSize = data[i++];
			var questIcon = data[i];
			element.innerHTML += '<div class="quest" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"> <input type="hidden" value="' + questId + '" /> <img style="width: 100%; height: 100%;" src="./resources/image/item/' + questIcon + '.png" alt="No Image"> </img> </div>';
		}
	}
}

function loadQuestLineTree(questLineId) {
	readTextFile(repo + 'resources/' + document.getElementById('versions').value + '/questLine/' + questLineId + '.txt', 'questLineTree');
}

/* Dropdown List with Images */
function showList() {
	document.getElementById('questLines').classList.toggle('show');
}

window.onclick = function(event) {
	if (event.target.matches('.questLine')) {
		document.getElementById('questLineImg').src = event.target.children[1].src;
		document.getElementById('questLineName').textContent = event.target.children[2].textContent;
		var dropdowns = document.getElementsByClassName('dropdown-content');
		for (var i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
		loadQuestLineTree(event.target.children[0].value)
	}
}

function switchTheme() {
	var themeInput = document.getElementById('lights-on');
	if (themeInput.checked) {
		themeInput.checked = false;
		themeInput.nextElementSibling.children[0].src = './resources/image/sun.png';
		replaceTheme('light','dark');
	} else {
		themeInput.checked = true;
		themeInput.nextElementSibling.children[0].src = './resources/image/moon.png';
		replaceTheme('dark', 'light');
	}
}

function replaceTheme(current, next) {
	var elems = document.getElementsByClassName('switch-theme');
	for (var i = 0; i < elems.length; i++) {
		elems[i].classList.replace(current, next);
	}
}