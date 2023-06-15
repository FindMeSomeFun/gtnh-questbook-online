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
		loadQuest(param[0]);
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
			element.innerHTML += '<div class="quest" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"> <input type="hidden" value="' + questId + '" /> <img src="./resources/image/item/' + questIcon + '.png" alt="No Image"> </img> </div>';
		}
	} else if (id == 'questInfo') {
		element.innerHTML = '<span> <h1>Id: ' + data[0] + ' - ' + data[1] + '</h1> </span>';
		var desc = data[2];
		var logic = data[3];
		var nextI = 0;
		element.innerHTML += '<span> <h2>Pre-Requisites: ';
		if (data[5] == 'rewards') {
			element.innerHTML += 'NONE </h2> </span>';
		} else {
			for (var i = 5; i < data.length; i++) {
				element.innerHTML += '<div class="questPre"> <input type="hidden" value="' + data[i++] + '"> <img src="./resources/image/item/' + data[i++] + '.png" alt="No Image"> </div>';
				if (data[i] == 'rewards') {
					element.innerHTML += '</h2> </span>';
					nextI = i++;
					break;
				} else {
					element.innerHTML += ' ' + logic + ' ';
				}
			}
		}
		// ['a', 'b', 'c'].includes('b')
		element.innerHTML += '<p> ' + desc + ' </p> <div class="rewards"> <p> Rewards: </p> <div> <p> ';
		var rewardTypes = ['item', 'choice', 'questcompletion', 'xp'];
		if (data[nextI] == 'tasks') {
			element.innerHTML += 'NONE </p> </div>';
		} else {
			for (var i = nextI; i < data.length; i++) {
				if (reportIfMissing(rewardTypes, data[i], 'rewardTypes')) {
					var type = data[i];
					for (i; i < data.length; i++) {
						var icon = data[i++];
						var name = icon;
						var number = data[i++];
						element.innerHTML += type + ' Reward </p> <div> <div> <div> ';
						element.innerHTML += name + ' </div> <div> x ' + number + '</div> </div> <div class="icon64"> <img src="./resources/image/item/' + icon + '.png" alt="No Image"> </div> </div> </div>';
						if (data[i] == 'tasks') {
							element.innerHTML += '</div>';
							nextI = i++;
							break;
						} if (rewardTypes.includes(data[i])) {
							
						} else {
							element.innerHTML += ' ' + logic + ' ';
						}
					}
				}
			}
			var taskNo = 1;
			var taskTypes = ['retrieval', 'optional', 'checkbox', 'crafting', 'hunt', 'location', 'fluid'];
		}
		
		
		var x = data[i++];
		var y = data[i++];
		var iconSize = data[i++];
		var questIcon = data[i];
		element.innerHTML += '<div class="quest" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"> <input type="hidden" value="' + questId + '" /> <img src="./resources/image/item/' + questIcon + '.png" alt="No Image"> </img> </div>';
// id, name, desc, logic, preRequ, [icon, name, qustId, , ...], rewards, [type, [icon, name, number, ...]], tasks, logic, [type, [icon, name, number, ...]]
	}
}

function reportIfMissing(array, value, listName) {
	if (rewardTypes.includes(data[i++])) {
		return true;
	}
	alert('Value: "' + value + '" is missing in "' + listName + '" list!');
	return false;
}

function loadQuestLineTree(questLineId) {
	readTextFile(repo + 'resources/' + document.getElementById('versions').value + '/questLine/' + questLineId + '.txt', 'questLineTree');
}

function loadQuest(questId) {
	readTextFile(repo + 'resources/' + document.getElementById('versions').value + '/quest/' + questId + '.txt', 'questInfo');
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
		loadQuestLineTree(event.target.children[0].value);
	} else if (event.target.matches('.quest')) {
		loadQuest(event.target.children[0].value);
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