// [new] (selects: Mongo.Collection, sides: Shuttler.GraphSidesSchema, options: Shuttler.Selection.OptionsSchema)
Shuttler.Selection = function(selects, sides, options) {
	var selection = this;
	
	if (!(this instanceof Shuttler.Selection))
		return new Shuttler.Selection(selects, sides);
		
	if (!(selects instanceof Mongo.Collection) || !selects.isGraph)
		throw new Meteor.Error('Collection '+selects._ref+' is not a graph.');
	
	this._selects = selects;
	
	if (!sides) var sides = {};
	var contextSides = Shuttler.GraphSidesSchema.newContext();
	Shuttler.GraphSidesSchema.clean(sides);
	if (!contextSides.validate(sides))
		throw new Meteor.Error(contextSides.keyErrorMessage(contextSides.invalidKeys()[0].name));
	
	this._sides = sides;
	
	if (!options) var options = {};
	var contextOptions = Shuttler.Selection.OptionsSchema.newContext();
	Shuttler.Selection.OptionsSchema.clean(options);
	if (!contextOptions.validate(options))
		throw new Meteor.Error(contextOptions.keyErrorMessage(contextOptions.invalidKeys()[0].name));
	
	this._selects.attachSchema(new SimpleSchema({
		[options.selectedField]: {
			type: Shuttler.Selection.SelectedDocumentSchema,
			optional: true
		}
	}));
	
	this._options = options;
	
	this._paths = {};
};

Shuttler.Selection.prototype.isSelector = function() { return this._options.isSelector.apply(this, arguments); };
Shuttler.Selection.prototype.selectorQuery = function() { return this._options.selectorQuery.apply(this, arguments); };
Shuttler.Selection.prototype.isSelected = function() { return this._options.isSelected.apply(this, arguments); };
Shuttler.Selection.prototype.selectedQuery = function() { return this._options.selectedQuery.apply(this, arguments); };