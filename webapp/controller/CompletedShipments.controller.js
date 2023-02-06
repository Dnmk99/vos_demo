let interval;
let busyDialog = new sap.m.BusyDialog({});
function getData(that){
    const globalModel = sap.ui.getCore().getModel("globalModel");
    const mainContainer = that.getView().byId('mainContainer');
    const noDataContainer = that.getView().byId('emptyPage');
    if (globalModel.oData.CompletedShipments.length > '0') {
        mainContainer.setHeight('100%');
        noDataContainer.removeAllItems();
        noDataContainer.setWidth('0%');
        noDataContainer.setHeight('0%');
    }
    that.getView().setModel(globalModel);
}
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,History) {
        "use strict";
        return Controller.extend("demo.controller.CompletedShipments", {
            onInit: function () {
                const that = this;
                const oRouter = this.getOwnerComponent().getRouter(); 
                oRouter.getRoute("completedShipments").attachMatched(this.handleRouteMatched, this);
                const noDataContainer = this.getView().byId('emptyPage');
                const noDataDisplayCont = this.getView().byId('emptyPageDisplayCont');
                const icon = new sap.ui.core.Icon({src: 'sap-icon://message-warning'});
                const text = new sap.m.Text({text: 'Nenalezena žádná data'});
                noDataContainer.setWidth('100%');
                noDataContainer.setHeight('100%');
                noDataContainer.setJustifyContent('Center');
                noDataContainer.setAlignItems('Center');
                icon.addStyleClass('emptyPageIcon');
                text.addStyleClass('emptyPageText');
                noDataDisplayCont.addItem(icon);
                noDataDisplayCont.addItem(text);
                getData(that);
            },
            handleRouteMatched : function (oEvent) { //triggers everytime page is displayed
                const that = this;
                setInterval(() => {
                    getData(that);
                }, 1000);
            },
            onNavigateBack(){
                window.clearInterval(interval);
                let oHistory, sPreviousHash;
                oHistory = History.getInstance();
                sPreviousHash = oHistory.getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    const oRouter = this.getOwnerComponent().getRouter(); 
                    oRouter.navTo("RouteView1", {}, true);
			    }
            },
            onRefresh : function(){
                console.log(this.getView().getModel());
                busyDialog.open();
                setTimeout(() => {
                    busyDialog.close();
                    if(this.getView().getModel() != undefined || this.getView().getModel() != null){
                        this.getView().getModel().updateBindings();
                        console.log(this.getView().getModel());
                    }
                }, 1000);
            }
        });
    });
