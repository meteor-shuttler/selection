// (paths: Mongo.Collection, directions: Shuttler.GraphDirectionsSchema) => this
Shuttler.Selection.prototype.byPaths = function(paths, directions) {
	var selection = this;
	
	if (!(paths instanceof Mongo.Collection) || !paths.isGraph)
		throw new Meteor.Error('Collection '+paths._name+' is not a graph.');
	
	var contextDirections = Shuttler.GraphDirectionsSchema.newContext();
	Shuttler.GraphDirectionsSchema.clean(directions);
	if (!contextDirections.validate(directions))
		throw new Meteor.Error(contextDirections.keyErrorMessage(contextDirections.invalidKeys()[0].name));
	
	this._paths[paths._name] = {
		graph: paths,
		directions: directions
	};
	
	return this;
};