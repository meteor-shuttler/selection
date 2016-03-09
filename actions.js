// получить селектор из связи
// get selector by selected
// .getSelector(selected/selector: Document) => String|undefined
Shuttler.Selection.prototype.getSelector = function(selected) {
	if (this.isSelected(selected))
		return selected[this._options.selectedField].selector;
	else if (this.isSelector(selected))
		return selected._id;
	else return undefined;
};

// найти все пути от сорса/таргета
// find all paths from source/target
// .findPathsBy(directions: 'sources'/'targets', object: Document, handler: .call(this, path: Document, direction: 'source'/'target'/'link', graph: Mongo.Collection)) => this
Shuttler.Selection.prototype.eachPathsBy = function(directions, object, handler) {
	var selection = this;
	lodash.each(this._paths, function(_path) {
		lodash.each(_path.directions[directions], function(direction) {
			if (
				direction == 'link' // object can be a path
				&& object.Ref().collection == _path.graph._name // object in path collection
			) {
				handler.call(this, object, direction, _path.graph);
			} else { // find path as path.(source/target)
				_path.graph.find(object.Ref('_'+direction)).forEach(function(path) {
					handler.call(selection, path, direction, _path.graph);
				});
			}
		});
	});
	return this;
};

// найти все выделенные от сорса/таргета
// find all selected from source/target
// .eachSelectedBy(side: 'source'/'target', object: Document, handler: .call(this, selected: Document)) => this
Shuttler.Selection.prototype.eachSelectedBy = function(side, object, handler) {
	var selection = this;
	selection._selects.find(
		lodash.merge(
			object.Ref('_'+selection._sides[side]),
			this._options.selectedQuery.call(this)
		)
	).forEach(function(selected) {
		handler.call(selection, selected);
	});
	return this;
};

// найти все сорсы/таргеты пути (согласно directions)
// find all sources/targets of path
// .eachDirectionsOfPath(directions: 'sources'/'targets', path: Document, handler: .call(this, object: Document, path: Document, graph: Mongo.Collection)) => this
Shuttler.Selection.prototype.eachDirectionsOfPath = function(directions, path, handler) {
	var selection = this;
	lodash.each(this._paths[path.Ref().collection].directions[directions], function(direction) {
		handler.call(selection, Shuttler.getDocumentByDirection(direction, path), path, selection._paths[path.Ref().collection]);
	});
	return this;
};

// выделить от правила
// insert first selected to selector
// .selectBySelector(selector: Document) => this
Shuttler.Selection.prototype.selectBySelector = function(selector) {
	if (this._selects.checkRestrictions('selection', selector[this._sides.target](), selector, undefined, undefined, this)) {
		this._selects.insert({
			['_'+this._sides.target]: selector['_'+this._sides.target],
			['_'+this._sides.source]: selector['_'+this._sides.source],
			[this._options.selectedField]: { selector: selector._id }
		});
	}
	return this;
};

// выделить от выделения
// select from selected
// .selectBySelected(selected: Document) => this
Shuttler.Selection.prototype.selectBySelected = function(selected) {
	var selection = this;
	this.selectFromSourceBySelected(selected[this._sides.target](), selected);
	return this;
};

// выделить от сорса по всем путям конкретным выделением
// find all paths from source and insert to each path.targets selected
// .selectFromSourceBySelected(source: Document, selected: Document) => this
Shuttler.Selection.prototype.selectFromSourceBySelected = function(source, selected) {
	var selection = this;
	this.eachPathsBy('sources', source, function(path, pathDirection, graph) {
		lodash.each(this._paths[graph._name].directions.targets, function(direction) {
			selection.selectTargetInPathBySelected(
				Shuttler.getDocumentByDirection(direction, path),
				path, Shuttler.getRefByDirection(pathDirection, path),
				selected
			);
		});
	});
	return this;
};

// выделить от сорса по всем путям всеми доступными выделениями
// find all paths from source and insert to each path.targets each source selection
// .selectFromSource(source: Document) => this
Shuttler.Selection.prototype.selectFromSource = function(source) {
	this.eachSelectedBy(this._sides.target, source, function(selected) {
		this.selectFromSourceBySelected(source, selected);
	});
	return this;
};

// выделить по конкретному пути конкретным выделением
// find all path.targets and insert to it selected
// .selectInPathBySelected(path: Document, from: Document|Ref, selected: Document) => this
Shuttler.Selection.prototype.selectInPathBySelected = function(path, from, selected) {
	var selection = this;
	var _path = this._paths[path.Ref().collection];
	this.eachDirectionsOfPath('targets', path, function(target) {
		selection.selectTargetInPathBySelected(target, path, from, selected);
	});
	return this;
};

