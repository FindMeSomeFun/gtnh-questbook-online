var repo = 'https://raw.githubusercontent.com/FindMeSomeFun/gtnh-questbook-wiki/main/';

//var url = new URL(window.location.href);
//var getParam = url.searchParams.get('foo'); 
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
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				element.innerHTML += '<option value="' + lines[i]  + '">' + lines[i] + '</option>';
			}
		}
	} else if (id == 'questLines') {
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] != '') {
				element.innerHTML += '<a href="#" class="questLine"><img src="' + repo + 'resources/image/item/' + lines[i++] + '.png" alt="No Image"> <span> ' + lines[i] + '</span> </a>';
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