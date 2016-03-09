# Selection

Link in a graph as a property. Multiple, controlled, atomically, properties inheritable on graphs.

## Install

```
meteor add shuttler:selection
```

##### Required
* [shuttler:ref](https://github.com/meteor-shuttler/ref)
* [shuttler:graphs](https://github.com/meteor-shuttler/graphs)

## Documentation

### Selection

In one graph can be created by a few more selections.In

#### [new] Shuttler.Selection
> (selects: Mongo.Collection, sides: Shuttler.GraphSidesSchema, options: Shuttler.Selection.OptionsSchema)

It creates a an instance of controlled selection.
If you do not activate some watchers and do not cause any methods that do not act independently.

```js
var paths = new Mongo.Collection('paths');
paths.attachGraph();

var properties = new Mongo.Collection('properties');
properties.attachGraph();
Shuttler.Selection(properties);
```

#### Shuttler.Selection.OptionsSchema

##### isSelector
> Function

By default: 
```js
function(selector) {
	return !selector._selected;
}
```

##### selectorQuery
> Function.call(selection)

By default: 
```js
function() {
	return { [this._options.selectedField]: { $exists: false } };
}
```

##### isSelected
> Function

By default: 
```js
function(selected) {
	return !!selected._selected;
}
```

##### selectedQuery
> Function.call(selection)

By default: 
```js
function() {
	return { [this._options.selectedField]: { $exists: true } };
}
```

##### selectedField
> String = '_selected'

### Actions

#### .getSelector
> (selected: Document) => String|undefined

#### .findPathsBy
> (directions: 'sources'/'targets', object: Document, handler: .call(this, path:
Document, direction: 'source'/'target'/'link', graph: Mongo.Collection)) => this
find all paths from source/target

#### .eachSelectedBy
> (side: 'source'/'target', object: Document, handler: .call(this, selected:
Document)) => this
find all selected from source/target

#### .eachDirectionsOfPath
> (directions: 'sources'/'targets', path: Document, handler: .call(this, object:
Document, path: Document, graph: Mongo.Collection)) => this
find all sources/targets of path

#### .selectBySelector
> (selector: Document) => this

insert first selected to selector

#### .selectBySelected
> (selected: Document) => this

select from selected

#### .selectFromSourceBySelected
> (source: Document, selected: Document) => this

find all paths from source and insert to each path.targets selected

#### .selectFromSource
> (source: Document) => this

find all paths from source and insert to each path.targets each source selection

#### .selectInPathBySelected
> (path: Document, from: Document|Ref, selected: Document) => this

find all path.targets and insert to it selected

#### .selectInPath
> (path: Document) => this

find all path.targets and insert to it each path.sources selection

#### .selectTargetInPathBySelected
> (target: Document, path: Document, from: Document|Ref, selected: Document) =>
this
insert selected to target

#### .selectTargetInPath
> (target: Document, path: Document) => this

insert each path.sources selection to target

#### .selectTarget
> (target: Document) => this

find all paths from target and insert to target each path.sources selection

#### .unselectBySelector
> (selector: Document) => this

remove first selected from selector

#### .unselectInPath
> (path: Document|Ref) => this

clear path from any selected

#### .unselectByPrevSelected
> (selected: Document) => this

remove all with .prev: selected._id

#### .isSelected
> (selected: Document) => Boolean

#### .isSelector
> (selector: Document) => Boolean

### Restrictions

#### selection
> (target: Document, prev: Document, from?: Ref, path?: Document, selection?: Shuttle.Selection)

```js
graph.deny({
    selection: function(target, prev, from, path, selection) {
        return false;
    }
});
```

### Watchers

#### .watchSelections
> ()

It maintains integrity in the event of a change `selected` and` selector` links in current selection.

#### .watchPaths
> (paths: Mongo.Collection)

It maintains the integrity of the `selected` link in the event of changes in the paths the graph.

### .byPaths
> (paths: Mongo.Collection, directions: Shuttler.GraphDirectionsSchema) => this

Sets a graph as a path for distribution of this selection.

Add to the array `selection._paths` object `{ graph: paths, directions: directions }`.

Actions will operate on the basis of the registered paths.

#### paths
> Mongo.Collection

#### [Shuttler.GraphDirectionsSchema](https://github.com/meteor-shuttler/graphs#shuttlergraphdirectionsschema)