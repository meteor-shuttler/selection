// () => this
Shuttler.Selection.prototype.recursionProtection = function() {
	var selection = this;
	
	this._selects.deny({
		selection: function(target, prev, from, path, selector, selection) {
			return !!selection._selects.find(
				lodash.merge(
					target.Ref('_'+selection._sides['target']),
					selection._options.selectedQuery.call(selection),
					{ [selection._options.selectedField+'.selector']: selector }
				)
			).count();
	    }
	});
	
	return this;
};