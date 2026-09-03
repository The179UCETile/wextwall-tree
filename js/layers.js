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
    	if (hasUpgrade("clickyes", 11)) mult = mult.mul(3);
    	if (hasUpgrade("clickyes", 12)) mult = mult.mul(5);
    	if (hasUpgrade("bzuki", 13)) mult = mult.mul(upgradeEffect("bzuki", 13));
    	//if (hasUpgrade("cyod", 11)) mult = mult.mul(upgradeEffect("cyod", 11));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1);
    	if (hasUpgrade("spam", 23)) exp = exp.mul(1.015);
    	if (challengeCompletions("clickyes", 11) >= 1) exp = exp.mul(1.05);
    	if (hasUpgrade("bzuki", 11)) exp = exp.mul(1.05);
    	if (hasUpgrade("lime", 11)) exp = exp.mul(1.075);
        if (inChallenge("clickyes", 11)) exp = exp.mul(0.65);
        if (inChallenge("clickyes", 31)) exp = exp.mul(0.5);
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for development points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    autoUpgrade() {return hasUpgrade("build", 11) || hasMilestone("clickyes", 0) || hasAchievement("ach", 24)},
    doReset(resettingLayer) {
        if (resettingLayer != "dev") {
            const keep = [];
            if (hasMilestone("build", 0)) keep.push("upgrades");
            if (hasMilestone("spam", 0)) keep.push("upgrades");
            if (hasMilestone("clickyes", 0)) keep.push("upgrades");
            if (hasAchievement("ach", 24)) keep.push("upgrades");
            layerDataReset("dev", keep)
        }
    },
    passiveGeneration() {
        return hasUpgrade("spam", 11) || hasMilestone("clickyes", 0)  || hasAchievement("ach", 24) ? 1 : 0
    },
    softcap: new Decimal("1e1000"),
    softcapPower: new Decimal(0.675),
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
                let eff = player[this.layer].points.add(1.5).pow(0.55);
                if (hasUpgrade("build", 22)) eff = eff.pow(0.6 / 0.55);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
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
                let eff = player.points.add(1).pow(0.12);
                if (hasUpgrade("build", 22)) eff = eff.pow(0.15 / 0.12);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("dev", 21)
            }
        },
        23: {
            title: "Other features",
            description: "Multiply your character gain based on itself.",
            cost: new Decimal(15),
            effect() {
                let eff = player.points.add(10).log10().pow(1.4);
                if (hasUpgrade("build", 22)) eff = eff.pow(1.5 / 1.4);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
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
        },
        32: {
            title: "Chat",
            description: "Multiply your builders based on your development points.",
            effect() {
                return player[this.layer].points.add(10).log10().add(10).log10().pow(0.4)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            cost: new Decimal("1e2450"),
            unlocked() {
                return hasUpgrade("clickyes", 41) && hasUpgrade("dev", 31)
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
    autoUpgrade() {return hasMilestone("clickyes", 1) || hasAchievement("ach", 24)},
    passiveGeneration() {
        return hasMilestone("clickyes", 3) || hasAchievement("ach", 24) ? 1 : 0
    },
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
    	if (hasUpgrade("clickyes", 11)) mult = mult.mul(10);
    	if (hasUpgrade("clickyes", 12)) mult = mult.mul(5);
    	if (hasUpgrade("clickyes", 13)) mult = mult.mul(upgradeEffect("clickyes", 13));
    	if (hasUpgrade("bzuki", 13)) mult = mult.mul(upgradeEffect("bzuki", 13));
        mult = mult.mul(buyableEffect("bzuki", 12)[2]);
    	//if (hasUpgrade("cyod", 21)) mult = mult.mul(upgradeEffect("cyod", 21));
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
    	if (hasUpgrade("bzuki", 11)) exp = exp.mul(1.05);
	    if (challengeCompletions("clickyes", 31) >= 1) exp = exp.mul(challengeEffect("clickyes", 31)[1]);
        if (inChallenge("clickyes", 11)) exp = exp.mul(0.65);
        if (inChallenge("clickyes", 31)) exp = exp.mul(0.5);
        return exp
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
    doReset(resettingLayer) {
        if (resettingLayer != "tw") {
            const keep = [];
            if (hasAchievement("ach", 24)) keep.push("upgrades");
            layerDataReset("tw", keep)
        }
    },
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
                let eff = player[this.layer].points.add(1.5).pow(0.375);
                if (hasUpgrade("spam", 13)) eff = eff.pow(0.425 / 0.375);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("tw", 11)
            }
        },
        13: {
            title: "User Invitation II",
            description: "Multiply your development points based on your TextWallers.",
            cost: new Decimal(15),
            effect() {
                let eff = player[this.layer].points.add(1.5).pow(0.275);
                if (hasUpgrade("spam", 13)) eff = eff.pow(0.35 / 0.275);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("tw", 12)
            }
        },
        21: {
            title: "Discovery by OWOTers",
            description: "Multiply your TextWallers based on your characters.",
            cost: new Decimal(35),
            effect() {
                let eff = player.points.add(1.5).pow(0.07);
                if (hasUpgrade("spam", 13)) eff = eff.pow(0.1 / 0.07);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("tw", 13)
            }
        },
        22: {
            title: "Development Self-Synergy",
            description: "Multiply your development points based on itself.",
            cost: new Decimal(70),
            effect() {
                let eff = player["dev"].points.add(1.5).pow(0.09);
                if (hasUpgrade("spam", 13)) eff = eff.pow(0.11 / 0.09);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("tw", 21)
            }
        },
        23: {
            title: "TextWallers Self-Synergy",
            description: "Multiply your TextWallers based on itself.",
            cost: new Decimal(1000),
            effect() {
                let eff = player[this.layer].points.add(10).log10().pow(0.95);
                if (hasUpgrade("spam", 13)) eff = eff.pow(1.05 / 0.95);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
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
            description: "Unlock the builder layer and spammer layer.",
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
    requires() { return new Decimal("1e6").mul(player["build"].unlockOrder == 1 && !hasAchievement("ach", 22) ? "1e19" : 1) },
    resource: "builders",
    baseResource: "TextWallers",
    baseAmount() {return player["tw"].points},
    type: "static",
    base: 10,
    exponent() { return new Decimal("1.6").add(player["build"].unlockOrder == 1 && !hasAchievement("ach", 22) ? 0.175 : 0) },
    gainMult() {
        mult = new Decimal(1);
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    directMult() {
        mult = new Decimal(1);
        if (hasUpgrade("build", 23)) mult = mult.mul(1.25);
    	if (hasUpgrade("clickyes", 12)) mult = mult.mul(1.4);
        if (hasUpgrade("clickyes", 23)) mult = mult.mul(upgradeEffect("clickyes", 23)[1]);
        if (hasUpgrade("clickyes", 31)) mult = mult.mul(upgradeEffect("clickyes", 31)[0]);
        if (hasUpgrade("dev", 32)) mult = mult.mul(upgradeEffect("dev", 32));
        if (hasUpgrade("bzuki", 11)) mult = mult.mul(1.4);
        if (hasUpgrade("bzuki", 22)) mult = mult.mul(2);
        mult = mult.mul(buyableEffect("bzuki", 12)[1]);
        if (hasUpgrade("bzuki", 33)) mult = mult.mul(upgradeEffect("bzuki", 33));
        if (hasUpgrade("lime", 11)) mult = mult.mul(2);
        if (challengeCompletions("lime", 11) >= 1) mult = mult.mul(challengeEffect("lime", 11)[2]);
        //if (hasUpgrade("cyod", 34)) mult = mult.mul(upgradeEffect("cyod", 34));
        if (inChallenge("clickyes", 21)) mult = mult.mul(0.75);
        if (inChallenge("clickyes", 31)) mult = mult.mul(0.5);
        if (inChallenge("lime", 11)) mult = mult.div(100);
        return mult
    },
    autoUpgrade() {return hasMilestone("bzuki", 2) || hasMilestone("lime", 0)},
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
    buildEffectSoftcap() {
        let softcap = new Decimal(17);
        if (hasMilestone("clickyes", 2)) softcap = softcap.add(5);
        if (hasUpgrade("clickyes", 23)) softcap = softcap.add(upgradeEffect("clickyes", 23)[0]);
        return [softcap, new Decimal(25000)];
    },
    buildEffectSoftcapPower() {
        let power = temp[this.layer].buildEffectSoftcap[0].div(17).recip().div(5);
        if (power.lte(0.05)) power = Decimal.sub(0.05, Decimal.sub(0.05, power).pow(2))
        return [Decimal.sub(1, power), new Decimal(0.5)];
    },
    effect() {
        if (!player[this.layer].unlocked) return [new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(0)];
        let actualBuilders = player[this.layer].best;
        if (hasUpgrade("build", 12)) {
            actualBuilders = actualBuilders.add(player[this.layer].total.plus(1).log(5).pow(1.4))
        };
        let softcap = temp[this.layer].buildEffectSoftcap;
        if (actualBuilders.gte(softcap[0])) {
            actualBuilders = actualBuilders.sub(softcap[0]).pow(temp[this.layer].buildEffectSoftcapPower[0]).add(softcap[0]);
        }
        if (actualBuilders.gte(softcap[1])) {
            actualBuilders = actualBuilders.div(softcap[1]).pow(temp[this.layer].buildEffectSoftcapPower[1]).mul(softcap[1]);
        }
        let eff = [Decimal.pow(3, actualBuilders),
            Decimal.pow(2, actualBuilders),
            Decimal.pow(1.5, actualBuilders),
            actualBuilders];
        return eff;
    },
    effectDescription() {
        return `which are boosting characters by ${format(temp[this.layer].effect[0])}x, development points by ${format(temp[this.layer].effect[1])}x and TextWallers by ${format(temp[this.layer].effect[2])}x based on your best builders${hasUpgrade("build", 12) ? " and total builders" : ""}.${temp[this.layer].effect[3].gte(temp[this.layer].buildEffectSoftcap[0]) || temp[this.layer].effect[3].gte(temp[this.layer].buildEffectSoftcap[1]) ? ` <span class='softcap'>(softcapped${temp[this.layer].effect[3].gte(temp[this.layer].buildEffectSoftcap[1]) ? "<sup>2</sup>" : ""})</span>` : ""}`
    },
    increaseUnlockOrder: ["spam"],
    doReset(resettingLayer) {
        if (resettingLayer != "build" && resettingLayer != "spam") {
            const keep = [];
            if (hasMilestone("clickyes", 0)) keep.push("milestones");
            if (hasAchievement("ach", 24)) keep.push("milestones");
            layerDataReset("build", keep)
        }
    },
    resetsNothing() {
        return hasMilestone("bzuki", 3) || hasMilestone("lime", 0)
    },
    autoPrestige() {
        return hasMilestone("bzuki", 3) || hasMilestone("lime", 0)
    },
    upgrades: {
        11: {
            title: "Horizontal Road",
            description: "Automate development layer upgrades.",
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
            title: "/counting",
            description: "Multiply your builders by 1.25x. At this point you should be able to obtain spammers.",
            cost: new Decimal(6),
            unlocked() {
                return hasUpgrade("build", 22)
            }
        },
        31: {
            title: "Zalan145",
            description: "Improve \"General Boost\" builder boost and the \"Acceleration IV\" upgrade.",
            cost: new Decimal("1e17"),
            unlocked() {
                return hasUpgrade("lime", 42)
            }
        }
    },
    milestones: {
        0: {
            requirementDescription() { return `${formatWhole(4)} builders` },
            effectDescription: "Keep your development upgrades on reset.",
            done() { return player[this.layer].points.gte(4)}
        },
        1: {
            requirementDescription() { return `${formatWhole(8)} builders` },
            effectDescription: "You can now buy max builders.",
            done() { return player[this.layer].points.gte(8)}
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
    requires() { return new Decimal("1e6").mul(player["spam"].unlockOrder == 1 && !hasAchievement("ach", 22) ? "1e19" : 1) },
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
    	if (hasUpgrade("clickyes", 11)) mult = mult.mul(3);
    	if (challengeCompletions("clickyes", 11) >= 1) mult = mult.mul(challengeEffect("clickyes", 11));
        if (hasUpgrade("clickyes", 31)) mult = mult.mul(upgradeEffect("clickyes", 31)[1]);
        if (hasUpgrade("bzuki", 11)) mult = mult.mul(15);
        if (hasUpgrade("lime", 11)) mult = mult.mul(25);
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
    	if (hasUpgrade("clickyes", 13)) exp = exp.mul(1.02);
    	if (hasUpgrade("bzuki", 12)) exp = exp.mul(1.05);
        if (inChallenge("clickyes", 21)) exp = exp.mul(0.55);
        if (inChallenge("clickyes", 31)) exp = exp.mul(0.5);
        return exp
    },
    autoUpgrade() {return hasMilestone("bzuki", 2) || hasMilestone("lime", 0)},
    passiveGeneration() {
        return hasMilestone("bzuki", 3) || hasMilestone("lime", 0) ? 1 : 0
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
    doReset(resettingLayer) {
        if (resettingLayer != "build" && resettingLayer != "spam") {
            const keep = [];
            if (hasMilestone("clickyes", 0)) keep.push("milestones");
            if (hasAchievement("ach", 24)) keep.push("milestones");
            layerDataReset("spam", keep)
        }
    },
    upgrades: {
        11: {
            title: "Character Spam",
            description: "Automatically gain 100% of your development points you get on reset per second. Also multiplies your character gain by 8x.",
            cost: new Decimal(1)
        },
        12: {
            title: "Word Spam",
            description: "Multiply your characters based on your best spammers.",
            cost: new Decimal(15),
            effect() {
                return player[this.layer].best.add(1.5).pow(0.85)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
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
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("spam", 13)
            }
        },
        22: {
            title: "Word Spam II",
            description: "Multiply your spammers based on your development points.",
            cost: new Decimal("2e4"),
            effect() {
                return player.dev.points.add(1.5).pow(0.03)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("spam", 21)
            }
        },
        23: {
            title: "Phrase Spam II",
            description: "Raise your development points by ^1.015.",
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
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("spam", 23)
            }
        },
        32: {
            title: "Spam Wave II",
            description: "Multiply your development points based on your best spammers. At this point you should be able to obtain builders.",
            cost: new Decimal("1e11"),
            effect() {
                return player[this.layer].best.add(1.5).pow(0.55)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("spam", 31)
            }
        },
        33: {
            title: "Spam Wave III",
            description: "Multiply your TextWallers based on your best spammers.",
            cost: new Decimal("2.5e12"),
            effect() {
                return player[this.layer].best.add(1.5).pow(0.45)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("spam", 32)
            }
        }
    },
    milestones: {
        0: {
            requirementDescription() { return `${formatWhole(10000)} spammers` },
            effectDescription: "Keep your development upgrades on reset.",
            done() { return player[this.layer].points.gte("1e4")}
        }
    }
});
addLayer("clickyes", {
    name: "click yes",
    symbol: "Y",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0)
    }},
    color() {
        if (hasUpgrade("lime", 21)) return "#709070";
        return "#00FF00";
    },
    requires: new Decimal("1e150"),
    resource() {
        const chars = "ABCDEFGIHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        if (hasUpgrade("lime", 21)) return "yes button clicks".split("").map(a => a != " " && Math.random() < 0.5 ? chars[Math.floor(Math.random() * chars.length)] : a).join("");
        return "yes button clicks";
    },
    baseResource: "TextWallers",
    baseAmount() {return player["tw"].points},
    type() { 
        if (hasUpgrade("lime", 21)) return "none";
        return "custom";
    },
    autoUpgrade() {return hasUpgrade("lime", 21)},
    update(diff) {
        if (hasUpgrade("lime", 21)) {
            player[this.layer].points = player[this.layer].points.add(upgradeEffect("lime", 21).mul(diff));
            player[this.layer].total = player[this.layer].total.add(upgradeEffect("lime", 21).mul(diff));
            player[this.layer].best = Decimal.max(player[this.layer].best, player[this.layer].points);
        }
    },
    logarithm: new Decimal("1e15"),
    getResetGain() {
        let thisLayer = layers[this.layer];
        return temp[this.layer].baseAmount.gte(thisLayer.requires) ? Decimal.max(0, temp[this.layer].baseAmount.div(thisLayer.requires).log10().div(thisLayer.logarithm.log10()).mul(temp[this.layer].gainMult.pow(temp[this.layer].gainExp)).add(1).floor()) : new Decimal(0);
    },
    getNextAt() {
        let thisLayer = layers[this.layer];
        return Decimal.max(thisLayer.requires, Decimal.pow(thisLayer.logarithm, temp[this.layer].getResetGain).pow(temp[this.layer].gainMult.pow(temp[this.layer].gainExp).recip()).mul(thisLayer.requires));
    },
    canReset() {
        return temp[this.layer].baseAmount.gte(layers[this.layer].requires)
    },
    prestigeNotify() {
        return !hasUpgrade("lime", 21) && temp[this.layer].getResetGain.gte(player[this.layer].points.div(10)) && temp[this.layer].getResetGain.neq(0)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(1000)) {
            return `+<b>${formatWhole(temp[this.layer].getResetGain)}</b> ${temp[this.layer].resource}`
        } else if (temp[this.layer].getResetGain.gte(100)) {
            return `Reset for +<b>${formatWhole(temp[this.layer].getResetGain)}</b> ${temp[this.layer].resource}`
        } else {
            return `Reset for +<b>${formatWhole(temp[this.layer].getResetGain)}</b> ${temp[this.layer].resource}<br><br>
            Next at ${format(temp[this.layer].getNextAt)} ${layers[this.layer].baseResource}`
        }
    },
    gainMult() {
        mult = new Decimal(1);
        if (hasUpgrade("clickyes", 21)) mult = mult.mul(upgradeEffect("clickyes", 21));
    	if (challengeCompletions("clickyes", 11) >= 1) mult = mult.mul(2);
	    if (challengeCompletions("clickyes", 21) >= 1) mult = mult.mul(challengeEffect("clickyes", 21));
	    if (challengeCompletions("clickyes", 31) >= 1) mult = mult.mul(challengeEffect("clickyes", 31)[0]);
        if (hasUpgrade("clickyes", 32)) mult = mult.mul(upgradeEffect("clickyes", 32));
        if (hasUpgrade("clickyes", 33)) mult = mult.mul(2);
        if (hasUpgrade("bzuki", 11)) mult = mult.mul(2);
        if (hasUpgrade("bzuki", 12)) mult = mult.mul(upgradeEffect("bzuki", 12));
        mult = mult.mul(buyableEffect("bzuki", 12)[0]);
        if (hasUpgrade("lime", 11)) mult = mult.mul(3);
        if (hasUpgrade("lime", 12)) mult = mult.mul(3);
        if (hasUpgrade("lime", 14)) mult = mult.mul(upgradeEffect("lime", 14));
        //if (hasUpgrade("cyod", 13)) mult = mult.mul(upgradeEffect("cyod", 13));
        //if (getBuyableAmount("cyod", 11).gte(1)) mult = mult.mul(buyableEffect("cyod", 11)[0]);
        return mult
    },
    gainExp() {
        let exp = new Decimal(1);
        if (hasUpgrade("bzuki", 43)) exp = exp.mul(1.025);
        return exp
    },
    row: 3,
    hotkeys: [
        {key: "y", description: "Y: Reset for yes button clicks", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked(){return !hasUpgrade("lime", 21)}},
    ],
    layerShown() {
        return (hasUpgrade("spam", 33) && hasUpgrade("build", 23) && player["tw"].points.gte("1e100")) || hasAchievement("ach", 22)
    },
    branches: [["tw", 2], ["spam", 1]],
    doReset(resettingLayer) {
        if (resettingLayer != "clickyes") {
            const keep = [];
            if (hasMilestone("bzuki", 0)) keep.push("challenges");
            if (hasMilestone("bzuki", 1)) keep.push("milestones");
            if (hasMilestone("lime", 1)) keep.push("milestones");
            if (hasUpgrade("lime", 21)) keep.push("challenges");
            if (hasUpgrade("lime", 21)) keep.push("upgrades");
            layerDataReset("clickyes", keep)
        }
    },
    upgrades: {
        11: {
            title: "/click yes spam",
            description: "Multiply your TextWallers by 10x and triple your development points and spammers.",
            cost: new Decimal(1)
        },
        12: {
            title: "Click Yes Exports",
            description: "Raise your characters gain by ^1.025, multiply your development points, TextWallers by 5x and multiply your builders by 1.4x.",
            cost: new Decimal(3),
            unlocked() {
                return hasUpgrade("clickyes", 11)
            }
        },
        13: {
            title: "Blue Shep",
            description() { return `Raise your spammers by ^1.02 and multiply your TextWallers based on your total ${temp.clickyes.resource}.` },
            cost: new Decimal(8),
            effect() {
                return player[this.layer].total.add(1.5).pow(7)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("clickyes", 12)
            }
        },
        21: {
            title: "Giant Click Yes Sign",
            description() { return `Multiply your ${temp.clickyes.resource} based on your characters.` },
            cost: new Decimal(15),
            effect() {
                return player.points.add(10).log10().pow(0.0775)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("clickyes", 13)
            }
        },
        22: {
            title: "Yellow Shep",
            description: "Unlock Click Yes Challenges.",
            cost: new Decimal(55),
            unlocked() {
                return hasUpgrade("clickyes", 21)
            }
        },
        23: {
            title: "Super-Click Yes",
            description() { return `Delay the builder effect softcap based on your total ${temp.clickyes.resource} and multiply your builders based on your total ${temp.clickyes.resource}.` },
            cost: new Decimal(85),
            effect() {
                let yesButtonClickAmt = player[this.layer].total;
                if (yesButtonClickAmt.gte("1e6")) yesButtonClickAmt = yesButtonClickAmt.sub("1e6").pow(0.75).add("1e6");
                let eff = [yesButtonClickAmt.add(1.5).pow(0.5), yesButtonClickAmt.add(10).log10().pow(0.525)];
                if (hasUpgrade("clickyes", 33)) {
                    eff[0] = eff[0].pow(0.65 / 0.5);
                    eff[1] = eff[1].pow(0.6 / 0.525)
                };
                if (false /*hasUpgrade("cyod", 22)*/) {
                    eff[0] = eff[0].pow(0.7 / 0.65);
                    eff[1] = eff[1].pow(0.7 / 0.6)
                };
                return eff;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id)[0])}, x${format(upgradeEffect(this.layer, this.id)[1])}${player[this.layer].points.gte("1e6") ? " <span class='softcap'>(softcapped)</span>" : ""}` },
            unlocked() {
                return hasUpgrade("clickyes", 22)
            }
        },
        31: {
            title: "/click yes spam Expansion",
            description: "Multiply your builders based on your spammers and vice versa.",
            cost: new Decimal(150),
            effect() {
                const ptsForEff = [player.spam.points, player.build.points];
                if (player.spam.points.gte("1e5000")) {
                    ptsForEff[0] = ptsForEff[0].div("1e5000").pow(0.45).mul("1e5000")
                };
                if (player.build.points.gte("20000")) {
                    ptsForEff[1] = ptsForEff[1].div("20000").pow(0.4).mul("20000")
                };
                const eff = [ptsForEff[0].add(10).log10().pow(0.085), Decimal.pow(1.625, ptsForEff[1].add(1).pow(0.925))];
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id)[0])}, x${format(upgradeEffect(this.layer, this.id)[1])}${player.spam.points.gte("1e5000") || player.build.points.gte("20000") ? " <span class='softcap'>(softcapped)</span>" : ""}` },
            unlocked() {
                return hasUpgrade("clickyes", 23)
            }
        },
        32: {
            title() { return `Clicking Yes ${options.badNotation == "True179ucStandard" ? "179uc" : "179UCe"} Times` },
            description() { return `Multiply your ${temp.clickyes.resource} based on the amount of click yes layer upgrades bought.` },
            cost: new Decimal(250),
            effect() {
                return Decimal.pow(1.12, player[this.layer].upgrades.length);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("clickyes", 31)
            }
        },
        33: {
            title: "CLICK YES CLICK YES",
            description() { return `Improve "Super-Click Yes" and double your ${temp.clickyes.resource}.` },
            cost: new Decimal(1000),
            unlocked() {
                return hasUpgrade("clickyes", 32)
            }
        },
        41: {
            title: "New Update",
            description: "Unlock a new development layer upgrade.",
            cost: new Decimal(5000),
            unlocked() {
                return challengeCompletions("clickyes", 31) >= 1
            }
        },
        42: {
            title: "Bzuki",
            description: "Unlock the Bzuki layer.",
            cost: new Decimal(25000),
            unlocked() {
                return challengeCompletions("clickyes", 31) >= 2
            }
        }
    },
    milestones: {
        0: {
            requirementDescription() { return `${formatWhole(1)} ${temp.clickyes.resource}` },
            effectDescription: "Automate the entirety of the development layer and keep builder and spammer milestones on reset.",
            done() { return player[this.layer].points.gte(1) }
        },
        1: {
            requirementDescription() { return `${formatWhole(8)} ${temp.clickyes.resource}` },
            effectDescription: "Automate TextWall layer upgrades.",
            done() { return player[this.layer].points.gte(8) }
        },
        2: {
            requirementDescription() { return `${formatWhole(25)} ${temp.clickyes.resource}` },
            effectDescription: "Nerf builder effect softcap.",
            done() { return player[this.layer].points.gte(25) }
        },
        3: {
            requirementDescription() { return `${formatWhole(100)} ${temp.clickyes.resource}` },
            effectDescription: "Automatically gain 100% of your TextWallers you get on reset per second.",
            done() { return player[this.layer].points.gte(100) }
        }
    },
    challenges: {
        11: {
            name: "Click No",
            challengeDescription: "Your development points and TextWallers are raised by ^0.65.",
            goalDescription() { return `${format("1e10")} spammers` },
            rewardDescription() { return `Raise your development points by ^1.05, your ${temp.clickyes.resource} by 2x and multiply your spammers based on your total ${temp.clickyes.resource}.` },
            canComplete() { return player.spam.points.gte("1e10") },
            rewardEffect() {
                return player[this.layer].total.add(1.5).pow(3.5)
            },
            rewardDisplay() { return `x${format(challengeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("clickyes", 22)
            }
        },
        21: {
            name: "/click no spam",
            challengeDescription: "Your builders are multiplied by x0.75, your spammers and characters are raised by ^0.55.",
            goalDescription() { return `${format("1e19")} spammers` },
            rewardDescription() { return `Multiply your ${temp.clickyes.resource} based on your spammers and raise your characters by ^1.05.` },
            canComplete() { return player.spam.points.gte("1e19") },
            rewardEffect() {
                return player.spam.points.add(10).log10().pow(0.095)
            },
            rewardDisplay() { return `x${format(challengeEffect(this.layer, this.id))}` },
            unlocked() {
                return challengeCompletions("clickyes", 11) >= 1
            }
        },
        31: {
            name: "July 2021 DDoS Attack",
            challengeDescription: "Raise your characters, development points, TextWallers, spammers by ^0.5 and your builders are multiplied by x0.5.",
            completionLimit: 5,
            goalDescription() { return `${format(new Decimal("1e10").mul(Decimal.pow(1000, new Decimal(challengeCompletions("clickyes", 31)).pow(1.5))))} spammers` },
            rewardDescription() { return `Multiply your ${temp.clickyes.resource} and raise your TextWallers based on challenge completions.` },
            canComplete() { return player.spam.points.gte(new Decimal("1e10").mul(Decimal.pow(1000, new Decimal(challengeCompletions("clickyes", 31)).pow(1.5)))) },
            rewardEffect() {
                return [Decimal.pow(1.4, challengeCompletions("clickyes", 31)), new Decimal([1, 1.05, 1.1, 1.15, 1.19, 1.23][challengeCompletions("clickyes", 31)])]
            },
            rewardDisplay() { return `x${format(challengeEffect(this.layer, this.id)[0])} to ${temp.clickyes.resource}, ^${format(challengeEffect(this.layer, this.id)[1])} to your TextWallers.` },
            unlocked() {
                return challengeCompletions("clickyes", 21) >= 1
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return `You have ${format(temp[this.layer].baseAmount)} ${layers[this.layer].baseResource}` }, {"margin": "5px 0", "display": "block", "width": "100%", "height": "20px"}],
                "milestones",
                "upgrades"
            ]
        },
        "Challenges": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return `You have ${format(temp[this.layer].baseAmount)} ${layers[this.layer].baseResource}` }, {"margin": "5px 0", "display": "block", "width": "100%", "height": "20px"}],
                "challenges"
            ],
            unlocked() {
                return hasUpgrade("clickyes", 22)
            }
        }
    }
});
addLayer("bzuki", {
    name: "bzuki",
    symbol: "Bz",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#00CC78",
    requires: new Decimal(15000),
    resource: "Bzuki points",
    baseResource() {return temp.clickyes.resource},
    baseAmount() {return player.clickyes.points},
    type: "normal",
    exponent: 0.5,
    gainMult() {
        mult = new Decimal(1);
        if (hasUpgrade("bzuki", 31)) mult = mult.mul(upgradeEffect("bzuki", 31)[0]);
        if (hasUpgrade("bzuki", 41)) mult = mult.mul(upgradeEffect("bzuki", 41));
        if (hasUpgrade("bzuki", 42)) mult = mult.mul(upgradeEffect("bzuki", 42));
        if (hasUpgrade("lime", 11)) mult = mult.mul(1.5);
        if (hasUpgrade("lime", 12)) mult = mult.mul(upgradeEffect("lime", 12));
        if (getBuyableAmount("bzuki", 21).gte(1)) mult = mult.mul(buyableEffect("bzuki", 21)[1]);
        if (hasUpgrade("lime", 32)) mult = mult.mul(upgradeEffect("lime", 32));
        if (challengeCompletions("lime", 11) >= 1) mult = mult.mul(challengeEffect("lime", 11)[1]);
        if (inChallenge("lime", 11)) mult = mult.div(100);
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
        return exp
    },
    row: 4,
    hotkeys: [
        {key: "B", description: "Shift + B: Reset for Bzuki points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("clickyes", 42) || hasAchievement("ach", 24)
    },
    branches: [["tw", 2], ["build", 1]],
    doReset(resettingLayer) {
        if (resettingLayer != "bzuki") {
            const keep = [];
            if (hasMilestone("lime", 2)) keep.push("milestones");
            layerDataReset("bzuki", keep)
        }
    },
    softcap: new Decimal("1e7"),
    softcapPower: new Decimal(0.6),
    upgrades: {
        11: {
            title: "A Veteran TextWaller",
            description() { return `Raise your TextWallers and development points by ^1.05 and multiply your spamers by x15, builders by x1.4 and double your ${temp.clickyes.resource}.` },
            cost: new Decimal(1)
        },
        12: {
            title: "Acceleration",
            description() { return `Multiply your ${temp.clickyes.resource} based on your total Bzuki points. Additionally raise your spammers by ^1.05.` },
            cost: new Decimal(2),
            effect() {
                return player[this.layer].total.add(1.5).pow(0.4);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        13: {
            title: "Acceleration II",
            description: "Multiply your TextWallers and development points based on your total Bzuki points.",
            cost: new Decimal(4),
            effect() {
                return player[this.layer].total.add(1.5).pow(new Decimal("22").mul(player[this.layer].total.add(1).log10().add(1).pow(0.15)));
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
        21: {
            title: "Patience is a Virtue",
            description() { return `Multiply your ${temp.clickyes.resource} based on this layer's reset time.` },
            cost: new Decimal(6),
            effect() {
                let time = new Decimal(player[this.layer].resetTime).div(60);
                if (hasUpgrade("bzuki", 22)) time = time.mul(upgradeEffect("bzuki", 22));
                time = time.mul(buyableEffect("bzuki", 11));
                if (hasUpgrade("bzuki", 32)) time = time.mul(upgradeEffect("bzuki", 32));
                if (hasUpgrade("lime", 12)) time = time.mul(4);
                let eff = time.add(1).pow(0.5);
                if (hasUpgrade("lime", 12)) eff = eff.pow(0.6 / 0.5);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 13)
            }
        },
        22: {
            title: "That's a steep increase in technology",
            description: "The reset time in \"Patience is a Virtue\" goes faster based on the amount of upgrades bought in this layer. Additionally doubles your builders.",
            cost: new Decimal(10),
            effect() {
                return Decimal.pow(1.2, player[this.layer].upgrades.length)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 21)
            }
        },
        23: {
            title: "Buyables!!!",
            description: "Unlock Bzuki buyables.",
            cost: new Decimal(20),
            unlocked() {
                return hasUpgrade(this.layer, 22)
            }
        },
        31: {
            title: "Acceleration III",
            description: "Multiply your Bzuki points based on your characters and vice versa.",
            cost: new Decimal(100),
            effect() {
                let softcapStart = new Decimal("1e12");
                if (hasUpgrade("lime", 34)) softcapStart = softcapStart.mul(upgradeEffect("lime", 34));
                let eff = [player.points.add(1).log10().add(1).log10().add(1).pow(0.4), Decimal.pow("1e300", Decimal.pow(10, softcap(player[this.layer].total.log10(), softcapStart.log10(), new Decimal(0.6))).add(1).pow(0.5)), softcapStart];
                if (inChallenge("lime", 11)) eff[1] = Decimal.pow(10, eff[1].log10().pow(0.25))
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id)[0])} to Bzuki points, x${format(upgradeEffect(this.layer, this.id)[1])} to characters.${player.bzuki.total.gte(upgradeEffect(this.layer, this.id)[2]) ? " <span class='softcap'>(softcapped)</span>" : ""}` },
            unlocked() {
                return hasUpgrade(this.layer, 23)
            }
        },
        32: {
            title: "Time Acceleration",
            description() { return `Multiply "Patience is a Virtue" reset time based on your total ${temp.clickyes.resource}.` },
            cost: new Decimal(600),
            effect() {
                return player.clickyes.total.add(10).log10().pow(0.65);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 31)
            }
        },
        33: {
            title: "Builders Booster",
            description: "Multiply your builders based on your total Bzuki points.",
            cost: new Decimal(2000),
            effect() {
                return player[this.layer].total.add(10).log10().pow(0.55);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 32)
            }
        },
        41: {
            title: "Yet Another Self-Boost",
            description: "Multiply your Bzuki points based on itself.",
            cost: new Decimal(10000),
            effect() {
                let eff = player[this.layer].total.add(10).log10().pow(0.8);
                if (hasUpgrade("lime", 31)) eff = eff.pow(1.25 / 0.8);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 33)
            }
        },
        42: {
            title: "Acceleration IV",
            description: "Multiply your Bzuki points based on your builders.",
            cost: new Decimal(100000),
            effect() {
                let eff = player.build.points.add(10).log10().pow(0.6);
                if (hasUpgrade("build", 31)) eff = Decimal.pow(10, softcap(player.build.points.add(1.5).pow(0.25).log10(), new Decimal("1e6"), new Decimal(0.9)));
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 41)
            }
        },
        43: {
            title: "Finally a new layer",
            description() { return `Unlock the lime.person layer. Additionally raise your ${temp.clickyes.resource} by ^1.025.` },
            cost: new Decimal("1e7"),
            unlocked() {
                return hasUpgrade(this.layer, 42)
            }
        }
    },
    milestones: {
        0: {
            requirementDescription() { return `${formatWhole(5)} Bzuki points` },
            effectDescription: "Keep your click yes challenges on reset.",
            done() { return player[this.layer].points.gte(5) }
        },
        1: {
            requirementDescription() { return `${formatWhole(10)} Bzuki points` },
            effectDescription: "Keep your click yes milestones on reset.",
            done() { return player[this.layer].points.gte(10) }
        },
        2: {
            requirementDescription() { return `${formatWhole(25)} Bzuki points` },
            effectDescription: "Automatically buy builder and spammer upgrades.",
            done() { return player[this.layer].points.gte(25) }
        },
        3: {
            requirementDescription() { return `${formatWhole(100)} Bzuki points` },
            effectDescription: "Automatically gain 100% of your spammers you get on reset per second and automatically prestige for builders every tick.",
            done() { return player[this.layer].points.gte(100) }
        }
    },
    buyables: {
        11: {
            title: "Time Boosting",
            cost(x) { return new Decimal(15).mul(Decimal.pow(2, x)) },
            display() { return `Multiplying "Patience is a Virtue" reset time by x${format(this.effect())}.<br>
                <b>Cost:</b> ${formatWhole(this.cost())} ${layers[this.layer].resource}<br>
                <b>Amount:</b> ${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id);
                if (hasUpgrade("lime", 13)) amt = amt.add(3);
                return Decimal.pow(1.6, softcap(amt, new Decimal(75), new Decimal(0.775)))
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                let purchases = Decimal.affordGeometricSeries(player[this.layer].points, 15, 2, getBuyableAmount(this.layer, this.id));
                let cost = Decimal.sumGeometricSeries(purchases, 15, 2, getBuyableAmount(this.layer, this.id));
                player[this.layer].points = player[this.layer].points.sub(cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(purchases));
            },
            unlocked() {
                return hasUpgrade("bzuki", 23) || hasUpgrade("lime", 22)
            }
        },
        12: {
            title: "General Boost",
            cost(x) { return new Decimal(15).mul(Decimal.pow(2.5, x)) },
            display() { return `Multiplying ${temp.clickyes.resource} by x${format(this.effect()[0])}, builders by x${format(this.effect()[1])} and TextWallers by x${format(this.effect()[2])}.<br>
                <b>Cost:</b> ${format(this.cost())} ${layers[this.layer].resource}<br>
                <b>Amount:</b> ${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id);
                if (hasUpgrade("lime", 13)) amt = amt.add(3);
                let builderBoost = amt.add(1).pow(0.3);
                if (hasUpgrade("build", 31)) builderBoost = Decimal.pow(1.065, softcap(amt, new Decimal(100), new Decimal(0.9)));
                return [Decimal.pow(1.6, softcap(amt, new Decimal(80), new Decimal(0.8))),
                    builderBoost,
                    Decimal.pow("1e100", amt.pow(1.35))
                ]
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                let purchases = Decimal.affordGeometricSeries(player[this.layer].points, 15, 2.5, getBuyableAmount(this.layer, this.id));
                let cost = Decimal.sumGeometricSeries(purchases, 15, 2.5, getBuyableAmount(this.layer, this.id));
                player[this.layer].points = player[this.layer].points.sub(cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(purchases));
            },
            unlocked() {
                return hasUpgrade("bzuki", 23) || hasUpgrade("lime", 22)
            }
        },
        21: {
            title: "Further Boosts",
            cost(x) { return new Decimal("1e14").mul(Decimal.pow(4, x)) },
            display() { return `Multiplying lime.person points by x${format(this.effect()[0])} and your Bzuki points by x${format(this.effect()[1])} based on your builders.<br>
                <b>Cost:</b> ${format(this.cost())} ${layers[this.layer].resource}<br>
                <b>Amount:</b> ${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            effect() {
                let amt = getBuyableAmount(this.layer, this.id);
                return [Decimal.pow(1.3, softcap(amt, new Decimal(20), new Decimal(0.75))),
                    player.build.points.add(10).log10().div(3).max(1).pow(softcap(amt.div(6.5), new Decimal(2.5), new Decimal(0.8)))
                ]
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                let purchases = Decimal.affordGeometricSeries(player[this.layer].points, "1e14", 4, getBuyableAmount(this.layer, this.id));
                let cost = Decimal.sumGeometricSeries(purchases, "1e14", 4, getBuyableAmount(this.layer, this.id));
                player[this.layer].points = player[this.layer].points.sub(cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(purchases));
            },
            unlocked() {
                return hasUpgrade("lime", 22)
            }
        }
    }
});
addLayer("lime", {
    name: "lime.person",
    symbol: "l.",
    position: -1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#7EED56",
    requires: new Decimal("1e7"),
    resource: "lime.person points",
    baseResource: "Bzuki points",
    baseAmount() {return player.bzuki.points},
    type: "normal",
    exponent: 0.55,
    gainMult() {
        mult = new Decimal(1);
        if (getBuyableAmount("bzuki", 21).gte(1)) mult = mult.mul(buyableEffect("bzuki", 21)[0]);
        if (hasUpgrade("lime", 31)) mult = mult.mul(upgradeEffect("lime", 31));
        if (challengeCompletions("lime", 11) >= 1) mult = mult.mul(challengeEffect("lime", 11)[0]);
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
        return exp
    },
    row: 5,
    displayRow: 3,
    hotkeys: [
        {key: "l", description: "L: Reset for lime.person points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("bzuki", 43) || hasAchievement("ach", 32)
    },
    branches: [["tw", 2], ["build", 1]],
    upgrades: {
        11: {
            title: "Typical Recovery Upgrade",
            description() { return `Raise your development points by ^1.075, double your builders, multiply your spammers by x25, triple your ${temp.clickyes.resource} and multiply your Bzuki points by x1.5.` },
            cost: new Decimal(1)
        },
        12: {
            title: "Hyper-Booster",
            description() { return `Triple your ${temp.clickyes.resource}, multiply your Bzuki points based on your total lime.person points, multiply your characters by x${format("1e200")} and improve the formula in "Patience is a Virtue".` },
            cost: new Decimal(2),
            effect() {
                return softcap(player[this.layer].total, new Decimal("1e12"), new Decimal(0.5)).add(1).pow(0.5);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}${player[this.layer].total.gte("1e12") ? " <span class='softcap'>(softcapped)</span>" : ""}` },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        13: {
            title: "Hyper-Booster II",
            description: "Multiply \"Patience is a Virtue\" time by x4 and add 3 extra levels to the Bzuki buyables.",
            cost: new Decimal(4),
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
        14: {
            title: "Hyper-Booster III",
            description() { return `Multiply your ${temp.clickyes.resource} based on your total lime.person points.` },
            cost: new Decimal(10),
            effect() {
                return player[this.layer].total.add(1).pow(0.8);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 13)
            }
        },
        21: {
            title: "Deca Quitin's Video That Ends It All",
            description() { return `Remove the click yes reset button. To compensate, you passively gain ${temp.clickyes.resource} based on your total lime.person points again, your total Bzuki points and the expected amount of ${temp.clickyes.resource} gained on reset. Also keeps and automate all of your click yes upgrades and challenges.` },
            style: {"width": "405px", "height": "405px", "border-radius": "90px", "font-size": "15px"},
            cost: new Decimal(20),
            effect() {
                let eff = player[this.layer].total.add(1).pow(0.5).mul(player.bzuki.total.add(1.5).pow(0.1)).mul(temp.clickyes.gainMult.pow(temp.clickyes.gainExp)).mul(Decimal.max(player.tw.points, "1e150").div(temp.clickyes.requires).log(temp.clickyes.logarithm).add(1).floor());
                if (inChallenge("lime", 11)) eff = eff.pow(0.15);
                return eff;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}/sec` },
            onPurchase() {
                player.clickyes.challenges[11] = 1;
                player.clickyes.challenges[21] = 1;
                player.clickyes.challenges[31] = 5;
            },
            unlocked() {
                return hasUpgrade(this.layer, 14)
            }
        },
        22: {
            title: "More buyables????",
            description: "Unlock a new Bzuki buyable. Also permanently unlock Bzuki buyables.",
            cost: new Decimal(5000),
            unlocked() {
                return hasUpgrade(this.layer, 21)
            }
        },
        31: {
            title: "Self-Boost+",
            description: "Multiply your lime.person points based on itself and improve \"Yet Another Self-Boost\".",
            cost: new Decimal("1e7"),
            effect() {
                return player[this.layer].points.add(10).log10().pow(0.7);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 22)
            }
        },
        32: {
            title: "Hyper-Booster IV",
            description: "Multiply your Bzuki points based on your characters.",
            cost: new Decimal("2.5e16"),
            effect() {
                return player.points.log10().log10().max(0).add(1).pow(1.1);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 31)
            }
        },
        33: {
            title: "Hyper-Booster V",
            description: "Multiply your lime.person points based on your characters.",
            cost: new Decimal("1e19"),
            effect() {
                return player.points.log10().log10().max(0).add(1).pow(0.9);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade(this.layer, 32)
            }
        },
        34: {
            title: "Softcap Nerfer",
            description: "Delay the softcap of \"Acceleration III\" based on the amount of upgrades bought in this layer.",
            cost: new Decimal("1e22"),
            effect() {
                return Decimal.pow(2, player.lime.upgrades.length);
            },
            effectDisplay() { return `x${formatWhole(upgradeEffect(this.layer, this.id))} to softcap start` },
            unlocked() {
                return hasUpgrade(this.layer, 33)
            }
        },
        41: {
            title: "More challenges?!?!",
            description: "Unlock lime.person challenges.",
            cost: new Decimal("1e23"),
            unlocked() {
                return hasUpgrade(this.layer, 34)
            }
        },
        42: {
            title: "Upgrade Addition",
            description: "Unlock a new builder upgrade.",
            cost: new Decimal("1e25"),
            unlocked() {
                return hasUpgrade(this.layer, 41)
            }
        }
    },
    milestones: {
        0: {
            requirementDescription() { return `${formatWhole(1)} lime.person point` },
            effectDescription: "Fully automate the builder and spammer layers.",
            done() { return player[this.layer].points.gte(1) }
        },
        1: {
            requirementDescription() { return `${formatWhole(10)} lime.person points` },
            effectDescription: "Keep your click yes milestones on reset.",
            done() { return player[this.layer].points.gte(10) }
        },
        2: {
            requirementDescription() { return `${formatWhole(2500)} lime.person points` },
            effectDescription: "Keep your Bzuki milestones on reset.",
            done() { return player[this.layer].points.gte(2500) }
        }
    },
    challenges: { 
        11: {
            name: "October 2021 PinkiePie Spam",
            challengeDescription: "Raise your characters by ^0.075, massively debuff \"Deca Quitin's Video That Ends It All\", \"Acceleration III\" and divide your builders and Bzuki points by /100.",
            completionLimit: 5,
            goalDescription() { return `${format(new Decimal("1e10").mul(Decimal.pow(2000, new Decimal(challengeCompletions(this.layer, this.id)).pow(1.6))))} Bzuki points` },
            rewardDescription: "Multiply your lime.person points, Bzuki points and builders based on challenge completions.",
            canComplete() { return player.bzuki.points.gte(new Decimal("1e10").mul(Decimal.pow(2000, new Decimal(challengeCompletions(this.layer, this.id)).pow(1.6)))) },
            rewardEffect() {
                return [Decimal.pow(2, challengeCompletions(this.layer, this.id)),
                    Decimal.pow(3.5, challengeCompletions(this.layer, this.id)),
                    Decimal.pow(5, challengeCompletions(this.layer, this.id))
                ]
            },
            rewardDisplay() { return `x${format(challengeEffect(this.layer, this.id)[0])} to your lime.person points, x${format(challengeEffect(this.layer, this.id)[1])} to your Bzuki points, x${format(challengeEffect(this.layer, this.id)[2])} to your builders.` },
            unlocked() {
                return hasUpgrade("lime", 41)
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return `You have ${format(temp[this.layer].baseAmount)} ${layers[this.layer].baseResource}` }, {"margin": "5px 0", "display": "block", "width": "100%", "height": "20px"}],
                "milestones",
                "upgrades"
            ]
        },
        "Challenges": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return `You have ${format(temp[this.layer].baseAmount)} ${layers[this.layer].baseResource}` }, {"margin": "5px 0", "display": "block", "width": "100%", "height": "20px"}],
                "challenges"
            ],
            unlocked() {
                return hasUpgrade("lime", 41)
            }
        }
    }
});
/*
Content for CYOD layer but commented out since bzuki joined before him
addLayer("cyod", {
    name: "cyod",
    symbol: "CYOD",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        cyodPoints: new Decimal(0),
        totalCyodPoints: new Decimal(0)
    }},
    color: "#e4abff",
    requires: new Decimal(15000),
    resource: "CYOD essences",
    baseResource: "${temp.clickyes.resource}",
    baseAmount() {return player.clickyes.points},
    type: "normal",
    exponent: new Decimal(0.5),
    gainMult() {
        mult = new Decimal(1);
        if (hasUpgrade("cyod", 33)) mult = mult.mul(1.5);
        if (getBuyableAmount("cyod", 12).gte(1)) mult = mult.mul(buyableEffect("cyod", 12));
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
        return exp
    },
    row: 4,
    displayRow: 3,
    hotkeys: [
        {key: "c", description: "C: Reset for CYOD essence", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("clickyes", 42) || hasAchievement("ach", 24)
    },
    branches: [["tw", 2], ["spam", 1], ["clickyes", 1]],
    cyodPointGain() {
        let gain = player.cyod.total.pow(2);
        if (hasUpgrade("cyod", 12)) gain = gain.mul(upgradeEffect("cyod", 12));
        if (hasUpgrade("cyod", 14)) gain = gain.mul(upgradeEffect("cyod", 14));
        if (hasUpgrade("cyod", 23)) gain = gain.mul(upgradeEffect("cyod", 23));
        if (hasUpgrade("cyod", 32)) gain = gain.mul(upgradeEffect("cyod", 32));
        if (getBuyableAmount("cyod", 11).gte(1)) gain = gain.mul(buyableEffect("cyod", 11)[1]);
        return gain;
    },
    update(delta) {
        player[this.layer].cyodPoints = player[this.layer].cyodPoints.add(temp[this.layer].cyodPointGain.mul(delta));
        player[this.layer].totalCyodPoints = player[this.layer].totalCyodPoints.add(temp[this.layer].cyodPointGain.mul(delta))
    },
    upgrades: {
        11: {
            title: "Click Yes<sup>2</sup>",
            description: "Multiply your characters and development points based on your total CYOD points.",
            cost: new Decimal(5),
            effect() {
                let eff = player[this.layer].totalCyodPoints.add(1).pow(8);
                if (hasUpgrade("cyod", 42)) eff = eff.pow(3);
                return eff;
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] }
        },
        12: {
            title: "Further Spamming",
            description: "Multiply your CYOD points based on your characters and spammers.",
            cost: new Decimal(25),
            effect() {
                return player.points.add(10).log10().add(9).log10().add(1).pow(0.55).mul(player.spam.points.add(10).log10().pow(0.06))
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 11)
            }
        },
        13: {
            title: "Clicking Yes 32qDu times",
            description: "Multiply your ${temp.clickyes.resource} based on your CYOD points.",
            cost: new Decimal(100),
            effect() {
                return player[this.layer].cyodPoints.add(1).log10().pow(0.5)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 12)
            }
        },
        14: {
            title: "Even Further Spamming",
            description: "Multiply your CYOD points based on your ${temp.clickyes.resource}.",
            cost: new Decimal(150),
            effect() {
                return player.clickyes.points.add(1.5).pow(0.2)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 13)
            }
        },
        21: {
            title: "Click Yes<sup>3</sup>",
            description: "Builders no longer reset anything and multiply your TextWallers based on your total CYOD points.",
            cost: new Decimal(400),
            effect() {
                return player[this.layer].totalCyodPoints.add(1).pow(7)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 14)
            }
        },
        22: {
            title: "Hyper-Click Yes",
            description: "Improve \"Super-Click Yes\" again.",
            cost: new Decimal(1000),
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 21)
            }
        },
        23: {
            title: "Super-Spamming",
            description: "Multiply your CYOD points based on itself.",
            cost: new Decimal(2500),
            effect() {
                return player[this.layer].cyodPoints.add(10).log10().pow(1.4);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 22)
            }
        },
        24: {
            title: "/click yes spam Expansion II",
            description: "Automatically buy builder upgrades.",
            cost: new Decimal(2),
            unlocked() {
                return hasUpgrade("cyod", 23)
            }
        },
        31: {
            title: "/click yes spam Expansion III",
            description: "Automatically buy spammer upgrades.",
            cost: new Decimal(50000),
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 24)
            }
        },
        32: {
            title: "Click Yes<sup>4</sup>",
            description: "Multiply your CYOD points based on the amount of CYOD layer upgrades bought.",
            cost: new Decimal(100000),
            effect() {
                return Decimal.pow(1.15, player[this.layer].upgrades.length);
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 31)
            }
        },
        33: {
            title: "Click Yes<sup>5</sup>",
            description: "Automatically gain 100% of your spammers you get on reset per second. Also multiply your CYOD essence by x1.5.",
            cost: new Decimal(5),
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 32)
            }
        },
        34: {
            title: "Click Yes<sup>6</sup>",
            description: "Multiply your builders based on your total CYOD essence. Also keep your click yes layer milestones on reset.",
            cost: new Decimal(450000),
            effect() {
                return player[this.layer].total.add(10).log10().pow(0.6)
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            currencyDisplayName: "CYOD points",
            currencyInternalName: "cyodPoints",
            currencyLocation() { return player[this.layer] },
            unlocked() {
                return hasUpgrade("cyod", 33)
            }
        },
        41: {
            title: "Click Yes Buyables",
            description: "Unlock CYOD buyables. Also automatically reset for builders every tick.",
            cost: new Decimal(40),
            unlocked() {
                return hasUpgrade("cyod", 34)
            }
        },
        42: {
            title: "Click Yes<sup>Click Yes</sup>",
            description: "Improve \"Click Yes<sup>2</sup>\".",
            cost: new Decimal(100),
            unlocked() {
                return hasUpgrade("cyod", 41)
            }
        },
        43: {
            title: "Further QOL",
            description: "Keep your click yes layer challenge completions on reset.",
            cost: new Decimal(500),
            unlocked() {
                return hasUpgrade("cyod", 42)
            }
        }
    },
    buyables: {
        11: {
            title() { return `Clicking Yes ${formatWhole(Decimal.pow(2, getBuyableAmount("cyod", 11)))} Times/sec` },
            cost(x) { return new Decimal(5).mul(Decimal.pow(2, x)) },
            display() { return `Multiplying your ${temp.clickyes.resource} by x${format(this.effect()[0])} and your CYOD points by x${format(this.effect()[1])}.<br>
                <b>Cost:</b> ${formatWhole(this.cost())} CYOD essence<br>
                <b>Amount:</b> ${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            effect() {
                return [Decimal.pow(1.5, getBuyableAmount(this.layer, this.id)), Decimal.pow(1.2, getBuyableAmount(this.layer, this.id))]
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                let purchases = Decimal.affordGeometricSeries(player[this.layer].points, 5, 2, getBuyableAmount(this.layer, this.id));
                let cost = Decimal.sumGeometricSeries(purchases, 5, 2, getBuyableAmount(this.layer, this.id));
                player[this.layer].points = player[this.layer].points.sub(cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(purchases));
            },
            unlocked() {
                return hasUpgrade("cyod", 41)
            }
        },
        12: {
            title: "CYOD Essence Multiplier",
            cost(x) { return new Decimal("1e8").mul(Decimal.pow(10, x)) },
            display() { return `Multiplying your CYOD essence by x${format(this.effect())}.<br>
                <b>Cost:</b> ${formatWhole(this.cost())} CYOD points<br>
                <b>Amount:</b> ${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            effect() {
                return Decimal.pow(1.08, getBuyableAmount(this.layer, this.id))
            },
            canAfford() { return player.cyod.cyodPoints.gte(this.cost()) },
            buy() {
                let purchases = Decimal.affordGeometricSeries(player.cyod.cyodPoints, "1e8", 10, getBuyableAmount(this.layer, this.id));
                let cost = Decimal.sumGeometricSeries(purchases, "1e8", 10, getBuyableAmount(this.layer, this.id));
                player.cyod.cyodPoints = player.cyod.cyodPoints.sub(cost);
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(purchases));
            },
            unlocked() {
                return hasUpgrade("cyod", 41)
            }
        }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return `You have ${formatWhole(player[this.layer].cyodPoints)} CYOD points (+${format(temp[this.layer].cyodPointGain)}/sec).` }, {"margin": "5px 0", "display": "block", "width": "100%", "height": "20px"}],
        "milestones",
        "buyables",
        "upgrades"
    ]
});*/
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
            tooltip: "Start generating characters.",
            image: "./ach/placeholder.png"
        },
        12: {
            name: "hello and welcome",
            done() { return player.tw.points.gte(1) },
            tooltip: "Reset for TextWallers.",
            image: "./ach/12.png"
        },
        13: {
            name: "That's a lot of TextWallers",
            done() { return player["tw"].points.gte("1e6") },
            tooltip() { return `Get ${format("1e6")} TextWallers.` },
            image: "./ach/placeholder.png"
        },
        14: {
            name: "Which one?",
            done() { return player["build"].points.gte(1) || player["spam"].points.gte(1) },
            tooltip: "Reset for either Builders or Spammers.",
            image: "./ach/placeholder.png"
        },
        15: {
            name: "Now it isn't a choice!",
            done() { return player["build"].unlocked && player["spam"].unlocked },
            tooltip: "Unlock both Builders and Spammers.",
            image: "./ach/placeholder.png"
        },
        21: {
            name: "<span style='font-size:0.8em'>I don't think the server can handle this many TextWallers</span>",
            done() { return player["tw"].points.gte("1e100") },
            tooltip() { return `Get ${format("1e100")} TextWallers.` },
            image: "./ach/21.png"
        },
        22: {
            name: "Should we make a game?",
            done() { return player["clickyes"].points.gte(1) },
            tooltip() { return `Reset for ${temp.clickyes.resource}.<br>REWARD: Builder layer and spammer layer no longer increase eachother's requirements.` },
            image: "./ach/22.png"
        },
        23: {
            name: "Ultimate disaster",
            done() { return player.tw.points.gte("1e666") },
            tooltip() { return `Get ${format("1e666")} TextWallers.` },
            image: "./ach/23.png"
        },
        24: {
            name: "Is that a moderator???",
            done() { return player.bzuki.points.gte(1) },
            tooltip: "Reset for Bzuki points.<br>REWARD: Automate and keep all upgrades of the development and TextWall layers. Also keeps all milestones of the builder and spammer layers.",
            image: "./ach/placeholder.png"
        },
        25: {
            name: "That was moderately fast",
            done() { return challengeCompletions("clickyes", 31) >= 5 },
            tooltip: "Complete the challenge \"July 2021 DDoS Attack\" 5 times.",
            image: "./ach/placeholder.png"
        },
        31: {
            name: "Points: Points: 0",
            done() { return player.bzuki.points.gte("1e6") },
            tooltip() { return `Get ${format("1e6")} Bzuki points.` },
            image: "./ach/31.png"
        },
        32: {
            name: "Another TextWaller",
            done() { return player.lime.points.gte(1) },
            tooltip: "Reset for lime.person points.",
            image: "./ach/placeholder.png"
        },
        33: {
            name: "Click Yes is Dead",
            done() { return hasUpgrade("lime", 21) },
            tooltip: "Purchase the upgrade \"Deca Quitin's Video That Ends It All\".",
            image: "./ach/placeholder.png"
        },
        34: {
            name: "Vector's Intermediate Illion",
            done() { return player.tw.points.gte("1e121301328") },
            tooltip() { return `Get ${format("1e121301328")} TextWallers.` },
            image: "./ach/41.png"
        },
        35: {
            name: "Isn't click yes dead already?",
            done() { return player.clickyes.points.gte(Decimal.pow(2, 1024)) },
            tooltip() { return `Get ${format(Decimal.pow(2, 1024))} ${temp.clickyes.resource}.` },
            image: "./ach/placeholder.png"
        }
    },
    tabFormat: [
		"blank", 
		["display-text", function() { return "Achievements: "+player.ach.achievements.length+"/"+(Object.keys(tmp.ach.achievements).length - 2) }], 
		"blank", "blank",
		"achievements",
	],
})