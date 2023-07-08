var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/compact/';
var rewardTypes = ['Item', 'Choice', 'Questcompletion', 'XP Levels'];
var taskTypes = ['Retrieval', 'Crafting', 'Checkbox', 'Hunt', 'Optional', 'Location', 'Fluid', 'Consume'];
var availableVersions = [];
var fallbackVersion = '';
var version = '2.3.0';
var questLineId = '';
var questId = '';
var preQuestId = '';
var pinnedQuests = new Set();
var drawLines = {}
var drawPreLines = {}
var questLines = {};

readTextFile(repo + 'resources/versions.txt', 'versions');
readTextFile(repo + 'resources/fallbackVersion.txt', 'fallbackVersion');

// Parse URL parameters because regular way does not work on https://htmlpreview.github.io/
var parts = window.location.href.split('?');
var newParams = parts[parts.length - 1].split('&');
for (var i = 0; i < newParams.length; i++) {
	var param = newParams[i].split('=');
	if (param[0].toLowerCase() == 'version') {
		if (!availableVersions.includes(param[1])) {
			alert('Version ' + param[1] + ' does not exist, fallback to ' + fallbackVersion);
			window.version = fallbackVersion;
			document.getElementById('showVersion').innerHTML = fallbackVersion;
		} else {
			window.version = param[1];
			document.getElementById('showVersion').innerHTML = param[1];
		}
	}
}

readTextFile(repo + 'resources/' + version + '/questLines.txt', 'questLines');

for (var i = 0; i < newParams.length; i++) {
	var param = newParams[i].split('=');
	if (param[0].toLowerCase() == 'questlineid') {
		loadQuestLineTree(param[1]);
		var qstLine = document.getElementById('questLines');
		document.getElementById('questLineImg').src = qstLine.children[param[1]].children[0].src;
		document.getElementById('questLineName').textContent = qstLine.children[param[1]].children[1].textContent;
	} else if (param[0].toLowerCase() == 'questid') {
		loadQuest(param[1], 'questInfo');
	} else if (param[0].toLowerCase() == 'prequestid') {
		loadQuest(param[1], 'preQuestInfo');
	} else if (param[0].toLowerCase() == 'pinnedquests') {
		var quests = param[1].split(',');
		for (var j = 0; j < quests.length; j++) {
			loadQuest(quests[j], 'pinned');
		}
	}
}

function readTextFile(file, eId) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', file, false);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200 || xhr.status == 0) {
				populateElement(xhr.responseText, eId)
			}
		}
	}
	xhr.send(null);
}

function populateElement(text, eId) {
	var element = document.getElementById(eId);
	var data = text.split('\u0007');
	
	if (eId == 'versions') {
		for (var i = 0; i < data.length; i++) {
			availableVersions.push(data[i]);
			element.innerHTML += '<div class="version" ver="' + data[i] + '"><img src="./resources/image/gtnh.png"><span>' + data[i] + '</span></div>';
		}
	} else if (eId == 'fallbackVersion') {
		fallbackVersion = data[0];
		window.version = data[0];
		document.getElementById('showVersion').textContent = data[0];
	} else if (eId == 'questLines') {
		var j = 0;
		for (var i = 0; i < data.length; i++) {
			element.innerHTML += '<div class="questLine" qlid="' + j + '"><img src="./resources/image/' + data[i++] + '" alt="No Image"><span> [' + j + '] ' + data[i] + '</span></div>';
			window.questLines[j] = data[i];
			j++;
		}
	} else if (eId == 'questLineTree') {
		if(document.getElementById('welcome')) {
			document.getElementById('welcome').remove();
		}
		//   0-desc, 1-sizeX, 2-sizeY, 3-q[[id, main, icon, x, y, iconSize, pre[id]]]
		var canvas = document.getElementById("canvas");
 		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		window.drawLines = {}
		window.drawPreLines = {}
		document.getElementById('questLineDesc').innerHTML = data[0];
		element.style.width = data[1] + 'px';
		element.style.height = data[2] + 'px';
		canvas.width = data[1];
		canvas.height = data[2];
		element.innerHTML = ""
		for (var i = 4; i < data.length; i++) {
			var id = +data[i++];
			var main = +data[i++];
			var icon = data[i++];
			var x = +data[i++];
			var y = +data[i++];
			var iconSize = +data[i];
			var half = iconSize / 2 + 4;
			var pre = [main, x + half, y + half];
			// drawLines{'id': main, centerX, centerY}
			window.drawLines[id] = pre;
			pre = []
			for (i; i < data.length; i++) {
				if (data[i] == 'q' || i == data.length) {
					// drawPreLines['id': pre[id]]
					window.drawPreLines[id] = pre;
					break;
				} else {
					pre.push(+data[i]);
				}
			}
			var elementString = '<div class="quest';
			if (main == 1) {
				elementString += ' quest-main';
			} else {
				elementString += ' quest-optional';
			}
			element.innerHTML += elementString + '" qid="' + id + '" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"><img class="openQuest max" src="./resources/image/' + icon + '" alt="No Image"></img></div>';
		}
		window.drawPreLines[id] = pre;
		drawCanvas();
	} else if (eId == 'questInfo' || eId == 'preQuestInfo') {
		element.setAttribute('qid', data[0]);
		element.innerHTML = loadQuestData(data, eId);
	} else if (eId == 'pinned') {
		document.getElementById('main').insertAdjacentHTML('beforeend', '<div class="questInfo pinned" qid="' + data[0] + '">' + loadQuestData(data, eId) + '</div>');
	}
}

