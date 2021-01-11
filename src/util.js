export function getPcs() {
	return game.actors.filter(actor => actor.data.type === "character").map(actor =>{return {id: actor.id, name: actor.data.name, image: actor.data.img}})
}
