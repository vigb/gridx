define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"../../core/_Module",
	"dojo/dom-geometry",
	"./Exporter"
], function(declare, lang, _Module, domGeometry){

/*=====
	dojo.declare('__CSVExportArgs', __ExportArgs, {
		//seperator: String?
		//		The seperator string used in CSV. Default to comma ','.
	});

	var __ExportContext = function(){
		//columnIds: String[]
		//		Available for header.
		//columnId: String
		//		Available for header cell or a body cell.
		//rowIds: String[]
		//		Available for a progress
		//rowId: String
		//		Available for a row or a body cell.
		//data: Anything
		//		Available for a body cell
	}
=====*/

	return _Module.register(
	declare(_Module, {
		name: 'table',

		forced: ['exporter'],

		getAPIPath: function(){
			return {
				'exporter': {
					toTable: lang.hitch(this, this.toTable)
				}
			};
		},
	
		//Public ---------------------------------------------------------------------
		toTable: function(/* __CSVExportArgs */ args){
			var t = this;
			t._result = "";
			t._rowIdx = 0;
			return t.grid.exporter._export(t, args || {});
		},

		//Package --------------------------------------------------------------------
		getResult: function(){
			//summary:
			//		Generate the final exported result.
			this._result = '<div style="position: relative;">' + 
				'<div class="grid_view" style="position: absolute; top: 0; left:0px;">' + 
				this._result + 
				'</div></div>';
			return this._result;
		},

		beforeHeader: function(/* __CSVExportArgs */ args, /* __ExportContext */ context){
			//summary:
			//		Triggered before exporting the header cells.
			//return: Boolean|undefined
			//		If return false, does not handle following header cells.
			if(!lang.isArray(context.columnIds) || !context.columnIds.length){
				return false;
			}
			var t = this,
				marginBox = domGeometry.getMarginBox(t.grid.headerNode),
				height = marginBox.h;
			t._totalWidth = marginBox.w;
			t._header = ['<table class="grid_header" style="table-layout:fixed; width:', 
				t._totalWidth, 'px;height:', height, 
				'px;" border="0" cellpadding="0" cellspacing="0"><tbody><tr>'];
			return true;
		},

		handleHeaderCell: function(/* __CSVExportArgs */ args, /* __ExportContext */ context){
			//summary:
			//		Triggered when exporting a header cell.
			var col = this.grid.column(context.columnId, true);
			this._header.push('<th colid="', col.id, '" style="width: ',
				col.getWidth() || 'auto', '">', col.name(), '</th>');
		},

		afterHeader: function(/* __CSVExportArgs */ args, /* __ExportContext */ context){
			//summary:
			//		Triggered when the header has been exported.
			this._header.push('</tr><tbody></table>');
			this._result += this._header.join('');
		},

		beforeBody: function(/* __CSVExportArgs */ args){
			//summary:
			//		Triggered before exporting the grid body.
			//return: Boolean|undefined
			//		If return false, does not handle any of the grid boyd content.
			this._rows = [];
			return true;
		},

		beforeRow: function(/* __CSVExportArgs */ args, /* __ExportContext */  context){
			//summary:
			//		Triggered before exporting a row.
			//return: Boolean|undefined
			//		If return false, does not handle the cells in this rows.
			var t = this,
				rowId = context.rowId,
				rowIndex = t.grid.row(rowId, true).index();
			t._cells = ['<table class="grid_row_', (t._rowIdx++) % 2 ? 'even' : 'odd' , 
				'" style="table-layout:fixed; width:', t._totalWidth, 
				'px;" border="0" cellspacing="0" cellpadding="0" rowId="', rowId,
				'" rowIndex="', rowIndex, '"><tbody><tr>'];
			return true;
		},

		handleCell: function(/* __CSVExportArgs */ args, /* __ExportContext */  context){
			//summary:
			//		Triggered when exporting a cell.
			var data = context.data,
				col = this.grid.column(context.columnId, true);
			if(data === null){
				data = "";
			}else if(data === undefined){
				data = String(grid.cell(context.rowId, context.columnId, true).data()) || "";
			}else{
				data = String(data);
			}
			this._cells.push('<td colid="', col.id, '" style="width: ',
				col.getWidth() || 'auto', '">', data, '</td>');
		},

		afterRow: function(/* __CSVExportArgs */ args, /* __ExportContext */  context){
			//summary:
			//		Triggered when a row has been exported.
			this._cells.push('</tr></tbody></table>');
			this._rows.push(this._cells.join(''));
		},

		afterBody: function(/* __CSVExportArgs */ args){
			//summary:
			//		Triggered when the grid body has been exported.
			this._result += this._rows.join('');
		}
	}));
});
