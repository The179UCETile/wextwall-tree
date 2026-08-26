addLayer("dev", {
    name: "development", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFF00",
    requires: new Decimal(8), // Can be a function that takes requirement increases into account
    resource: "development points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.6, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
    	if (hasUpgrade("dev", 22)) mult = mult.mul(upgradeEffect("dev", 22));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for development points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Start development on TextWall",
            description: "Start generating points at a rate of 1/s",
            cost: new Decimal(1)
        },
        12: {
            title: "Canvas",
            description: "Double your point gain.",
            cost: new Decimal(1),
            unlocked() {
                return hasUpgrade("dev", 11)
            }
        },
        13: {
            title: "Colors",
            description: "Multiply your point gain based on your development points.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.55)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("dev", 12)
            }
        },
        21: {
            title: "Menu",
            description: "Triple your point gain.",
            cost: new Decimal(4),
            unlocked() {
                return hasUpgrade("dev", 13)
            }
        },
        22: {
            title: "Options",
            description: "Multiply your development point gain based on your points.",
            cost: new Decimal(6),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("dev", 21)
            }
        },
        23: {
            title: "Other features",
            description: "Multiply your point gain based on itself.",
            cost: new Decimal(15),
            effect() {
                return player.points.add(10).log10().pow(1.25)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("dev", 22)
            }
        },
    }
})