function drawCanvas() {
	if (Object.keys(drawLines).length > 0) {
		var ctx = document.getElementById("canvas").getContext("2d");
		var dl =  window.drawLines;
		var dpl = window.drawPreLines;
		var j = 0;
		for (var key in dpl) {
			for (var i in dpl[key]) {
				if (dpl[key][i] in dl) {
					j++;
					if (dl[key][0] == 1 && dl[dpl[key][i]][0] == 1) {
						drawLine(ctx, dl[key][1], dl[key][2], dl[dpl[key][i]][1], dl[dpl[key][i]][2], 'red', 5);
					} else {
						drawLine(ctx, dl[key][1], dl[key][2], dl[dpl[key][i]][1], dl[dpl[key][i]][2], 'green', 5);
					}
				}
			}
		}
	}
}

function drawLine(ctx, x1, y1, x2, y2, color, width) {
	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.strokeStyle = color;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function loadQuestData(data, eId) {
	var elementString = '<div style="height: 64px;"><div class="inline icon'
	if (+data[2] == 1) {
		elementString += ' quest-main';
	} else {
		elementString += ' quest-optional';
	}
	elementString += '"><img src="./resources/image/' + data[1] + '" alt="No Image"></div><div class="inline top"><div class="title top">[' + data[0] + '] ' + data[3] + '</div><div class="sub-title">QuestLines: '
	var qls = data[4].split(',');
	if (qls.length == 1) {
		elementString += window.questLines[qls[0]];
	} else {
		elementString += window.questLines[qls[0]];
		for (var j = 1; j < qls.length; j++) {
			elementString += '; ' + window.questLines[qls[j]];
		}
	}
	elementString += '</div></div><div class="inline float-right"><div class="inline top">Repeat:<br \>'
	if (+data[5] == -1) {
		elementString += 'None';
	} else if (+data[5] < 20) {
		elementString += '0 s';
	} else {
		var s = +data[5] / 20;
		var m = s / 60;
		var h = m / 60;
		m = m - Math.floor(h) * 60;
		s = s - (Math.floor(h) * 60 + Math.floor(m)) * 60;
		elementString += (h > 1 ? h + ' h ' : '') + (m > 1 ? m + ' m ' : '') + (s > 1 ? s + ' s ' : '');
	}
	elementString +=  '</div><div class="inline top btn hide">Hide</div>';
	if (eId == 'pinned') {
		elementString += '<div class="inline top btn remove">Remove</div></div></div>';
	} else {
		elementString += '<div class="inline top btn pin">Pin</div></div></div>';
		
	}
	//   0-id 1-icon, 2-main, 3-name, 4-questLine[], 5-repeatTime, 6-desc, 7-questLogic, 8-pre[[id, main, icon]], 9-rewards[type, [[icon, name, number]]], 10-tasks, 11-taskLogic [type, [[icon, name, number]]]
	var i = 9;
	elementString += '<div class="pad-top"><div class="half"><div><span>Pre-Requisites: ';
	if (data[9] == 'rewards') {
		elementString += 'NONE </span><div class="inline icon"></div></div>';
	} else {
		for (; i < data.length; i++) {
			var id = data[i++];
			var main = +data[i++];
			var icon = data[i];
			elementString += '</span><div class="questPre icon inline'
			if (main == 1) {
				elementString += ' quest-main';
			} else {
				elementString += ' quest-optional';
			}
			elementString += '" qid="' + id + '"><img class="openPre max" src="./resources/image/' + icon + '" alt="No Image"></div>';
			if (data[i + 1] == 'rewards') {
				elementString += '</div>';
				i = i + 1;
				break;
			} else {
				elementString += ' <span>' + data[7] + '</span> ';
			}
		}
	}
	elementString += ' <div class="text">' + data[6] + '</div></div><div class="half"><div class="tasks"><p>Rewards:</p><div>';
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
				elementString += '<div><div class="icon item"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="text">'
				var nameParts = name.split(';');
				for (var j = 0; j < nameParts.length; j++) {
					elementString += nameParts[j]
					if (j < nameParts.length - 1) {
						elementString += '<br />'
					}
				}
				elementString +=  'x ' + number + '</div></div>';
				if (rewardTypes.includes(data[i--])) {
					break;
				}
			}
			if (data[i] == 'tasks') {
				break;
			}
		}
	}
	elementString += '</div>';
	i++;	// jump over 'tasks' string
	var taskNo = 1;
	var tLogic = data[i++];
	elementString += '<div class="tasks"><p> Tasks: ' + tLogic + ' </p> ';
	for (; i < data.length; i++) {
		var type = data[i++];
		elementString += '<div><p> ' + taskNo++ + '. ' + type + ' Task </p> ';
		for (; i < data.length; i++) {
			var icon = data[i++];
			var name = data[i++];
			var number = data[i++];
			elementString += '<div><div class="icon item"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="text">'
			var nameParts = name.split(';');
			for (var j = 0; j < nameParts.length; j++) {
				elementString += nameParts[j]
				if (j < nameParts.length - 1) {
					elementString += '<br />'
				}
			}
			elementString += '0 / ' + number + '</div></div>';
			if (taskTypes.includes(data[i--])) {
				elementString += '</div>';
				break;
			}
		}
	}
	elementString += '</div></div></div></div>';
	return elementString;
}

