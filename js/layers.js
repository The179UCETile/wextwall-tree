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
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1);
    	if (hasUpgrade("spam", 23)) exp = exp.mul(1.015);
    	if (challengeCompletions("clickyes", 11) >= 1) exp = exp.mul(1.05);
        if (inChallenge("clickyes", 11)) exp = exp.mul(0.65);
        if (inChallenge("clickyes", 31)) exp = exp.mul(0.5);
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for development points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    autoUpgrade() {return hasUpgrade("build", 11) || hasMilestone("clickyes", 0)},
    doReset(resettingLayer) {
        if (resettingLayer != "dev") {
            const keep = [];
            if (hasMilestone("build", 0)) keep.push("upgrades");
            if (hasMilestone("spam", 0)) keep.push("upgrades");
            if (hasMilestone("clickyes", 0)) keep.push("upgrades");
            layerDataReset("dev", keep)
        }
    },
    passiveGeneration() {
        return hasUpgrade("spam", 11) || hasMilestone("clickyes", 0) ? 1 : 0
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
    autoUpgrade() {return hasMilestone("clickyes", 1)},
    passiveGeneration() {
        return hasMilestone("clickyes", 3) ? 1 : 0
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
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
        if (inChallenge("clickyes", 11)) exp = exp.mul(0.65);
        if (inChallenge("clickyes", 31)) exp = exp.mul(0.5);
	    if (challengeCompletions("clickyes", 31) >= 1) exp = exp.mul(challengeEffect("clickyes", 31)[1]);
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
        if (inChallenge("clickyes", 21)) mult = mult.mul(0.75);
        if (inChallenge("clickyes", 31)) mult = mult.mul(0.5);
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
    buildEffectSoftcap() {
        let softcap = new Decimal(17);
        if (hasMilestone("clickyes", 2)) softcap = softcap.add(5);
        if (hasUpgrade("clickyes", 23)) softcap = softcap.add(upgradeEffect("clickyes", 23)[0]);
        return softcap;
    },
    buildEffectSoftcapPower() {
        return Decimal.sub(1, temp[this.layer].buildEffectSoftcap.div(17).recip().div(5));
    },
    effect() {
        if (!player[this.layer].unlocked) return [new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(0)];
        let actualBuilders = player[this.layer].best;
        if (hasUpgrade("build", 12)) {
            actualBuilders = actualBuilders.add(player[this.layer].total.plus(1).log(5).pow(1.4))
        };
        let softcap = temp[this.layer].buildEffectSoftcap;
        if (actualBuilders.gte(softcap)) {
            actualBuilders = actualBuilders.sub(softcap).pow(temp[this.layer].buildEffectSoftcapPower).add(softcap);
        }
        let eff = [Decimal.pow(3, actualBuilders),
            Decimal.pow(2, actualBuilders),
            Decimal.pow(1.5, actualBuilders),
            actualBuilders];
        return eff;
    },
    effectDescription() {
        return `which are boosting characters by ${format(temp[this.layer].effect[0])}x, development points by ${format(temp[this.layer].effect[1])}x and TextWallers by ${format(temp[this.layer].effect[2])}x based on your best builders${hasUpgrade("build", 12) ? " and total builders" : ""}.${temp[this.layer].effect[3].gte(temp[this.layer].buildEffectSoftcap) ? " <span style='font-size:0.75em'>(softcapped)</span>" : ""}`
    },
    increaseUnlockOrder: ["spam"],
    doReset(resettingLayer) {
        if (resettingLayer != "build" && resettingLayer != "spam") {
            const keep = [];
            if (hasMilestone("clickyes", 0)) keep.push("milestones");
            layerDataReset("build", keep)
        }
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
        return mult
    },
    gainExp() {
        exp = new Decimal(1);
    	if (hasUpgrade("clickyes", 13)) exp = exp.mul(1.02);
        if (inChallenge("clickyes", 21)) exp = exp.mul(0.55);
        if (inChallenge("clickyes", 31)) exp = exp.mul(0.5);
        return exp
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
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            unlocked() {
                return hasUpgrade("spam", 23)
            }
        },
        32: {
            title: "Spam Wave II",
            description: "Multiply your developer points based on your best spammers. At this point you should be able to obtain builders.",
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
    symbol: "CY",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0)
    }},
    color: "#00FF00",
    requires: new Decimal("1e150"),
    resource: "yes button clicks",
    baseResource: "TextWallers",
    baseAmount() {return player["tw"].points},
    type: "custom",
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
        return temp[this.layer].getResetGain.gte(player[this.layer].points.div(10)) && temp[this.layer].getResetGain.neq(0)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(1000)) {
            return `+<b>${formatWhole(temp[this.layer].getResetGain)}</b> ${layers[this.layer].resource}`
        } else if (temp[this.layer].getResetGain.gte(100)) {
            return `Reset for +<b>${formatWhole(temp[this.layer].getResetGain)}</b> ${layers[this.layer].resource}`
        } else {
            return `Reset for +<b>${formatWhole(temp[this.layer].getResetGain)}</b> ${layers[this.layer].resource}<br><br>
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
        return (hasUpgrade("spam", 33) && hasUpgrade("build", 23) && player["tw"].points.gte("1e100")) || hasAchievement("ach", 22)
    },
    branches: [["tw", 2], ["spam", 1]],
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
            description: "Raise your spammers by ^1.02 and multiply your TextWallers based on your total yes button clicks.",
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
            description: "Multiply your yes button clicks based on your characters.",
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
            title: "CYOD",
            description: "Delay the builder effect softcap based on your total yes button clicks and multiply your builders based on your total yes button clicks.",
            cost: new Decimal(85),
            effect() {
                let eff = [player[this.layer].total.add(1.5).pow(0.5), player[this.layer].total.add(10).log10().pow(0.525)];
                if (hasUpgrade("clickyes", 33)) {
                    eff[0] = eff[0].pow(0.65 / 0.5);
                    eff[1] = eff[1].pow(0.6 / 0.525)
                }
                return eff;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id)[0])}, x${format(upgradeEffect(this.layer, this.id)[1])}` },
            unlocked() {
                return hasUpgrade("clickyes", 22)
            }
        },
        31: {
            title: "/click yes spam Expansion",
            description: "Multiply your builders based on your spammers and vice versa.",
            cost: new Decimal(150),
            effect() {
                return [player.spam.points.add(10).log10().pow(0.085), Decimal.pow(1.625, player.build.points.add(1).pow(0.925))]
            },
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id)[0])}, x${format(upgradeEffect(this.layer, this.id)[1])}` },
            unlocked() {
                return hasUpgrade("clickyes", 23)
            }
        },
        32: {
            title() { return `Clicking Yes ${options.badNotation == "True179ucStandard" ? "179uc" : "179UCe"} Times` },
            description: "Multiply your yes button clicks based on the amount of click yes layer upgrades bought.",
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
            description: "Improve \"CYOD\" and double your yes button clicks.",
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
        }
    },
    milestones: {
        0: {
            requirementDescription() { return `${formatWhole(1)} yes button click` },
            effectDescription: "Automate the entirety of the developer layer and keep builder and spammer milestones on reset.",
            done() { return player[this.layer].points.gte(1) }
        },
        1: {
            requirementDescription() { return `${formatWhole(8)} yes button clicks` },
            effectDescription: "Automate TextWall layer upgrades.",
            done() { return player[this.layer].points.gte(8) }
        },
        2: {
            requirementDescription() { return `${formatWhole(25)} yes button clicks` },
            effectDescription: "Nerf builder effect softcap.",
            done() { return player[this.layer].points.gte(25) }
        },
        3: {
            requirementDescription() { return `${formatWhole(100)} yes button clicks` },
            effectDescription: "Automatically gain 100% of your TextWallers you get on reset per second.",
            done() { return player[this.layer].points.gte(100) }
        }
    },
    challenges: {
        11: {
            name: "Click No",
            challengeDescription: "Your developer points and TextWallers are raised by ^0.65.",
            goalDescription() { return `${format("1e10")} spammers` },
            rewardDescription: "Raise your developer points by ^1.05, your yes button clicks by 2x and multiply your spammers based on your total yes button clicks.",
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
            rewardDescription: "Multiply your yes button clicks based on your spammers and raise your characters by ^1.05.",
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
            rewardDescription: "Multiply your yes button clicks and raise your TextWallers based on challenge completions.",
            canComplete() { return player.spam.points.gte(new Decimal("1e10").mul(Decimal.pow(1000, new Decimal(challengeCompletions("clickyes", 31)).pow(1.5)))) },
            rewardEffect() {
                return [Decimal.pow(1.4, challengeCompletions("clickyes", 31)), new Decimal(challengeCompletions("clickyes", 31)).div(20).add(1)]
            },
            rewardDisplay() { return `x${format(challengeEffect(this.layer, this.id)[0])} to yes button clicks, ^${format(challengeEffect(this.layer, this.id)[1])} to your TextWallers.` },
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
                "challenges"
            ],
            unlocked() {
                return hasUpgrade("clickyes", 22)
            }
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
            name: "hello and welcome",
            done() { return player.tw.points.gte(1) },
            tooltip: "Reset for TextWallers."
        },
        13: {
            name: "That's a lot of TextWallers",
            done() { return player["tw"].points.gte("1e6") },
            tooltip() { return `Get ${format("1e6")} TextWallers.` }
        },
        14: {
            name: "Which one?",
            done() { return player["build"].points.gte(1) || player["spam"].points.gte(1) },
            tooltip: "Reset for either Builders or Spammers."
        },
        15: {
            name: "Now it isn't a choice!",
            done() { return player["build"].unlocked && player["spam"].unlocked },
            tooltip: "Unlock both Builders and Spammers."
        },
        21: {
            name: "<span style='font-size:0.8em'>I don't think the server can handle this many TextWallers</span>",
            done() { return player["tw"].points.gte("1e100") },
            tooltip() { return `Get ${format("1e100")} TextWallers.` }
        },
        22: {
            name: "Should we make a game?",
            done() { return player["clickyes"].points.gte(1) },
            tooltip: "Reset for yes button clicks.<br>REWARD: Builder layer and spammer layer no longer increase eachother's requirements.",
            image: "./ach/22.png"
        },
        23: {
            name: "Why are my development points softcapped?",
            done() { return player.dev.points.gte("1e1000") },
            tooltip() { return `Get ${format("1e1000")} development points.` }
        }
    },
    tabFormat: [
		"blank", 
		["display-text", function() { return "Achievements: "+player.ach.achievements.length+"/"+(Object.keys(tmp.ach.achievements).length - 2) }], 
		"blank", "blank",
		"achievements",
	],
})