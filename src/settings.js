import {getPcs} from "./util.js"

export function registerSettings() {
	game.settings.registerMenu("award-xp", "character-filter-menu", {
		name: "award-xp.settings.filter-character.name",
		hint: "award-xp.settings.filter-character.hint",
		label: "award-xp.settings.filter-character.button",
		icon: "fas fa-filter",
		type: CharacterFilterApplication,
		restricted: true,
	})
	game.settings.register("award-xp", "character-solo-xp-input", {
		name: "award-xp.settings.solo-xp.name",
		hint: "award-xp.settings.solo-xp.hint",
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	})
	game.settings.register("award-xp", "character-filter", {
		scope: "world",
		config: false,
		//type: Array, // The type commented out because type: Array triggers a bug which can be avoided by not mentioning the type (Bug https://gitlab.com/foundrynet/foundryvtt/-/issues/4475 )
		default: [],
	})
	game.settings.register("award-xp", "character-filter-is-blacklist", {
		scope: "world",
		config: false,
		type: Boolean,
		default: true,
	})
	registerSettingsAsync()
}

async function registerSettingsAsync() {
	const rowTemplate = await getTemplate("modules/award-xp/templates/edit_character_filter_dialog_table_row.html")
	Handlebars.registerPartial("awardXpRowTemplate", rowTemplate)
}

class CharacterFilterApplication extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "award-xp-edit-character-filter",
			title: game.i18n.localize("award-xp.settings.filter-character.name"),
			template: "modules/award-xp/templates/edit_character_filter_dialog.html",
		})
	}

	activateListeners(html) {
		super.activateListeners(html)
		html.find("input[name=isBlacklist]").change(this.onListTypeChanged)
		html.find("#award-xp-filter-add-character").click(() => CharacterPickerApplication.open(this))
		html.find(".award-xp-remove-character").click(this.onCharacterRemoveClicked.bind(this))
	}

	onListTypeChanged(event) {
		game.settings.set("award-xp", "character-filter-is-blacklist", this.value == "true")
	}

	getData(options={}) {
		const data = {}
		const characterFilter = game.settings.get("award-xp", "character-filter")
		data.characters = getPcs().filter(pc => characterFilter.includes(pc.id))
		return data
	}

	async _renderInner(...args) {
		const html = await super._renderInner(...args);
		const isBlacklist = game.settings.get("award-xp", "character-filter-is-blacklist")
		html.find(`input[name=isBlacklist][value=${isBlacklist}]`).prop("checked", true)
		return html;
	  }

	async addCharacter(id) {
		const characterFilter = game.settings.get("award-xp", "character-filter")
		characterFilter.push(id)
		await game.settings.set("award-xp", "character-filter", characterFilter)
		this.rerender()
	}

	async onCharacterRemoveClicked(event) {
		const id = event.currentTarget.dataset.id
		const characterFilter = game.settings.get("award-xp", "character-filter")
		characterFilter.splice(characterFilter.indexOf(id), 1)
		await game.settings.set("award-xp", "character-filter", characterFilter)
		this.rerender()
	}

	// Rerender with recalculation of width and height
	async rerender() {
		this.element[0].style.width = null
		this.element[0].style.height = null
		this.position.width = undefined
		this.position.height = undefined
		return this.render(false)
	}
}

class CharacterPickerApplication extends Application {
	constructor (parent, options={}) {
		super(options)
		this.parent = parent
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "award-xp-character-picker",
			title: game.i18n.localize("award-xp.char-picker"),
			template: "modules/award-xp/templates/character_picker_dialog.html",
		})
	}

	static open(parent) {
		new CharacterPickerApplication(parent).render(true)
	}

	getData(options={}) {
		const characterFilter = game.settings.get("award-xp", "character-filter")
		return {characters: getPcs().filter(pc => !characterFilter.includes(pc.id))}
	}

	activateListeners(html) {
		super.activateListeners(html)
		html.find(".award-xp-char").click((event) => this.onCharacterClicked(event))
	}

	onCharacterClicked(event) {
		this.parent.addCharacter(event.currentTarget.dataset.id)
		this.close()
	}
}
