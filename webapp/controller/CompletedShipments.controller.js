let interval;
let busyDialog = new sap.m.BusyDialog({});
let browserLanguage = window.navigator.language;
function checkOrientation() {
    let orientation = window.orientation;
    let width = window.innerWidth;
    let dialog;
    if (orientation === 0 && width < 860) {
        let message;
        if (browserLang.includes('en')) message = "Please turn your device to landscape orientation.";
        if (browserLang.includes('cs')) message = "Otočte prosím zařízení na šířku.";
        if (browserLang.includes('de')) message = "Bitte drehen Sie Ihr Gerät ins Querformat.";
        dialog = new sap.m.Dialog({
            title: "Device Orientation",
            type: "Message",
            content: [
                new sap.m.Image({
                    src: "/Images/responsive.png",
                    width: "100%"
                }),
                new sap.m.Text({
                    text: message
                })
            ],
            beginButton: new sap.m.Button({
                text: "OK",
                press: function () {
                    dialog.close();
                }
            })
        });
        dialog.addStyleClass("myMessageBox");
        dialog.open();
        window.addEventListener("orientationchange", function () {
            // Check if orientation is landscape
            if (window.orientation === 90 || window.orientation === -90) {
                // Close the message box
                dialog.close();
            }
        });
    }
}
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("resize", checkOrientation);
checkOrientation();
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
    "sap/ui/model/resource/ResourceModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,History,ResourceModel) {
        "use strict";
        return Controller.extend("demo.controller.CompletedShipments", {
            onInit: function () {
                const that = this;
                const oRouter = this.getOwnerComponent().getRouter(); 
                oRouter.getRoute("completedShipments").attachMatched(this.handleRouteMatched, this);
                const noDataContainer = this.getView().byId('emptyPage');
                const noDataDisplayCont = this.getView().byId('emptyPageDisplayCont');
                const icon = new sap.ui.core.Icon({src: 'sap-icon://message-warning'});
                const text = new sap.m.Text({});
                if(browserLanguage.includes('cs')) text.setText('Nenalezena žádná data');
                if(browserLanguage.includes('de')) text.setText('Keine daten gefunden');
                if(browserLanguage.includes('en')) text.setText('No data found');
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
                sap.ui.getCore().getConfiguration().setLanguage(browserLanguage);
                const oResourceModel = new ResourceModel({
                    bundleName: "demo.i18n.i18n.properties",
                    supportedLocales: ["", "de", "cs"],
                    fallbackLocale: ""
                });
                console.log(oResourceModel);
                sap.ui.getCore().setModel(oResourceModel, "i18n");
                setInterval(() => {
                    getData(that);
                }, 1000);
            },
            onNavigateBack : function(){
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
                busyDialog.open();
                setTimeout(() => {
                    if(this.getView().getModel() != undefined || this.getView().getModel() != null){
                        this.getView().getModel().updateBindings();
                    }
                    busyDialog.close();
                }, 1000);
            }
        });
    });
