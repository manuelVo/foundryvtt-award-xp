"use strict";

import {registerSettings, settingsKey} from "./settings.js"
import {getSecondaryFormula, getSecondaryName, preparePcData} from "./systems.js"
import {getPcs} from "./util.js";


Hooks.once("init", () => {
	registerSettings()
	registerKeybindings();
})

Hooks.on("renderActorDirectory", async (actor_directory, html, data) => {
	// Only show the award xp button to the gm
	if (!game.user.isGM)
		return
	const awardButton = $(`<button><i class="fas fa-angle-double-up"></i>${game.i18n.localize("award-xp.award-xp")}</button>`)
	html.find(".directory-footer").append(awardButton)
	awardButton.click((event) => {
		showAwardDialog()
	})
})

function registerKeybindings() {
	game.keybindings.register(settingsKey, "showAwardDialog", {
		name: "award-xp.award-xp",
		onDown: showAwardDialog,
		restricted: true,
		precedence: -1,
	});
}

function filterCharacters(pc) {
	const characterFilter = game.settings.get(settingsKey, "character-filter")
	const isInFilter = characterFilter.includes(pc.id)
	if (game.settings.get(settingsKey, "character-filter-is-blacklist"))
		return !isInFilter
	else
		return isInFilter
}

async function showAwardDialog() {
	if (!game.user.isGM)
		return
	const secondaryFormula = getSecondaryFormula()
	let secondaryName = undefined
	if (secondaryFormula)
		secondaryName = getSecondaryName() ?? "[secondary name missing]"

	const characters = getPcs().filter(filterCharacters)
	const data = {secondaryName, characters, showSoloXp: game.settings.get(settingsKey, "character-solo-xp-input")}
	const content = await renderTemplate("modules/award-xp/templates/award_experience_dialog.html", data)
	Dialog.prompt({
		content: content,
		label: game.i18n.localize("award-xp.award-xp"),
		render: onAwardDialogRendered,
		callback: awardXP,
		rejectClose: false,
		options: {
			width: game.settings.get(settingsKey, "character-solo-xp-input") ? 300 : 250,
			jQuery: true,
		},
	})
}

function onAwardDialogRendered(html) {
	html.find("#award-xp-secondary-xp").keyup(onSecondaryChange)
}

function awardXP(html) {
	html = html[0]
	let charIds = Array.from(html.querySelectorAll(".award-xp-char-selector")).filter(selector => selector.checked).map(selector => selector.name)
	if (charIds.length === 0) {
		throw game.i18n.localize("award-xp.no-char-selected")
	}
	const pcs = preparePcData(game.actors.filter(actor => charIds.includes(actor.id)))
	const groupXp = parseInt(html.querySelector("#award-xp-xp").value)
	if (isNaN(groupXp)) {
		throw game.i18n.localize("award-xp.xp-nan")
	}

	const divideXp = game.settings.get(settingsKey, "divide-xp");
	const charXp = divideXp ? Math.floor(groupXp / pcs.length) : groupXp;
	let soloXpInputs = Array.from(html.querySelectorAll(".award-xp-solo"))
	let soloXpPerCharacter = {}
	pcs.forEach(pc => {
		soloXpPerCharacter[pc.actor.id] = 0
		if (game.settings.get(settingsKey, "character-solo-xp-input")) {
			soloXpPerCharacter[pc.actor.id] = parseInt(soloXpInputs.find(input => input.name === `xp${pc.actor.id}`)?.value) || 0
		}
		pc.newXp = pc.xp + charXp + soloXpPerCharacter[pc.actor.id]
		const updateData = {}
		updateData[pc.xpAttribute] = pc.newXp
		pc.actor.update(updateData)
	})

	renderAwardedMessage(charXp, pcs, soloXpPerCharacter)
}

async function renderAwardedMessage(charXp, pcs, soloXpPerCharacter) {
	let message = {}
	message.content = await renderTemplate("modules/award-xp/templates/awarded_experience_message.html", {xp: charXp, characters: pcs.map(pc => {return {name: pc.actor.name, bonusXp: soloXpPerCharacter[pc.actor.id] > 0 ? soloXpPerCharacter[pc.actor.id] : undefined}})})
	ChatMessage.create(message)

	const levelups = pcs.filter(pc => pc.newXp >= pc.nextLevelXp)
	if (levelups.length > 0) {
		let message = {}
		message.content = await renderTemplate("modules/award-xp/templates/levelup_message.html", {characters: levelups.map(pc => pc.actor.name)})
		ChatMessage.create(message)
	}
}

function onSecondaryChange(event) {
	const secondaryValue = event.target.value.trim()
	const formula = getSecondaryFormula()
	const entry = formula.find(entry => secondaryValue == entry[0])
	if (entry) {
		const xp = entry[1]
		document.querySelector("#award-xp-xp").value = xp
	}
}
