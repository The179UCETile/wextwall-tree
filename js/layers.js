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
        mult = mult.mul(temp["build"].effect[1]);
    	if (hasUpgrade("build", 21)) mult = mult.mul(5);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1);
    	if (hasUpgrade("spam", 23)) exp = exp.mul(1.015);
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for development points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    autoUpgrade() {return hasUpgrade("build", 11)},
    doReset(resettingLayer) {
        if (resettingLayer != "dev") {
            const keep = [];
            if (hasMilestone("build", 0)) keep.push("upgrades");
            if (hasMilestone("spam", 0)) keep.push("upgrades");
            layerDataReset("dev", keep)
        }
    },
    passiveGeneration() {
        return hasUpgrade("spam", 11) ? 1 : 0
    },
    upgrades: {
        11: {
            title: "Start development on TextWall",
            description: "Start generating characters at a rate of 1/s.",
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
                return player[this.layer].points.add(1.5).pow(hasUpgrade("build", 22) ? 0.65 : 0.55)
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
                return player.points.add(1).pow(hasUpgrade("build", 22) ? 0.16 : 0.12)
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
                return player.points.add(10).log10().pow(hasUpgrade("build", 22) ? 1.6 : 1.4)
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
        mult = mult.mul(temp["build"].effect[2]);
    	if (hasUpgrade("build", 13)) mult = mult.mul(2);
    	if (hasUpgrade("spam", 33)) mult = mult.mul(upgradeEffect("spam", 33));
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
        return hasUpgrade("dev", 31) || hasAchievement("ach", 12)
    },
    branches: ["dev"],
    softcap: new Decimal("1e9"),
    softcapPower: new Decimal("0.7"),
    upgrades: {
        11: {
            title: "<s>Nametags</s> Registration",
            description: "Multiply your characters by 4x and double your development points.",
            cost: new Decimal(1)
        },
        12: {
            title: "User Invitation",
            description: "Multiply your characters based on your TextWallers.",
            cost: new Decimal(4),
            effect() {
                return player[this.layer].points.add(1.5).pow(hasUpgrade("spam", 13) ? 0.425 : 0.375)
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
                return player[this.layer].points.add(1.5).pow(hasUpgrade("spam", 13) ? 0.35 : 0.275)
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
                return player.points.add(1.5).pow(hasUpgrade("spam", 13) ? 0.1 : 0.07)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 13)
            }
        },
        22: {
            title: "Development Self-Synergy",
            description: "Multiply your development points based on itself.",
            cost: new Decimal(70),
            effect() {
                return player["dev"].points.add(1.5).pow(hasUpgrade("spam", 13) ? 0.11 : 0.09)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 21)
            }
        },
        23: {
            title: "TextWallers Self-Synergy",
            description: "Multiply your TextWallers based on itself.",
            cost: new Decimal(1000),
            effect() {
                return player[this.layer].points.add(10).log10().pow(hasUpgrade("spam", 13) ? 1.05 : 0.95)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("tw", 22)
            }
        },
        31: {
            title: "Generic Boost",
            description: "Double your characters, development points and TextWallers.",
            cost: new Decimal(5000),
            unlocked() {
                return hasUpgrade("tw", 23)
            }
        },
        32: {
            title: "Builders and Spammers",
            description: "Unlock the builder layer and spammer layer. [TBA]",
            cost: new Decimal("1e6"),
            unlocked() {
                return hasUpgrade("tw", 31)
            }
        }
    }
});
addLayer("build", {
    name: "builder",
    symbol: "B",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        unlockOrder: 0
    }},
    color: "#00FFFF",
    requires() { return new Decimal("1e6").mul(player["build"].unlockOrder == 1 && !hasAchievement("ach", 22) ? "1e24" : 1) },
    resource: "builders",
    baseResource: "TextWallers",
    baseAmount() {return player["tw"].points},
    type: "static",
    base: 10,
    exponent() { return new Decimal("1.65").add(player["build"].unlockOrder == 1 && !hasAchievement("ach", 22) ? 0.175 : 0) },
    gainMult() {
        mult = new Decimal(1);
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    directMult() {
        mult = new Decimal(1);
        if (hasUpgrade("build", 23)) mult = mult.mul(1.5);
        return mult
    },
    row: 2,
    hotkeys: [
        {key: "b", description: "B: Reset for builders", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("tw", 32) || hasAchievement("ach", 14)
    },
    branches: ["tw"],
    canBuyMax() {
        return hasMilestone("build", 1)
    },
    increaseUnlockOrder: ["spam"],
    effect() {
        if (!player[this.layer].unlocked) return [new Decimal(1), new Decimal(1), new Decimal(1)];
        let eff = [Decimal.pow(3, player[this.layer].best),
            Decimal.pow(2, player[this.layer].best),
            Decimal.pow(1.5, player[this.layer].best)];
        if (hasUpgrade("build", 12)) {
            eff[0] = eff[0].mul(Decimal.pow(3, player[this.layer].total.plus(1).log(8).pow(1.4)));
            eff[1] = eff[1].mul(Decimal.pow(2, player[this.layer].total.plus(1).log(8).pow(1.4)));
            eff[2] = eff[2].mul(Decimal.pow(1.5, player[this.layer].total.plus(1).log(8).pow(1.4)));
        };
        if (player[this.layer].best.gte(20)) {
            eff[0] = Decimal.pow(3, eff[0].log(3).sub(20).div(player[this.layer].best.sub(20).div(30).add(1)).add(20));
            eff[1] = Decimal.pow(2, eff[1].log(2).sub(20).div(player[this.layer].best.sub(20).div(30).add(1)).add(20));
            eff[2] = Decimal.pow(1.5, eff[2].log(1.5).sub(20).div(player[this.layer].best.sub(20).div(30).add(1)).add(20));
        }
        return eff;
    },
    effectDescription() {
        return `which are boosting characters by ${format(temp[this.layer].effect[0])}x, development points by ${format(temp[this.layer].effect[1])}x and TextWallers by ${format(temp[this.layer].effect[2])}x based on your best builders${hasUpgrade("build", 12) ? " and total builders" : ""}.`
    },
    increaseUnlockOrder: ["spam"],
    upgrades: {
        11: {
            title: "Horizontal Road",
            description: "Automate development upgrades.",
            cost: new Decimal(1)
        },
        12: {
            title: "Diagonal Road",
            description: "Your total builders are now included inside the formula.",
            cost: new Decimal(1),
            unlocked() {
                return hasUpgrade("build", 11)
            }
        },
        13: {
            title: "Various lines on roads",
            description: "Raise your character gain by ^1.02 and multiply your TextWallers by 2x.",
            cost: new Decimal(3),
            unlocked() {
                return hasUpgrade("build", 12)
            }
        },
        21: {
            title: "Buildings",
            description: "Multiply your development points by 5x.",
            cost: new Decimal(5),
            unlocked() {
                return hasUpgrade("build", 13)
            }
        },
        22: {
            title: "Cities",
            description: "Boosts \"Colors\", \"Options\" and \"Other features\" upgrades.",
            cost: new Decimal(5),
            unlocked() {
                return hasUpgrade("build", 21)
            }
        },
        23: {
            title: "Unprecedented Spammers",
            description: "Multiply your builders by 1.25x. At this point you should be able to obtain spammers.",
            cost: new Decimal(7),
            unlocked() {
                return hasUpgrade("build", 22)
            }
        }
    },
    milestones: {
        0: {
            requirementDescription: "4 builders",
            effectDescription: "Keep your development upgrades on reset.",
            done() { return player[this.layer].points.gte(4)}
        },
        1: {
            requirementDescription: "10 builders",
            effectDescription: "You can now buy max builders.",
            done() { return player[this.layer].points.gte(10)}
        }
    }
});
addLayer("spam", {
    name: "spammer",
    symbol: "S",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        unlockOrder: 0
    }},
    color: "#FF0000",
    requires() { return new Decimal("1e6").mul(player["spam"].unlockOrder == 1 && !hasAchievement("ach", 22) ? "1e24" : 1) },
    resource: "spammers",
    baseResource: "TextWallers",
    baseAmount() {return player["tw"].points},
    type: "normal",
    exponent() { return new Decimal("0.3").sub(player["spam"].unlockOrder == 1 && !hasAchievement("ach", 22) ? 0.1 : 0) },
    gainMult() {
        mult = new Decimal(1);
        if (hasUpgrade("spam", 21)) mult = mult.mul(upgradeEffect("spam", 21));
        if (hasUpgrade("spam", 22)) mult = mult.mul(upgradeEffect("spam", 22));
        if (hasUpgrade("spam", 31)) mult = mult.mul(upgradeEffect("spam", 31));
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2,
    hotkeys: [
        {key: "s", description: "S: Reset for spammers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("tw", 32) || hasAchievement("ach", 14)
    },
    branches: ["tw"],
    increaseUnlockOrder: ["build"],
    softcap: new Decimal("5e12"),
    softcapPower: new Decimal("0.4"),
    upgrades: {
        11: {
            title: "Character Spam",
            description: "Automatically gain 100% of your development points per second. Also multiplies your character gain by 8x.",
            cost: new Decimal(1)
        },
        12: {
            title: "Word Spam",
            description: "Multiply your characters based on your spammers.",
            cost: new Decimal(15),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.85)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("spam", 11)
            }
        },
        13: {
            title: "Phrase Spam",
            description: "Improve all upgrades in the TextWall layer that uses a formula.",
            cost: new Decimal(30),
            unlocked() {
                return hasUpgrade("spam", 12)
            }
        },
        21: {
            title: "Character Spam II",
            description: "Multiply your spammers based on your characters.",
            cost: new Decimal(650),
            effect() {
                return player.points.add(1.5).pow(0.035)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("spam", 13)
            }
        },
        22: {
            title: "Word Spam II",
            description: "Multiply your spammers based on your development points.",
            cost: new Decimal("2e4"),
            effect() {
                return player["dev"].points.add(1.5).pow(0.03)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("spam", 21)
            }
        },
        23: {
            title: "Phrase Spam II",
            description: "Raise your developer points by ^1.015.",
            cost: new Decimal("1e6"),
            unlocked() {
                return hasUpgrade("spam", 22)
            }
        },
        31: {
            title: "Spam Wave",
            description: "Multiply your spammers based on itself.",
            cost: new Decimal("5e7"),
            effect() {
                return player[this.layer].points.add(10).log10().pow(1.35)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("spam", 23)
            }
        },
        32: {
            title: "Spam Wave II",
            description: "Multiply your developer points based on your spammers.",
            cost: new Decimal("1e11"),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.7)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("spam", 31)
            }
        },
        33: {
            title: "Spam Wave III",
            description: "Multiply your TextWallers based on your spammers. At this point you should be able to obtain builders.",
            cost: new Decimal("2.5e12"),
            effect() {
                return player[this.layer].points.add(1.5).pow(0.5)
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked() {
                return hasUpgrade("spam", 32)
            }
        }
    },
    milestones: {
        0: {
            requirementDescription: "10,000 spammers",
            effectDescription: "Keep your development upgrades on reset.",
            done() { return player[this.layer].points.gte("1e4")}
        }
    }
});
addLayer("clickyes", {
    name: "click yes",
    symbol: "CY",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0)
    }},
    color: "#00FF00",
    requires: new Decimal("1e250"),
    resource: "yes button clicks",
    baseResource: "TextWallers",
    baseAmount() {return player["tw"].points},
    type: "normal",
    exponent: new Decimal("0.01"),
    gainMult() {
        mult = new Decimal(1);
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    hotkeys: [
        {key: "y", description: "Y: Reset for yes button clicks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return (hasUpgrade("spam", 33) && hasUpgrade("build", 23) && player["tw"].points.gte("1e150")) || hasAchievement("ach", 22)
    },
    branches: ["tw", "spam"],
    doReset(resettingLayer) {
        if (resettingLayer == "clickyes") {
            layerDataReset("dev");
            layerDataReset("tw");
            layerDataReset("build");
            up = player.spam.upgrades;
            layerDataReset("spam", ["milestones"]);
            if (up.includes(11)) {
                player.spam.upgrades = [11]
            }
        }
    },
    upgrades: {
        11: {
            title: "/click yes spam",
            description: "Multiply your TextWallers by 10x and double your spammers.",
            cost: new Decimal(1)
        }
    }
});
addLayer("ach", {
    startData() {return {
        unlocked: true
    }},
    color: "#FFFF00",
    row: "side",
    layerShown() {return true},
    symbol: "A",
    tooltip() {
        return "Achievements"
    },
    achievements: {
        11: {
            name: "The beginning",
            done() { return hasUpgrade("dev", 11) },
            tooltip: "Start generating characters."
        },
        12: {
            name: "Welcome to TextWall",
            done() { return player["tw"].points.gte(1) },
            tooltip: "Reset for TextWallers."
        },
        13: {
            name: "That's a lot of TextWallers",
            done() { return player["tw"].points.gte("1e6") },
            tooltip: "Get 1,000,000 TextWallers."
        },
        14: {
            name: "Which one?",
            done() { return player["build"].points.gte(1) || player["spam"].points.gte(1) },
            tooltip: "Reset for either Builders or Spammers."
        },
        15: {
            name: "Both.",
            done() { return player["build"].unlocked && player["spam"].unlocked },
            tooltip: "Unlock both Builders and Spammers."
        },
        21: {
            name: "<span style='font-size:0.8em'>I don't think the server can handle this many TextWallers</span>",
            done() { return player["tw"].points.gte("1e100") },
            tooltip: "Get 1e100 TextWallers."
        },
        22: {
            name: "Should we make a game?",
            done() { return player["clickyes"].points.gte(1) },
            tooltip: "Reset for yes button clicks.<br>REWARD: Builder layer and spammer layer no longer increase eachother's requirements.",
            image: "/ach/22.png"
        }
    },
    tabFormat: [
		"blank", 
		["display-text", function() { return "Achievements: "+player.ach.achievements.length+"/"+(Object.keys(tmp.ach.achievements).length - 2) }], 
		"blank", "blank",
		"achievements",
	],
})