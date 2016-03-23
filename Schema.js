// SimpleSchema
Shuttler.Selection.SelectedDocumentSchema = new SimpleSchema({
	from: {
		type: Shuttler.Ref.Schema,
		optional: true
	},
	path: {
		type: Shuttler.Ref.Schema,
		optional: true
	},
	prev: {
		type: String,
		optional: true
	},
	selector: {
		type: String
	}
});

// SimpleSchema
Shuttler.Selection.OptionsSchema = new SimpleSchema({
	isSelector: {
		type: Function,
		optional: true,
		defaultValue: function(selector) {
			return !selector._selected;
		}
	},
	selectorQuery: {
		type: Function,
		optional: true,
		defaultValue: function() {
			return { [this.selectedField]: { $exists: false } };
		}
	},
	isSelected: {
		type: Function,
		optional: true,
		defaultValue: function(selected) {
			return !!selected._selected;
		}
	},
	selectedQuery: {
		type: Function,
		optional: true,
		defaultValue: function() {
			return { [this.selectedField]: { $exists: true } };
		}
	},
	selectedField: {
		type: String,
		optional: true,
		defaultValue: '_selected'
	}
});