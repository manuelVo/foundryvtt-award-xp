export function getPcs() {
	return game.actors.filter(actor => actor.data.type === "character" || actor.data.type === "player").map(actor =>{return {id: actor.id, name: actor.data.name, image: actor.data.img}});	
}
