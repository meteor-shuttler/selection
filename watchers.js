// () => this
Shuttler.Selection.prototype.watchSelections = function() {
	var selection = this;
	
	this._selects.after.link[selection._sides.target](function(userId, unselected, selected, fieldNames, modifier, options) {
		var selected = selection._selects._transform(selected);
		if (selection.isSelected(selected)) {
			selection.selectBySelected(selected);
		} else if (selection.isSelector(selected)) {
			selection.selectBySelector(selected);
		}
	});
	
	this._selects.after.unlink[selection._sides.target](function(userId, unselected, selected, fieldNames, modifier, options) {
		var unselected = selection._selects._transform(unselected);
		if (selection.isSelected(unselected)) {
			selection.unselectByPrevSelected(unselected);
		} else if (selection.isSelector(unselected)) {
			selection.unselectBySelector(unselected);
		}
	});
	
	this._selects.after.link[selection._sides.source](function(userId, unselected, selected, fieldNames, modifier, options) {
		var selected = selection._selects._transform(selected);
		if (unselected && selection.isSelector(selected)) {
			selection.reselectBySelector('source', selected);
		}
	});
	
	return this;
};

// (paths: Mongo.Collection) => this
Shuttler.Selection.prototype.watchPaths = function(paths) {
	var selection = this;
	
	if (!(paths instanceof Mongo.Collection) || !paths.isGraph)
		throw new Meteor.Error('Collection '+paths._name+' is not a graph.');
	
	if (!(paths._name in this._paths))
		throw new Meteor.Error('Collection '+paths._name+' is defined as this selection paths.');
	
	paths.after.link(function(userId, unpathed, pathed, fieldNames, modifier, options) {
		var pathed = paths._transform(pathed);
		selection.selectInPath(pathed);
	});
	
	paths.after.unlink(function(userId, unpathed, pathed, fieldNames, modifier, options) {
		var unpathed = paths._transform(unpathed);
		selection.unselectInPath(unpathed);
	});
	
	return this;
};