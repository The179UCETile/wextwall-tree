// ************ Themes ************
var themes = ["dark", "blue", "light", "yellow"]

var colors = {
	dark: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#dfdfdf",
		points: "#ffffff",
		locked: "#bf8f8f",
		background: "#0f0f0f",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
	},
	blue: {
		1: "#01002e",
		2: "#010024",
		3: "#010018",
		color: "#b0b0ff",
		points: "#efefff",
		locked: "#afbfcf",
		background: "#010052",
		background_tooltip: "rgba(1, 0, 46, 0.75)",
	},
	light: {
		1: "#000000",
		2: "#3f3f3f",
		3: "#7f7f7f",
		color: "#808080",
		points: "#000000",
		locked: "#ff7f7f",
		background: "#ffffff",
		background_tooltip: "rgba(128, 128, 128, 0.75)",
	},
	yellow: {
		1: "#f0f000",
		2: "#c0c000",
		3: "#808000",
		color: "#e0e080",
		points: "#e0e040",
		locked: "#ffbf7f",
		background: "#fffce5",
		background_tooltip: "rgba(64, 64, 0, 0.75)",
	}
}
function changeTheme() {

	colors_theme = colors[options.theme || "dark"];
	document.body.style.setProperty('--background', colors_theme["background"]);
	document.body.style.setProperty('--background_tooltip', colors_theme["background_tooltip"]);
	document.body.style.setProperty('--color', colors_theme["color"]);
	document.body.style.setProperty('--points', colors_theme["points"]);
	document.body.style.setProperty("--locked", colors_theme["locked"]);
}
function getThemeName() {
	return options.theme? options.theme : "dark";
}

function switchTheme() {
	let index = themes.indexOf(options.theme)
	if (options.theme === null || index >= themes.length-1 || index < 0) {
		options.theme = themes[0];
	}
	else {
		index ++;
		options.theme = themes[index];
	}
	changeTheme();
	resizeCanvas();
}
