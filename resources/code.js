var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';

var url = new URL(window.location.href);

var param = url.searchParams.get('light');
if (param == 1) {
	document.getElementById('lights-on').checked = true;
	switchTheme();
}

param = url.searchParams.get('version');
alert(document.getElementById('availableVersions').value);
if (param != null) {
	alert(param);
	document.getElementById('versions').value = param;
} else {
	alert('Version: ' + param + 'does not exist, fallback to latest.')
}
//alert(url + ' -> ' + getParam);
readTextFile(repo + 'resources/versions.txt', 'versions');
readTextFile(repo + 'resources/2.3.0/questLines.txt', 'questLines');

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
	var lines = text.split("\n");
	
	if (id == 'versions') {
		var values = ""
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				values += lines[i];
				element.innerHTML += '<option value="' + lines[i]  + '">' + lines[i] + '</option>';
			}
		}
		document.getElementById('availableVersions').value = values;
	} else if (id == 'questLines') {
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				element.innerHTML += '<div class="questLine"><img src="' + repo + 'resources/image/item/' + lines[i++] + '.png" alt="No Image"> <span> ' + lines[i] + '</span> </div>';
			}
		}
	}
}

/* Dropdown List with Images */
function showList() {
	document.getElementById("questLines").classList.toggle("show");
}

window.onclick = function(event) {
	if (event.target.matches('.questLine')) {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		for (var i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

function switchTheme(event) {
	var elems = document.getElementsByClassName('theme-switch');
	for (var i = 0; i < elems.length; i++) {
		elems[i].classList.toggle("light");
	}
}