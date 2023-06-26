var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';
var availableVersions = [];
var fallbackVersion = '';
var questLineId = '';
var questId = '';
var drawLines = {}
var drawPreLines = {}
var canvas = document.getElementById("canvas");
var questLines = {};

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
	var request = new XMLHttpRequest();
	request.open('GET', file, false);
	request.onreadystatechange = function () {
		if (request.readyState === XMLHttpRequest.DONE) {
			if (request.status === 200 || request.status == 0) {
				populateElement(request.responseText, id)
			}
		}
	}
	request.send(null);
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
			window.questLines[j] = data[i];
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
		alert(data[1] + ' - ' + data[2]);
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
			var half = iconSize / 2;
			var pre = [main, x + half, y + half];
			// drawLines{'id': main, centerX, centerY}
			drawLines[id] = pre;
			pre = []
			for (i; i < data.length; i++) {
				if (data[i] == 'q') {
					// drawPreLines['id': pre[id]]
					drawPreLines[id] = pre;
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
			element.innerHTML += elementString + '" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + iconSize + 'px; height: ' + iconSize + 'px;"><input type="hidden" value="' + id + '" /><img class="openQuest max" src="./resources/image/' + icon + '" alt="No Image"></img></div>';
		}
/* 		for (var key in window.drawLines) {
			console.log('dl ', key, ' = ', window.drawLines[key]);
		} */
/* 		var ctx = canvas.getContext("2d");
		var dl =  window.drawLines;
		var dpl = window.drawPreLines;
		console.log('dpl: ', dpl[0]);
		console.log('dpl: ', dpl[0][0][0]);
		console.log('dl: ', dl[0]);
		console.log('dl: ', dl[0][0]);
		console.log('dl: ', dl[0][0][1]);
		console.log('dl-dpl: ', dl[198][0][1]);
		 */
/*   		for (var key in dpl) {
			console.log('dpl: ', key, ': ', dpl[key]);
			for (var id in dpl[key][0]) {
				console.log('dl: ', dpl[key][0][id]);
				//console.log('dl: ', dl['198']);//, ' x: ', dl[dpl[key][0][id]][0], ' y: ', dl[dpl[key][0][id]][1]);
			}
		} */
		// drawLine(ctx, xy["100"], xy["200"], "red", 1);
		// drawLine(ctx, xy["200"], xy["300"], "green", 2);
		// drawLine(ctx, xy["300"], xy["400"], "blue", 3);
	} else if (id == 'questInfo' || id == 'preQuestInfo') {
		element.innerHTML = loadQuestData(data, id);
	} else if (id == 'pinned') {
		document.getElementById('main').innerHTML += '<div class="questInfo pinned">' + loadQuestData(data, id) + '</div>';
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
	var id = data[0];
	var icon = data[1];
	var main = +data[2];
	var name = data[3];
	var qLine = data[4];
	var rTime = +data[5];
	fullElementString = '<div style="height: 64px;"><div class="inline icon' + main + '"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="inline top"><div class="title top">Id: ' + id + ' - ' + name + '</div><div class="sub-title">QuestLine: ' + window.questLines[qLine] + '</div></div><div class="inline float-right"><div class="inline top">Repeat:<br \>' + rTime + '</div><div class="inline top btn hide">Hide</div>';
	if (eId == 'pinned') {
		fullElementString += '<div class="inline top btn remove">Remove</div></div></div>';
	} else {
		fullElementString += '<div class="inline top btn pin">Pin</div></div></div>';
		
	}
	//   0-id 1-icon, 2-main, 3-name, 4-questLine, 5-repeatTime, 6-desc, 7-questLogic, 8-pre[[id, main, icon]], 9-rewards[type, [[icon, name, number]]], 10-tasks, 11-taskLogic [type, [[icon, name, number]]]
	var desc = data[6];
	var qLogic = data[7];
	var i = 9;
	var elementString = '<div class="pad-top"><div class="half"><div><span>Pre-Requisites: ';
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
			elementString += '"><input type="hidden" value="' + id + '"><img class="openPre max" src="./resources/image/' + icon + '" alt="No Image"></div>';
			if (data[i + 1] == 'rewards') {
				elementString += '</div>';
				i = i + 1;
				break;
			} else {
				elementString += ' <span>' + qLogic + '</span> ';
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
				elementString += '<div><div class="icon"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="text">' + name + 'x ' + number + '</div></div>';
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
	i++;	// jump over 'tasks' string
	var taskNo = 1;
	var tLogic = data[i++];
	elementString = '<div class="tasks"><p> Tasks: ' + tLogic + ' </p> ';
	var taskTypes = ['Retrieval', 'Crafting', 'Checkbox', 'Hunt', 'Optional', 'Location', 'Fluid', 'Consume'];
	for (; i < data.length; i++) {
		var type = data[i++];
		elementString += '<div><p> ' + taskNo++ + '. ' + type + ' Task </p> ';
		for (; i < data.length; i++) {
			var icon = data[i++];
			var name = data[i++];
			var number = data[i++];
//alert('icon: ' + icon + '\nname: ' + name + '\nnumber: ' + number + '\nnext: ' + data[i+1]);
			elementString += '<div><div class="icon"><img src="./resources/image/' + icon + '" alt="No Image"></div><div class="text">' + name + '0 / ' + number + '</div></div>';
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