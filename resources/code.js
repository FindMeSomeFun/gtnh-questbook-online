var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';
var availableVersions = [];
var fallbackVersion = '';
var questLineId = '';
var questId = '';
var drawLines = {}
var drawPreLines = {}

readTextFile(repo + 'resources/versions.txt', 'versions');
readTextFile(repo + 'resources/fallbackVersion.txt', 'fallbackVersion');

// Parse URL parameters because regular way does not work on https://htmlpreview.github.io/
var parts = window.location.href.split('?');
var newParams = parts[parts.length - 1].split('&');
for (var i = 0; i < newParams.length; i++) {
	var param = newParams[i].split('=');
	if (param[0].toLowerCase() == 'light') {			// Set theme
		if (param[1] == '1') {
			switchTheme();
		}
	} else if (param[0].toLowerCase() == 'version') {	// Set version
		if (!availableVersions.includes(param[1])) {
			alert('Version ' + param[1] + ' does not exist, fallback to ' + fallbackVersion);
			document.getElementById('version').value = fallbackVersion;
			document.getElementById('showVersion').innerHTML = fallbackVersion;
		} else {
			document.getElementById('version').value = param[1];
			document.getElementById('showVersion').innerHTML = param[1];
		}
	}
}

readTextFile(repo + 'resources/' + document.getElementById('version').value + '/questLines.txt', 'questLines');

for (var i = 0; i < newParams.length; i++) {
	var param = newParams[i].split('=');
	if (param[0].toLowerCase() == 'questlineid') {	// Set questLine
		loadQuestLineTree(param[1]);
		var qstLine = document.getElementById('questLines');
		document.getElementById('questLineImg').src = qstLine.children[param[1]].children[1].src;
		document.getElementById('questLineName').textContent = qstLine.children[param[1]].children[2].textContent;
	} else if (param[0].toLowerCase() == 'questid') {
		loadQuest(param[1], 'questInfo');
	} else if (param[0].toLowerCase() == 'prequestid') {
		loadQuest(param[1], 'preQuestInfo');
	} else if (param[0].toLowerCase() == 'pinned') {
		var quests = param[1].split(',');
		for (var i = 0; i < quests.length; i++) {
			loadQuest(quests[i], 'pinned');
		}
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
			element.innerHTML += '<div class="version"><input type="hidden" value="' + data[i] + '" /><img src="./resources/image/gtnh.png"><span>' + data[i] + '</span></div>';
		}
	} else if (id == 'fallbackVersion') {
		fallbackVersion = data[0];
		document.getElementById('version').value = data[0];
		document.getElementById('showVersion').textContent = data[0];
	} else if (id == 'questLines') {
		var j = 0;
		for (var i = 0; i < data.length; i++) {
			element.innerHTML += '<div class="questLine icon"><input type="hidden" value="' + j + '" /><img src="./resources/image/' + data[i++] + '" alt="No Image"><span> ' + data[i] + '</span></div>';
			j++;
		}
	} else if (id == 'questLineTree') {
		if(document.getElementById('welcome')) {
			document.getElementById('welcome').remove();
		}
		//   0-desc, 1-sizeX, 2-sizeY, 3-q[[id, main, icon, x, y, iconSize, pre[id]]]
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
			var elementString = '<div class="quest';
			if (i % 2 == 1) {
				elementString += ' quest-main';
			} else {
				elementString += ' quest-optional';
			}
			element.innerHTML += elementString + '" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"><input type="hidden" value="' + questId + '" /><img class="openQuest max" src="./resources/image/' + questIcon + '" alt="No Image"></img></div>';
		}
	} else if (id == 'questInfo' || id == 'preQuestInfo') {
		element.innerHTML = loadQuestData(data, id);
	} else if (id == 'pinned') {
		document.getElementById('main').innerHTML += '<div class="questInfo pinned">' + loadQuestData(data, id) + '</div>';
	}
}

