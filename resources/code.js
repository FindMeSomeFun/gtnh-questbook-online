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
			element.innerHTML += '<div class="quest" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"> <input type="hidden" value="' + questId + '" /> <img class="openQuest" src="./resources/image/item/' + questIcon + '.png" alt="No Image"> </img> </div>';
		}
	} else if (id == 'questInfo') {
		element.innerHTML = '<span> <h1> Id: ' + data[0] + ' - ' + data[1] + '</h1> </span>';
		var desc = data[2];
		var logic = data[3];
		var i = 5;
		var elementString = '';
		elementString += '<span> <h2>Pre-Requisites: ';
		if (data[5] == 'rewards') {
			elementString += 'NONE </h2> </span>';
		} else {
			for (; i < data.length; i++) {
				var icon = data[i++];
				var name = data[i++];
				var number = data[i];
//alert('icon: ' + icon + '\nname: ' + name + '\nnumber: ' + number + '\nnext: ' + data[i+1]);
				elementString += '<div class="questPre"> <input type="hidden" value="' + number + '"> <img src="./resources/image/item/' + icon + '.png" alt="No Image"> </div>';
				if (data[i + 1] == 'rewards') {
					elementString += '</h2> </span>';
					i = i + 1;
					break;
				} else {
					elementString += ' ' + logic + ' ';
				}
			}
		}
		i++;	// jump over 'rewards' string
		element.innerHTML += elementString;
		elementString = '<p> ' + desc + ' </p> <div class="rewards"> <p> Rewards: </p> <div> <p> ';
		var rewardTypes = ['Item', 'Choice', 'Questcompletion', 'XP Levels'];
alert('before rewards:' + data[i] + '\ni: ' + i);
		if (data[i] == 'tasks') {
			elementString += 'NONE </p> </div>';
		} else {
			for (; i < data.length; i++) {
				var type = data[i++];
alert('type: ' + type);
				for (; i < data.length; i++) {
					if (data[i] == 'tasks') {
						elementString += '</div>';
						break;
					}
					var icon = data[i++];
					var name = data[i++];
					var number = data[i++];
alert('icon: ' + icon + '\nname: ' + name + '\nnumber: ' + number + '\nnext: ' + data[i]);
					elementString += type + ' Reward </p> <div> <div> <div> ' + name + ' </div> <div> x ' + number + '</div> </div> <div class="icon64"> <img src="./resources/image/item/' + icon + '.png" alt="No Image"> </div> </div> </div>';
					if (rewardTypes.includes(data[i--])) {
						break;
					}
				}
				if (data[i] == 'tasks') {
					break;
				}
			}
		}
		i++;	// jump over 'tasks' string
		element.innerHTML += elementString;
		var taskNo = 1;
		elementString = '<div class="tasks"> <p> Tasks: </p> <div> <p> ' + taskNo + '. ';
		var taskTypes = ['Retrieval', 'Crafting', 'Checkbox', 'Hunt', 'Optional', 'Location', 'Fluid'];
		logic = data[i++];
alert('before tasks:' + data[i] + '\ni: ' + i);
		for (; i < data.length; i++) {
			var type = data[i++];
alert('type: ' + type);
			for (; i < data.length; i++) {
				var icon = data[i++];
				var name = data[i++];
				var number = data[i++];
alert('icon: ' + icon + '\nname: ' + name + '\nnumber: ' + number + '\nnext: ' + data[i]);
				elementString += type + ' Task </p> <div> <div class="icon64"> <img src="./resources/image/item/' + icon + '.png" alt="No Image"> </div> <div> <div> ' + name + ' </div> <div> 0 / ' + number + ' </div> </div> </div>';
				if (taskTypes.includes(data[i])) {
					break;
				}
			}
		}
		elementString += '</div>';
		element.innerHTML += elementString;
	}
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
	} else if (event.target.matches('.openQuest')) {
		loadQuest(event.target.previousElementSibling.value);
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