"use strict";

import {getSecondaryFormula, getSecondaryName} from "./systems.js"

Hooks.on("renderActorDirectory", async (actor_directory, html, data) => {
	const awardButton = $(`<button><i class="fas fa-angle-double-up"></i>${game.i18n.localize("award-xp.award-xp")}</button>`)
	html.find(".directory-footer").append(awardButton)
	awardButton.click((event) => {
		showAwardDialog()
	})
})

async function showAwardDialog() {
	if (!game.user.isGM)
		return
	const secondaryFormula = getSecondaryFormula()
	let secondaryName = undefined
	if (secondaryFormula)
		secondaryName = getSecondaryName() ?? "[secondary name missing]"

	const characters = game.actors.filter(actor => actor.data.type === "character").map(actor =>{return {id: actor.id, name: actor.data.name, image: actor.data.img}})
	const data = {secondaryName, characters}
	const content = await renderTemplate("modules/award-xp/templates/award_experience_dialog.html", data)
	Dialog.prompt({
		content: content,
		label: game.i18n.localize("award-xp.award-xp"),
		render: onAwardDialogRendered,
		callback: awardXP,
		options: {
			width: 250,
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

	const charXp = Math.floor(groupXp / pcs.length)
	pcs.forEach(pc => {
		pc.newXp = pc.xp + charXp
		const updateData = {}
		updateData[pc.xpAttribute] = pc.newXp
		pc.actor.update(updateData)
	})

	renderAwardedMessage(charXp, pcs)
}

async function renderAwardedMessage(charXp, pcs) {
	let message = {}
	message.content = await renderTemplate("modules/award-xp/templates/awarded_experience_message.html", {xp: charXp, characters: pcs.map(pc => pc.actor.name)})
	ChatMessage.create(message)

	const levelups = pcs.filter(pc => pc.newXp >= pc.nextLevelXp)
	if (levelups.length > 0) {
		let message = {}
		message.content = await renderTemplate("modules/award-xp/templates/levelup_message.html", {characters: levelups.map(pc => pc.actor.name)})
		ChatMessage.create(message)
	}
}

function preparePcData(characters) {
	// TODO Make this adjustable via configuration
	return characters.map(actor => {
		return {
			actor: actor,
			xp: actor.data.data.details.xp.value,
			xpAttribute: "data.details.xp.value",
			nextLevelXp: actor.data.data.details.xp.max,
		}
	})
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
