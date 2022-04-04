export function getSecondaryName() {
	return "CR"
}

export function preparePcData(characters) {
	// TODO Make this adjustable via configuration
	switch (game.system.id) {
		case "dnd5e":
		case "pf1":
		case "pf2e":
		case "sfrpg":
		case "sw5e":
			return characters.map(actor => {
				return {
					actor: actor,
					xp: actor.data.data.details.xp.value,
					xpAttribute: "data.details.xp.value",
					nextLevelXp: actor.data.data.details.xp.max,
				}
			}); 
		case "age-of-sigmar-soulbound":
			return characters.map(actor => {
				return {
					actor: actor,
					xp: actor.experience.total,
					xpAttribute: "data.experience.total",
					nextLevelXp: undefined
				}
			});
		case "splittermond":
			return characters.map(actor => {
				let freeXp = actor.data.data.experience.free;
				return {
					actor: actor,
					xp: typeof freeXp === 'string' ? parseInt(freeXp) : freeXp,
					xpAttribute: "data.experience.free",
					nextLevelXp: actor.data.data.experience.nextLevelValue
				}
			});
	}
}

export function getSecondaryFormula() {
	switch (game.system.id) {
		default:
		case "pf2e":
		case "age-of-sigmar-soulbound":
		case "splittermond":
			return undefined;

		case "dnd5e":
		case "sw5e":
			return [
				["1/8", 25],
				[1/8, 25],
				["1/4", 50],
				[1/4, 50],
				["1/2", 100],
				[1/2, 100],
				[1, 200],
				[2, 450],
				[3, 700],
				[4, 1100],
				[5, 1800],
				[6, 2300],
				[7, 2900],
				[8, 3900],
				[9, 5000],
				[10, 5900],
				[11, 7200],
				[12, 8400],
				[13, 10000],
				[14, 11500],
				[15, 13000],
				[16, 15000],
				[17, 18000],
				[18, 20000],
				[19, 22000],
				[20, 25000],
				[21, 33000],
				[22, 41000],
				[23, 50000],
				[24, 62000],
				[25, 75000],
				[26, 90000],
				[27, 105000],
				[28, 120000],
				[29, 135000],
				[30, 155000],
			]
		case "pf1":
		case "sfrpg":
			return [
				["1/8", 50],
				[1/8, 50],
				["1/6", 65],
				[1/6, 65],
				["1/4", 100],
				[1/4, 100],
				["1/3", 135],
				[1/3, 135],
				["1/2", 200],
				[1/2, 200],
				[1, 400],
				[2, 600],
				[3, 800],
				[4, 1200],
				[5, 1600],
				[6, 2400],
				[7, 3200],
				[8, 4800],
				[9, 6400],
				[10, 9600],
				[11, 12800],
				[12, 19200],
				[13, 25600],
				[14, 38400],
				[15, 51200],
				[16, 76800],
				[17, 102400],
				[18, 153600],
				[19, 204800],
				[20, 307200],
				[21, 409600],
				[22, 614400],
				[23, 819200],
				[24, 1228800],
				[25, 1638400],
				[26, 2457600],
				[27, 3276800],
				[28, 4915200],
				[29, 6553600],
				[30, 9830400],
			]
	}
}