function loadQuestLineTree(questLineId) {
	window.questLineId = questLineId;
	readTextFile(repo + 'resources/' + version + '/questLine/' + questLineId + '.txt', 'questLineTree');
}

function loadQuest(questId, elemId) {
	if (elemId == 'questInfo') {
		window.questId = questId;
	} else if (elemId == 'preQuestInfo') {
		window.preQuestId = questId;
	} else if (elemId == 'pinned') {
		window.pinnedQuests.add(questId);
	}
	readTextFile(repo + 'resources/' + version + '/quest/' + questId + '.txt', elemId);
}

function populateUrl() {
	var url = '';
	if (window.location.hostname == 'htmlpreview.github.io') {
		url = 'https://htmlpreview.github.io/?https://github.com/FindMeSomeFun/gtnh-questbook-wiki/main/index.html?version=' + window.version;
	} else {
		url = '?version=' + window.version;
	}
	if (questLineId != '') {
		url += '&questlineid=' + questLineId;
	}
	if (questId != '') {
		url += '&questid=' + questId;
	}
	if (preQuestId != '') {
		url += '&prequestid=' + preQuestId;
	}
	if (pinnedQuests.size > 0) {
		url += '&pinnedquests=' + Array.from(pinnedQuests.values()).join(",");;
	}
	var parts = window.location.href.split('?');
	window.history.pushState(url, '', url);
}

/* Dropdown List with Images */
function showList(id) {
	document.getElementById(id).classList.toggle('show');
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
		loadQuestLineTree(event.target.getAttribute('qlid'));
		populateUrl();
	} else if (event.target.matches('.version')) {
		//window.version = event.target.children[1].textContent;
		var dropdowns = document.getElementsByClassName('dropdown-content');
		for (var i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
		alert('change version: ' + event.target.children[1].textContent);
		populateUrl();
	} else if (event.target.matches('.openQuest')) {
		var elems = document.getElementsByClassName('selected')
		for (var i = 0; i < elems.length; i++) {
			elems[i].classList.toggle('selected');
		}
		event.target.parentNode.classList.toggle('selected');
		loadQuest(event.target.parentNode.getAttribute('qid'), 'questInfo');
		populateUrl();
		document.getElementById('questInfoView').scrollIntoView();
	} else if (event.target.matches('.openPre')) {
		loadQuest(event.target.parentNode.getAttribute('qid'), 'preQuestInfo');
		populateUrl();
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
		var elem = event.target.parentNode.parentNode.parentNode;
		window.pinnedQuests.delete(elem.getAttribute('qid'));
		elem.remove();
		populateUrl();
	} else if (event.target.matches('.pin')) {
		var elem = event.target.parentNode.parentNode.parentNode;
		var qid = elem.getAttribute('qid');
		if (!window.pinnedQuests.has(qid)) {
			window.pinnedQuests.add(elem.getAttribute('qid'));
			var copy = elem.innerHTML;
			document.getElementById('main').insertAdjacentHTML('beforeend', '<div class="questInfo pinned" qid="' + qid + '">' + copy.replace('pin">Pin', 'remove">Remove') + '</div>');
		}
		populateUrl();
	}
}

function switchTheme() {
	var themeInput = document.getElementById('lights-on');
	if (themeInput.checked) {
		themeInput.checked = false;
		themeInput.nextElementSibling.children[0].src = './resources/image/other/sun.png';
		replaceTheme('light','dark');
	} else {
		themeInput.checked = true;
		themeInput.nextElementSibling.children[0].src = './resources/image/other/moon.png';
		replaceTheme('dark', 'light');
	}
}

function replaceTheme(current, next) {
	var elems = document.getElementsByClassName('switch-theme');
	for (var i = 0; i < elems.length; i++) {
		elems[i].classList.replace(current, next);
	}
}