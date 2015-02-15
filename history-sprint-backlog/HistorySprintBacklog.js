/**
 * History Sprint Backlog App for Rally, SDK 2.0rc3
 * https://help.rallydev.com/apps/2.0rc3/doc/
 *
 * Author: Michal Pirgl 
 *
 * Changelog:
 * 2015-02-15 version 0.2:
 *  - Workspace and project taken from Rally.environment.getContext().
 *  - Cleaning of the comments.
 *  - Rename from "History Backlog" to "History Sprint Backlog"
 *
 * 2015-01-07 version 0.1:
 *  - Initial beta version with date picker and grid of stories bellow.
 *  - Workspace and project should be selected by the Rally context.
 *
 * Todo:
 *  - Show integers in Rank column (it's already sorted by Rank)
 *  - Improve UI (title, intro message)
 *  - Better layout, maybe...
 */
    Ext.define('HistorySprintBacklog', {
        extend: 'Rally.app.App',

        layout: 'auto',

        appName: 'History Sprint Backlog',

        componentCls: 'app',

        cls: 'history-sprint-backlog-app',

        items:[
            {
                xtype:'container',
                itemId:'header',
                cls:'header'
            },
            {
                xtype:'container',
                itemId:'bodyContainer'
            }
        ],

        launch: function() {
            var that = this;
            var minDate = new Date(new Date() - 86400000*180); //milliseconds in day = 86400000
            var datePicker = Ext.create('Ext.panel.Panel', {
                title: 'Choose backlog date',
                bodyPadding: 10,
                renderTo: Ext.getBody(),
                layout: 'hbox',
                items: [{
                    xtype: 'rallydatepicker',
                    itemId: 'from',
                    minDate: minDate,
                    handler: function(picker, date) {
                         //console.log("Date " + date);
                         that._getStories(date);
                    }
                }]
            });
            this.down('#header').add(datePicker);
        },

        _getStories: function(date) {
            var that = this;
            var snapshotStore = Ext.create('Rally.data.lookback.SnapshotStore', {
                autoLoad: true,
                context: {
                    workspace: Rally.environment.getContext().getWorkspace()
                },
                find: {
                    Project: Rally.environment.getContext().getProject().OID,
                    _TypeHierarchy: "HierarchicalRequirement",
                    __At: date, // '2014-10-28T00:00:00Z'
                    Children: null // leafs only, https://rally1.rallydev.com/analytics/doc#leafstoriesandportfolioitems
                },
                sort: { "DragAndDropRank": 1 },
                fetch: ['DragAndDropRank', 'FormattedID', 'Name', 'ScheduleState', 'Type'],
                hydrate: ['ScheduleState'],
                listeners: {
                    scope: this,
                    beforeload: function(store, operation, opts) {
                        this.setLoading(true);
                    },
                    load: function(store, data, success){
                        this._showGrid(store, date);
                    }
                }
            });
        },
        _showGrid: function(store, date) {
            if ( ! this.grid ) {
                this.grid = Ext.create('Rally.ui.grid.Grid',{
                    itemId: 'myGrid',
                    store: store,
                    columnCfgs: [ 
                        { text: 'Rank', dataIndex: 'DragAndDropRank', width: '30' }, 
                        { text: 'ID', dataIndex: 'FormattedID', width: '40' }, 
                        { text: 'Name', dataIndex: 'Name', flex: 1},
                        { text: 'ValidFrom', dataIndex: '_ValidFrom'},
                        { text: 'ValidTo', dataIndex: '_ValidTo'}                        
                    ]
                });
                this.down('#bodyContainer').add(this.grid);
            }
            else
            {
                this.grid.reconfigure(store);
            }
            this.grid.setTitle( 'Backlog @ ' + date );
            this.setLoading(false);
        }
    });