function loadQuestData(data, id) {
	fullElementString = '<div style="height: 64px;"><div class="inline icon"><img src="./resources/image/Minecraft/Bed~0.png" alt="No Image"></div><div class="inline top"><div class="title top">Id: ' + data[0] + ' - ' + data[1] + '</div><div class="sub-title">QuestLine: Getting Around Without Dying</div></div><div class="inline float-right"><div class="inline top">Repeat:<br \>None</div><div class="inline top btn hide">Hide</div>';
	if (id == 'pinned') {
		fullElementString += '<div class="inline top btn remove">Remove</div></div></div>';
	} else {
		fullElementString += '<div class="inline top btn pin">Pin</div></div></div>';
		
	}
	//   0-icon, 1-name, 2-desc, 3-main, 4-rTime, 5-questLogic, 6-pre[[id, main, icon]], 7-rewards[type, [[icon, name, number]]], 8-taskLogic, 9-tasks[type, [[icon, name, number]]]
	var desc = data[2];
	var logic = data[3];
	var i = 5;
	var elementString = '<div class="pad-top"><div class="half"><div><span>Pre-Requisites: ';
	if (data[5] == 'rewards') {
		elementString += 'NONE </span><div class="inline icon"></div></div>';
	} else {
		for (; i < data.length; i++) {
			var icon = data[i++];
			var name = data[i++];
			var number = data[i];
			elementString += '</span><div class="questPre icon inline quest-main"><input type="hidden" value="' + number + '"><img class="openPre max" src="./resources/image/' + icon + '" alt="No Image"></div>';
			if (data[i + 1] == 'rewards') {
				elementString += '</div>';
				i = i + 1;
				break;
			} else {
				elementString += ' <span>' + logic + '</span> ';
			}
		}
	}
	fullElementString += elementString;
	elementString = ' <div class="text">' + desc + '</div></div><div class="half"><div class="tasks"><p>Rewards:</p><div>';
	var rewardTypes = ['Item', 'Choice', 'Questcompletion', 'XP Levels'];
	i++;	// jump over 'rewards' string
	if (data[i] == 'tasks') {
		elementString += '<p> NONE </p></div>';
	} else {
		for (; i < data.length; i++) {
			var type = data[i++];
			elementString += '<p>' + type + ' Reward </p> ';
			for (; i < data.length; i++) {
				if (data[i] == 'tasks') {
					elementString += '</div>';
					break;
				}
				var icon = data[i++];
				var name = data[i++];
				var number = data[i++];
				elementString += '<div><div class="icon"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="text">' + name + '\nx ' + number + '</div></div>';
				if (rewardTypes.includes(data[i--])) {
					break;
				}
			}
			if (data[i] == 'tasks') {
				break;
			}
		}
	}
	fullElementString += elementString + '</div>';
	var taskNo = 1;
	elementString = '<div class="tasks"><p> Tasks: </p> ';
	var taskTypes = ['Retrieval', 'Crafting', 'Checkbox', 'Hunt', 'Optional', 'Location', 'Fluid', 'Consume'];
	logic = data[i++];
	i++;	// jump over 'tasks' string
	for (; i < data.length; i++) {
		var type = data[i++];
		elementString += '<div><p> ' + taskNo++ + '. ' + type + ' Task </p> ';
		for (; i < data.length; i++) {
			var icon = data[i++];
			var name = data[i++];
			var number = data[i++];
//alert('icon: ' + icon + '\nname: ' + name + '\nnumber: ' + number + '\nnext: ' + data[i+1]);
			elementString += '<div><div class="icon"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="text">' + name + '\n0 / ' + number + '</div></div>';
			if (taskTypes.includes(data[i--])) {
				elementString += '</div>';
				break;
			}
		}
	}
	fullElementString += elementString + '</div></div></div>';
	return fullElementString;
}

function loadQuestLineTree(questLineId) {
	readTextFile(repo + 'resources/' + document.getElementById('version').value + '/questLine/' + questLineId + '.txt', 'questLineTree');
}

function loadQuest(questId, elemId) {
	readTextFile(repo + 'resources/' + document.getElementById('version').value + '/quest/' + questId + '.txt', elemId);
}

/* Dropdown List with Images */
function showList(id) {
	document.getElementById(id).classList.toggle('show');
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
	} else if (event.target.matches('.version')) {
		document.getElementById('version').textContent = event.target.children[2].textContent;
		var dropdowns = document.getElementsByClassName('dropdown-content');
		for (var i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
		alert('change version: ' + event.target.children[0].value);
	} else if (event.target.matches('.openQuest')) {
		var elems = document.getElementsByClassName('selected')
		for (var i = 0; i < elems.length; i++) {
			elems[i].classList.toggle('selected');
		}
		event.target.parentNode.classList.toggle('selected');
		loadQuest(event.target.previousElementSibling.value, 'questInfo');
		document.getElementById('questInfoView').scrollIntoView();
	} else if (event.target.matches('.openPre')) {
		loadQuest(event.target.previousElementSibling.value, 'preQuestInfo');
		document.getElementById('preInfoView').scrollIntoView();
	} else if (event.target.matches('.hide')) {
		var elem = event.target.parentNode.parentNode.nextElementSibling;
		if (elem.style.display == '') {
			elem.style.display = 'none';
			event.target.textContent = 'Show'
		} else {
			elem.style.display = '';
			event.target.textContent = 'Hide'
		}
	} else if (event.target.matches('.remove')) {
		event.target.parentNode.parentNode.parentNode.remove();
	} else if (event.target.matches('.pin')) {
		var copy = event.target.parentNode.parentNode.parentNode.innerHTML;
		document.getElementById('main').innerHTML += '<div class="questInfo pinned">' + copy.replace('pin">Pin', 'remove">Remove') + '</div>';
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