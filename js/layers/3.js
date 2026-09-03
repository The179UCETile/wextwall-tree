addLayer("tw", {
    name: "textwallers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TW", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0),
    }},
    color: "#00FF00",
    requires: new Decimal(6000), // Can be a function that takes requirement increases into account
    resource: "textwallers", // Name of prestige currency
    baseResource: "textcoins", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 2.2,
    exponent: 1.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    branches: ['w', 't'],
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "T", description: "Shift + T: textwallers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("t",41) || player.tw.unlocked},
    milestones: {
      1: {
      requirementDescription: "1 textwallers",
      done() { return player.tw.points.gte(1);}, // Used to determine when to give the milestone
      effectDescription: "x30 points.",
      },
      2: {
      requirementDescription: "2 textwallers",
      done() { return player.tw.points.gte(2);}, // Used to determine when to give the milestone
      effectDescription: "x10 prestige points and walls.",
      },
      3: {
      requirementDescription: "3 textwallers",
      done() { return player.tw.points.gte(3);}, // Used to determine when to give the milestone
      effectDescription: "x3 textcoins, unlock new textcoin challenge.",
      },
      4: {
      requirementDescription: "5 textwallers",
      done() { return player.tw.points.gte(5);}, // Used to determine when to give the milestone
      effectDescription: "Passively gain 1% of walls per second.",
      },
      5: {
      requirementDescription: "7 textwallers",
      done() { return player.tw.points.gte(7);}, // Used to determine when to give the milestone
      effectDescription: "x10,000 points and ^1.01 points.",
      },
	  6: {
      requirementDescription: "8 textwallers",
      done() { return player.tw.points.gte(8);}, // Used to determine when to give the milestone
      effectDescription: "Passively gain 1% of textcoins per second.",
      },
      7: {
      requirementDescription: "10 textwallers",
      done() { return player.tw.points.gte(10);}, // Used to determine when to give the milestone
      effectDescription: "Unlock multiplier.",
      },
    }
})
addLayer("x", {
    name: "multiplier", 
    symbol: "×", 
    position: 0, 
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    branches: ["tw"],
    color: "#F00",
    requires: new Decimal(50), 
    resource: "multiplier", 
    baseResource: "points", 
    baseAmount() { return player.points }, 
    
    type: "normal", 
    exponent: 0.1, 

    infoboxes: {
        lore: {
            title: "Credit",
            body: "Credit to @unicodes (galaxy) for MetaTree, adding Multiplier",
        }
    },

    // FIXED: Corrected tabFormat syntax structure to correctly map tab keys directly to component arrays.
    tabFormat: {
        "Multiplier": {
			content: [
        	    "main-display",
      		    ["display-text", function() { return "You are gaining " + format(typeof player.x.points !== 'undefined' ? player.x.points : 0) + " multiplier per second" }],
            	"blank",
            	"upgrades"
        	]
		},
        "Credit": {
			content: [
            	["infobox", "lore"] // Standard syntax to correctly display your custom infobox inside a tab array
        	]
		},
    },

    upgrades: {
        11: {
            title: "It's back",
            description: "x5 point and multiplier gain",
            cost: new Decimal(20),
        },
        12: {
            title: "MetaTree is Back",
            description: "x10 point and multiplier gain, also x56.14 textcoins",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('x', 11) }
        },
        13: {
            title: `Multiplier<sup>Multiplier</sup>`,
            description: "Multiply multiplier gain by multiplier",
            effect() {
                if (!player || !player.x) return new Decimal(1); // Robust double-check fallback
                return player.x.points.add(1).pow(0.05);
            },
            effectDisplay() { return 'x' + format(upgradeEffect(this.layer, this.id)) },
            cost: new Decimal(500),
            unlocked() { return hasUpgrade('x', 12) }
        },
        14: {
            title: "What?",
            description: "*61,729 walls",
            cost: new Decimal(5e3),
            unlocked() { return hasUpgrade('x', 13) }
        },
    },

    gainMult() {
        return new Decimal(1);
    },
    gainExp() {
        return new Decimal(1);
    },

    update(diff) {
        let gain = new Decimal(0);
        // Added safety checks for initialization states
        if (player.tw && player.tw.points.gte(10)) gain = gain.add(1);
        if (hasUpgrade('x', 11)) gain = gain.times(5);
        if (hasUpgrade('x', 12)) gain = gain.times(10);
        if (hasUpgrade('x', 13)) gain = gain.times(upgradeEffect('x', 13));
        
        mg = gain;
        
        if (player.x) {
            player.x.points = player.x.points.add(gain.times(diff));
        }
    },
    row: 2,
    layerShown() { return player.tw.points.gte(10) || (player.x && player.x.unlocked) }
});
