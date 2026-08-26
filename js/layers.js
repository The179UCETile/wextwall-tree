addLayer("dev", {
    name: "development", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0040FF",
    requires: new Decimal(8), // Can be a function that takes requirement increases into account
    resource: "development points", // Name of prestige currency
    baseResource: "characters", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.6, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
    	if (hasUpgrade("dev", 22)) mult = mult.mul(upgradeEffect("dev", 22));
    	if (hasUpgrade("tw", 11)) mult = mult.mul(2);
    	if (hasUpgrade("tw", 13)) mult = mult.mul(upgradeEffect("tw", 13));
    	if (hasUpgrade("tw", 22)) mult = mult.mul(upgradeEffect("tw", 22));
    	if (hasUpgrade("tw", 31)) mult = mult.mul(2);
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
    doReset(resettingLayer) {
        if (hasUpgrade("dev", 11) && resettingLayer != "dev") {
            layerDataReset("dev");
            player["dev"].upgrades = [11];
        }
    },
    upgrades: {
        11: {
            title: "Start development on TextWall",
            description: "Start generating characters at a rate of 1/s [PERMANENT]",
            cost: new Decimal(1)
        },
        12: {
            title: "Canvas",
            description: "Double your character gain.",
            cost: new Decimal(1),
            unlocked() {
                return hasUpgrade("dev", 11)
            }
        },
        13: {
            title: "Colors",
            description: "Multiply your character gain based on your development points.",
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
            description: "Triple your character gain.",
            cost: new Decimal(4),
            unlocked() {
                return hasUpgrade("dev", 13)
            }
        },
        22: {
            title: "Options",
            description: "Multiply your development point gain based on your characters.",
            cost: new Decimal(6),
            effect() {
                return player.points.add(1).pow(0.12)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("dev", 21)
            }
        },
        23: {
            title: "Other features",
            description: "Multiply your character gain based on itself.",
            cost: new Decimal(15),
            effect() {
                return player.points.add(10).log10().pow(1.4)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("dev", 22)
            }
        },
        31: {
            title: "Release",
            description: "Unlock the TextWall layer.",
            cost: new Decimal(100),
            unlocked() {
                return hasUpgrade("dev", 23)
            }
        }
    }
});
addLayer("tw", {
    name: "TextWall",
    symbol: "tw",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FFD635",
    requires: new Decimal(100),
    resource: "TextWallers",
    baseResource: "development points",
    baseAmount() {return player["dev"].points},
    type: "normal",
    exponent: 0.5,
    gainMult() {
        mult = new Decimal(1);
    	if (hasUpgrade("tw", 21)) mult = mult.mul(upgradeEffect("tw", 21));
    	if (hasUpgrade("tw", 23)) mult = mult.mul(upgradeEffect("tw", 23));
    	if (hasUpgrade("tw", 31)) mult = mult.mul(2);
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    hotkeys: [
        {key: "w", description: "W: Reset for TextWallers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("dev", 31) || hasUpgrade("tw", 11) || player[this.layer].points.neq(0)
    },
    branches: [["dev", 1]],
    upgrades: {
        11: {
            title: "<s>Nametags</s> Registration",
            description: "Multiply your characters by 4x and double your development points.",
            cost: new Decimal(1)
        },
        12: {
            title: "User Invitation",
            description: "Multiply your characters based on your TextWallers.",
            cost: new Decimal(5),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.375)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 11)
            }
        },
        13: {
            title: "User Invitation II",
            description: "Multiply your development points based on your TextWallers.",
            cost: new Decimal(15),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.275)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 12)
            }
        },
        21: {
            title: "Discovery by OWOTers",
            description: "Multiply your TextWallers based on your characters.",
            cost: new Decimal(35),
            effect() {
                return player.points.add(1.5).pow(0.07)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 13)
            }
        },
        22: {
            title: "Development Self-Synergy",
            description: "Multiply your development points based on itself.",
            cost: new Decimal(200),
            effect() {
                return player["dev"].points.add(1.5).pow(0.09)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 21)
            }
        },
        23: {
            title: "TextWallers Self-Synergy",
            description: "Multiply your TextWallers based on itself.",
            cost: new Decimal(5000),
            effect() {
                return player[this.layer].points.add(10).log10().pow(0.95)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 22)
            }
        },
        31: {
            title: "Generic Boost",
            description: "Double your characters, development points and TextWallers.",
            cost: new Decimal(20000),
            unlocked() {
                return hasUpgrade("tw", 23)
            }
        },
        32: {
            title: "Click Yes",
            description: "Unlock the click yes layer. [TBA]",
            cost: new Decimal("5e6"),
            unlocked() {
                return hasUpgrade("tw", 31)
            }
        }
    }
})