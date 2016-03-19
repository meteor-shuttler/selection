// (paths: Mongo.Collection, directions: Shuttler.GraphDirectionsSchema) => this
Shuttler.Selection.prototype.byPaths = function(paths, directions) {
	var selection = this;
	
	if (!(paths instanceof Mongo.Collection) || !paths.isGraph)
		throw new Meteor.Error('Collection '+paths._ref+' is not a graph.');
	
	var contextDirections = Shuttler.GraphDirectionsSchema.newContext();
	Shuttler.GraphDirectionsSchema.clean(directions);
	if (!contextDirections.validate(directions))
		throw new Meteor.Error(contextDirections.keyErrorMessage(contextDirections.invalidKeys()[0].name));
	
	this._paths[paths._ref] = {
		graph: paths,
		directions: directions
	};
	
	return this;
};