// выделить всё по конкретному пути всеми доступными выделениями
// find all path.targets and insert to it each path.sources selection
// .selectInPath(path: Document) => this
Shuttler.Selection.prototype.selectInPath = function(path) {
	var selection = this;
	this.eachDirectionsOfPath('targets', path, function(target) {
		this.selectTargetInPath(target, path);
	});
	return this;
};

// выделить таргет по конкретному пути конкретным выделением
// insert selected to target
// .selectTargetInPathBySelected(target: Document, path: Document, from: Document|Ref, selected: Document) => this
Shuttler.Selection.prototype.selectTargetInPathBySelected = function(target, path, from, selected) {
	var from = Shuttler.Ref.new(from);
	var selection = this;
	if (this._selects.checkRestrictions('selection', target, selected, from, path, this)) {
		this._selects.insert({
			['_'+this._sides.target]: target.Ref(),
			['_'+this._sides.source]: selected['_'+this._sides.source],
			[this._options.selectedField]: {
				from: from,
				path: path.Ref(),
				prev: selected._id,
				selector: selection.getSelector(selected)
			}
		});
	}
	return this;
};

// выделить таргет по конкретному пути всеми доступными выделениями
// insert each path.sources selection to target
// .selectTargetInPath(target: Document, path: Document) => this
Shuttler.Selection.prototype.selectTargetInPath = function(target, path) {
	var selection = this;
	this.eachDirectionsOfPath('sources', path, function(source) {
		this.eachSelectedBy('target', source, function(selected) {
			this.selectTargetInPathBySelected(target, path, source, selected);
		});
	});
	return this;
};

// выделить таргет по всем путям всеми доступными выделениями
// find all paths from target and insert to target each path.sources selection
// .selectTarget(target: Document) => this
Shuttler.Selection.prototype.selectTarget = function(target) {
	var selection = this;
	this.eachPathsBy('targets', target, function(path) {
		this.selectTargetInPath(target, path);
	});
	return this;
};

// сдвинуть все селекты определенного селектора определённой стороной
// reselectBySelector(side: 'source'|'target', selector: Document) => this
Shuttler.Selection.prototype.reselectBySelector = function(side, selector) {
	var selection = this;
	this._selects.update({ [this._options.selectedField+'.selector']: selector._id }, {
		$set: selector[selection._sides[side]]().Ref('_'+selection._sides[side])
	}, { multi: true });
	return this;
};

// убрать от правила
// remove first selected from selector
// .unselectBySelector(selector: Document) => this
Shuttler.Selection.prototype.unselectBySelector = function(selector) {
	this._selects.remove({
		[this._options.selectedField+'.selector']: selector._id,
		[this._options.selectedField+'.prev']: { $exists: false },
		[this._options.selectedField+'.path']: { $exists: false },
		[this._options.selectedField+'.from']: { $exists: false },
		'_source.id': selector._source.id, '_source.collection': selector._source.collection,
		'_target.id': selector._target.id, '_target.collection': selector._target.collection
	});
	return this;
};

// убрать всех кто есть на этом пути
// clear path from any selected
// .unselectInPath(path: Document|Ref) => this
Shuttler.Selection.prototype.unselectInPath = function(path) {
	var selection = this;
	var path = Shuttler.Ref.soft(path);
	var pathRef = path.Ref(this._options.selectedField+'.path');
	var query = pathRef;
	query.$or = [];
	lodash.each(this._paths[pathRef[this._options.selectedField+'.path.collection']].directions.sources, function(source) {
		query.$or.push({
			[selection._options.selectedField+'.from.id']: path['_'+source].id,
			[selection._options.selectedField+'.from.collection']: path['_'+source].collection
		});
	});
	this._selects.remove(query);
	return this;
};

// убрать всех от выделения
// remove all with .prev: selected._id
// .unselectByPrevSelected(selected: Document) => this
Shuttler.Selection.prototype.unselectByPrevSelected = function(selected) {
	var selection = this;
	this._selects.remove({
		[this._options.selectedField+'.selector']: selected[this._options.selectedField].selector,
		[this._options.selectedField+'.prev']: selected._id
	});
	return this;
};

// проверка на соответствие условиям выделения
// sheck with query

// .isSelected(selected: Document) => Boolean
Shuttler.Selection.prototype.isSelected = function(selected) {
	return this._options.isSelected(selected);
};

// .isSelector(selector: Document) => Boolean
Shuttler.Selection.prototype.isSelector = function(selector) {
	return this._options.isSelector(selector);
};