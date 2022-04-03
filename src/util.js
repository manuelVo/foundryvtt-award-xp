export function getPcs() {
	let actors = game.actors.filter(actor => actor.data.type === "character").map(actor =>{return {id: actor.id, name: actor.data.name, image: actor.data.img}});
	let actors_aos = game.actors.filter(actor => actor.data.type === "player").map(actor =>{return {id: actor.id, name: actor.data.name, image: actor.data.img}});	
	return actors.concat(actors_aos);
}
