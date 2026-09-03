let modInfo = {
	name: "The TextWall Tree",
	author: "The179UCETile",
	pointsName: "characters",
	modFiles: ["layers.js", "tree.js"],
	id: "thetwtree-t179ucet",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(8), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "Domain Expansion",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3 class="gradienttemplate" style="background:linear-gradient(60deg, #00cc78, #7eed56);">v0.2</h3><br>
		<span class="vername">Domain Expansion</span><br>
		- Added the Bzuki and lime.person layers.<br>
		- Headings for major updates now have a gradient.<br>
		- Added 6 more achievements.<br>
		- Modified the upgrade sizes to fit more text in.<br>
		- Endgame: ${format("1e30")} lime.person points.<br>
	<h4>v0.1.1</h4>
		- Changed an achievement and added images to some achievements (and placeholder ones were used for ones that don't)<br>
	<h3 class="gradienttemplate" style="background:linear-gradient(45deg, #00ffff, #00ff00, #ff0000);">v0.1</h3><br>
		<span class="vername">Yes Button</span><br>
		- Added the builder, spammer and click yes layers.<br>
		- (Slightly) changed the CSS.<br>
		- Added achievements.<br>
		- Endgame: Completed challenge "July 2021 DDoS Attack" twice.<br>
	<h3 class="gradienttemplate" style="background:linear-gradient(135deg, #0040ff, #ffd635);">v0.0</h3><br>
		<span class="vername">Release</span><br>
		- Added development layer and TextWall layer.<br>
		- Endgame: "Builders and Spammers" upgrade.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("dev", 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1);
	if (hasUpgrade("dev", 12)) gain = gain.mul(2);
	if (hasUpgrade("dev", 13)) gain = gain.times(upgradeEffect("dev", 13));
	if (hasUpgrade("dev", 21)) gain = gain.mul(3);
	if (hasUpgrade("dev", 23)) gain = gain.times(upgradeEffect("dev", 23));
	if (hasUpgrade("tw", 11)) gain = gain.mul(4);
	if (hasUpgrade("tw", 12)) gain = gain.times(upgradeEffect("tw", 12));
  if (hasUpgrade("tw", 31)) gain = gain.mul(2);
	gain = gain.mul(temp.build.effect[0]);
  if (hasUpgrade("spam", 11)) gain = gain.mul(8);
	if (hasUpgrade("spam", 12)) gain = gain.times(upgradeEffect("spam", 12));
  if (hasUpgrade("bzuki", 31)) gain = gain.mul(upgradeEffect("bzuki", 31)[1]);
  if (hasUpgrade("lime", 12)) gain = gain.mul("1e200");
  // if (hasUpgrade("cyod", 11)) gain = gain.mul(upgradeEffect("cyod", 11));
  if (hasUpgrade("build", 13)) gain = gain.pow(1.02);
  if (hasUpgrade("clickyes", 12)) gain = gain.pow(1.025);
	if (challengeCompletions("clickyes", 21) >= 1) gain = gain.pow(1.05);
  if (inChallenge("clickyes", 21)) gain = gain.pow(0.55);
  if (inChallenge("clickyes", 31)) gain = gain.pow(0.5);
  if (inChallenge("lime", 11)) gain = gain.pow(0.075);
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() { return `Endgame: ${format("1e30")} lime.person points` }
]

// Determines when the game "ends"
function isEndgame() {
	return player.lime.points.gte("1e30")
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}