require([
	'gridx/Grid',
	'gridx/core/model/cache/Async',
	'gridx/tests/support/data/ComputerData',
	'gridx/tests/support/stores/Memory',
	'gridx/modules/CellWidget',
	'gridx/modules/extendedSelect/Row',
	'gridx/support/exporter/toCSV',
	'gridx/modules/SingleSort',
	'gridx/modules/filter/Filter',
	'gridx/modules/filter/FilterBar',
	'gridx/modules/pagination/Pagination',
	'gridx/modules/pagination/PaginationBar',
	'gridx/modules/VirtualVScroller',
	'gridx/tests/support/TestPane',
	'dijit/registry',
	'dijit/form/CheckBox',
	'dijit/form/NumberSpinner',
	'dijit/form/SimpleTextarea',
	'dijit/form/Button',
	'dijit/ProgressBar',
	'dijit/Dialog',
	'dojo/domReady!'
], function(Grid, Cache, dataSource, storeFactory, CellWidget, ExtendedSelectRow, toCSV, SingleSort,
			Filter, FilterBar, Pagination, PaginationBar, VirtualVScroller, TestPane, registry){
	grid = new Grid({
		id: 'grid',
		cacheClass: Cache,
		store: storeFactory({
			path: './support/stores',
			dataSource: dataSource,
			size: 1000
		}),
		structure: dataSource.layouts[1],
		modules: [
			CellWidget,
			ExtendedSelectRow,
			SingleSort,
			Filter,
			FilterBar,
			Pagination,
			PaginationBar,
			VirtualVScroller
		],
		autoWidth: true,
		selectRowTriggerOnCell: true
	});
	grid.placeAt('gridContainer');
	grid.startup();

	function showResult(result){
		registry.byId('resultArea').set('value', result);
		registry.byId('resultDialog').show();
	}

	function onError(err){
		console.error('Fatal error: ', err);
	}

	function onProgress(progress){
		registry.byId('exportProgress').set('value', progress);
		var s = registry.byId('exportProgress').domNode.style;
		if(progress < 1){
			s.display = 'block';
		}else{
			setTimeout(function(){
				s.display = 'none';
			}, 500);
		}
	}

	exportCSV = function(){
		var args = {
			selectedOnly: registry.byId('selectedRows').get('checked'),
			omitHeader: registry.byId('omitHeader').get('checked'),
			useStoreData: registry.byId('useStoreData').get('checked')
		};
		if(registry.byId('allowSeparator').get('checked')){
			args.separator = registry.byId('separator').get('value');
		}
		if(registry.byId('allowStartIndex').get('checked')){
			args.start = registry.byId('startIndex').get('value');
		}
		if(registry.byId('allowRowCount').get('checked')){
			args.count = registry.byId('rowCount').get('value');
		}
		if(registry.byId('allowProgressStep').get('checked')){
			args.progressStep = registry.byId('progressStep').get('value');
		}
		if(registry.byId('filter').get('checked')){
			args.filter = function(row){
				return /Windows/.test(row.data().platform);
			};
		}
		if(registry.byId('allowFormatters').get('checked')){
			var fs = args.formatters = {};
			if(registry.byId('formatStatus').get('checked')){
				fs.status = function(cell){
					return {
						Warning: 'W',
						Critical: 'C',
						Normal: 'N'
					}[cell.data()];
				};
			}
			if(registry.byId('formatProgress').get('checked')){
				fs.progress = function(cell){
					return cell.data() * 100 + '%';
				};
			}
		}
		if(registry.byId('allowChooseColumns').get('checked')){
			var cols = args.columns = [];
			grid.columns().forEach(function(c){
				var cb = registry.byId('col-' + c.id);
				if(cb.get('checked')){
					cols.push(c.id);
				}
			});
		}
		console.log(args);
		toCSV(grid, args).then(showResult, onError, onProgress);
	};

	//Test
	toggleSeparator = function(){
		registry.byId('separator').set('disabled', !this.get('checked'));
	};
	toggleProgressStep = function(){
		registry.byId('progressStep').set('disabled', !this.get('checked'));
	};
	toggleStartIndex = function(){
		registry.byId('startIndex').set('disabled', !this.get('checked'));
	};
	toggleRowCount = function(){
		registry.byId('rowCount').set('disabled', !this.get('checked'));
	};
	toggleFormatters = function(){
		document.getElementById('formatters').style.display = this.get('checked') ? 'block' : 'none';
	};
	toggleChooseColumns = function(){
		document.getElementById('choosecolumns').style.display = this.get('checked') ? 'block' : 'none';
	};

	var tests = [
		'<div style="font-weight: bolder; padding: 5px;">CSV Arguments</div>',
		'<input id="allowSeparator" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
			'onChange: toggleSeparator',
		'"/>',
			'<span id="separator" data-dojo-type="dijit.form.TextBox" style="width: 50px;" data-dojo-props="',
				'value: \',\',',
				'disabled: true',
			'" ></span><label for="allowSeparator">Separator</label><br />',

		'<div style="font-weight: bolder; padding: 5px;">Export Arguments</div>',
		'<input id="allowProgressStep" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
			'onChange: toggleProgressStep',
		'"/>',
			'<span id="progressStep" data-dojo-type="dijit.form.NumberSpinner" style="width: 50px;" data-dojo-props="',
				'value: 20,',
				'constraints: {min: 1, max: 200},',
				'disabled: true',
			'" ></span><label for="allowProgress">Progress Step</label><br />',

		'<input id="allowStartIndex" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
			'onChange: toggleStartIndex',
		'"/>',
			'<span id="startIndex" data-dojo-type="dijit.form.NumberSpinner" style="width: 50px;" data-dojo-props="',
				'value: 0,',
				'constraints: {min: 0, max: 999},',
				'disabled: true',
			'" ></span><label for="allowStartIndex">Start Row Index</label><br />',

		'<input id="allowRowCount" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
			'onChange: toggleRowCount',
		'"/>',
			'<span id="rowCount" data-dojo-type="dijit.form.NumberSpinner" style="width: 50px;" data-dojo-props="',
				'value: 100,',
				'constraints: {min: 1, max: 1000},',
				'disabled: true',
			'" ></span><label for="allowRowCount">Row Count</label><br />',

		'<input id="omitHeader" type="checkbox" data-dojo-type="dijit.form.CheckBox"/>',
			'<label for="omitHeader">Omit Header</label><br />',

		'<input id="selectedRows" type="checkbox" data-dojo-type="dijit.form.CheckBox"/>',
			'<label for="selectedRows">Selected Rows Only</label><br />',

		'<input id="filter" type="checkbox" data-dojo-type="dijit.form.CheckBox"/>',
			'<label for="filter">Filter "Windows"</label><br />',

		'<input id="useStoreData" type="checkbox" data-dojo-type="dijit.form.CheckBox"/>',
			'<label for="useStoreData">Use Store Data</label><br />',

		'<input id="allowFormatters" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
			'onChange: toggleFormatters',
		'"/><label for="allowFormatters">Use Formatters</label><br />',
		'<div id="formatters" style="padding: 5px; display: none;">',
			'<input id="formatStatus" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
				'checked: true',
			'"/><label for="formatStatus">Format Column "Status"</label><br />',
			'<input id="formatProgress" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
				'checked: true',
			'"/><label for="formatProgress">Format Column "Progress"</label><br />',
		'</div>',

		'<input id="allowChooseColumns" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="',
			'onChange: toggleChooseColumns',
		'"/><label for="allowChooseColumns">Choose Columns</label><br />',
		'<div id="choosecolumns" style="padding: 5px; display: none;">'
	];
	tests = tests.concat(grid.columns().map(function(c){
		return [
			'<input id="col-', c.id,
			'" type="checkbox" data-dojo-type="dijit.form.CheckBox" data-dojo-props="checked: true"/><label for="col-',
			c.id, '">', c.name(), '</label><br />'
		].join('');
	}));
	tests.push([
		'</div><div data-dojo-type="dijit.form.Button" data-dojo-props="onClick: exportCSV">Export to CSV</div>',
		'<div id="exportProgress" data-dojo-type="dijit.ProgressBar" style="display: none;" data-dojo-props="',
			'minimum: 0, maximum: 1',
		'"></div>'
	].join(''));

	var tp = new TestPane({});
	tp.placeAt('ctrlPane');
	tp.addTestSet('Export', tests.join(''));
	tp.startup();
});
