let timer;
function dhm(ms) {
    const days = Math.floor(Number(ms) / (24 * 60 * 60 * 1000));
    const daysms = Number(ms) % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = Number(ms) % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = Number(ms) % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);
    return days + "d" + " : " + hours + "h" + " : " + minutes + "m";
}
function sortArray( a, b ) {
    if ( a.shipmentTimeLeft < b.shipmentTimeLeft ){
      return -1;
    }
    if ( a.shipmentTimeLeft > b.shipmentTimeLeft ){
      return 1;
    }
    return 0;
  }
function stopTimer() {
    clearInterval(timer);
}
function main(dataObj, that) {
    const shipmentsModel = new sap.ui.model.json.JSONModel();
    const shipmentsArr = [];
    shipmentsModel['oData'] = [];
    shipmentsModel.oData['Shipments'] = [];
    shipmentsModel.oData['CompletedShipments'] = [];
    shipmentsModel.oData['Refresh'] = new Date().toLocaleTimeString('cs-CZ');
    let progress;
    for (const [key, value] of Object.entries(dataObj)) {
        //date
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const ms = value.Dptbg.match(/(\d+)/)[0];
        const shipmentDate = new Date(Number(ms)).toLocaleDateString('cs-CZ', options);
        //time 
        const hours = value.Uptbg.slice(2, 4)
        const minutes = value.Uptbg.slice(5, 7);
        const seconds = value.Uptbg.slice(8, 10);
        const shipmentTime = hours + ":" + minutes + ":" + seconds;
        const timeLeft = dhm(Number(ms) - Number(new Date().getTime()));
        if (value.closedHu != 0) {
            progress = (Number(value.ClosedHu) / Number(value.TotalHu) * 100).toFixed(0);
        } else {
            progress = 0;
        }
        const openHu = Number(value.TotalHu) - Number(value.ClosedHu);
        if(Number(openHu > 0)) value.ClosedHu++;
        const shipmentsObj = {
            hall: value.Hall,
            referenceNumber: value.Tknum,
            shipperName: value.ShipperName,
            shipperNumber: value.Signi,
            shipToParty: value.Kunwe,
            serviceAgent: value.Tdlnr,
            asnState: value.Asn,
            externalId_1: value.Exti1,
            externalId_2: value.Exti2,
            packInfo: value.PackInfo,
            packType: value.PackType,
            disponent: value.Disponent,
            shipmentDate: shipmentDate,     //Planned date for start of shipment
            shipmentDateMs : ms,
            shipmentTime: shipmentTime,     // Planned transport start time
            shipmentTimeLeft: timeLeft,
            shipmentTimeLeftMs : ms - new Date().getTime(),
            Dptbg :value.Dptbg,
            Uptbg : value.Uptbg,
            shipmentDescription: value.Tpbez,
            closedHu: value.ClosedHu,
            totalHu: value.TotalHu,
            openHu: openHu,
            unitsOfMeasure: value.Meins,   //Base Unit of Measure
            customerName: value.CustomerName,
            unloadingPoint: value.Ablad,
            loadProgress: progress,
            state: 'None',
            txtClass: '',
            asnClass: '',
            dateClass: '', 
            logo: ''
        }
        //logo
        if (shipmentsObj.customerName.toLowerCase().includes('aston')) shipmentsObj.logo = '/Images/aston.png';
        if (shipmentsObj.customerName.toLowerCase().includes('porsche')) shipmentsObj.logo = '/Images/porsche.png';
        if (shipmentsObj.customerName.toLowerCase().includes('škoda')) shipmentsObj.logo = '/Images/skoda.png';
        if (shipmentsObj.customerName.toLowerCase().includes('volkswagen')) shipmentsObj.logo = '/Images/vw.png';
        //progress bar
        if (progress < 60) {
            shipmentsObj.state = "Error";
            shipmentsObj.txtClass = "classRed";
        } else if (progress >= 60 && progress < 80) {
            shipmentsObj.state = "Warning";
            shipmentsObj.txtClass = "classOrange";
        } else {
            shipmentsObj.state = "Success";
            shipmentsObj.txtClass = "classGreen";
        }
        //asn state
        if (shipmentsObj.asnState == "true") {
            shipmentsObj.asnClass = "classGreen";
            shipmentsObj.asnState = "Odesláno";
        } else {
            shipmentsObj.asnClass = "classRed";
            shipmentsObj.asnState = "Neodesláno";
        }
        if (shipmentsObj.shipmentTimeLeftMs <= 1800000) { //30min
            shipmentsObj.dateClass = "classRed";
        } else if (shipmentsObj.shipmentTimeLeftMs <= 3600000 && shipmentsObj.shipmentTimeLeftMs > 1800000) { //30min - 1h
            shipmentsObj.dateClass = "classOrange";
        } else { // > 1hod
            shipmentsObj.dateClass = "classGreen";
        }
        shipmentsArr.push(shipmentsObj);
        shipmentsArr.sort(sortArray);
    }
    shipmentsArr.forEach(el => {
        if(el.openHu != '0'){
            shipmentsModel.oData.Shipments.push(el);
        }else shipmentsModel.oData.CompletedShipments.push(el);
    });
    that.getView().setModel(shipmentsModel);
    sap.ui.getCore().setModel(shipmentsModel, "globalModel");
}
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/model/jsonData",
    "sap/ui/core/Fragment",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, jsonData, Fragment) {
        "use strict";
        return Controller.extend("demo.controller.View1", {
            onInit: function () {
                this.data = new jsonData();
                const oModel = new sap.ui.model.json.JSONModel(this.data.returnData(26,80,61,5,0,98));
                const dataObj = oModel.oData.Shipments;
                const that = this;
                main(dataObj, that);
            },
            toggleFooter : function(oEvent) {
                const footerContent = this.getView().byId('footerContent');
                const footerBtn = this.getView().byId('footerBtn');
                const scrollContainer = this.getView().byId('scrollContainer');
                if (oEvent.getSource().getPressed()) {
                    footerBtn.setIcon('sap-icon://slim-arrow-down');
                    footerContent.setHeight('3rem');
                    scrollContainer.setHorizontal(true);
                    scrollContainer.setVertical(true);
                } else {
                    footerBtn.setIcon('sap-icon://slim-arrow-up');
                    footerContent.setHeight('0rem');
                    scrollContainer.setHorizontal(false);
                    scrollContainer.setVertical(false);
                }
            },
            onStartDemo : function() {
                this.getView().byId('startBtn').setEnabled(false);
                const that = this;
                const mainModel = this.getView().getModel();
                const shipmentsArr = [];
                for (const [key,value] of Object.entries(mainModel.oData.Shipments)) {
                    const shipmentsObj = {
                        Hall: value.hall,
                        Tknum: value.referenceNumber,
                        ShipperName: value.shipperName,
                        Signi: value.shipperNumber,
                        Kunwe: value.shipToParty,
                        Tdlnr: value.serviceAgent,
                        Asn: value.asnState,
                        Exti1: value.externalId_1,
                        Exti2: value.externalId_2,
                        PackInfo: value.packInfo,
                        PackType: value.packType,
                        Disponent: value.disponent,
                        shipmentDate: value.shipmentDate,     //Planned date for start of shipment
                        shipmentTime: value.shipmentTime,     // Planned transport start time
                        shipmentTimeLeft: value.timeLeft,
                        Dptbg : value.Dptbg,
                        Uptbg : value.Uptbg,
                        Tpbez: value.shipmentDescription,
                        ClosedHu: value.closedHu,
                        TotalHu: value.totalHu,
                        Meins: value.unitsOfMeasure,   //Base Unit of Measure
                        CustomerName: value.customerName,
                        Ablad: value.unloadingPoint,
                        state: 'None',
                        class: '',
                        asnClass: '',
                        dateClass: '', //custom keys and values -> pridani classy objektum
                        logo: ''
                    }
                    shipmentsArr.push(shipmentsObj)
                }
                const dataObj = shipmentsArr
                timer = setInterval(() => {
                    main(dataObj, that);
                    mainModel.updateBindings();
                    sap.ui.getCore().getModel("globalModel").updateBindings();
                }, 5000);
            },
            onStopDemo : function() {
                this.getView().byId('startBtn').setEnabled(true);
                stopTimer();
            },
            onLoadedPress: function (oEvent) {
                const selectedBtn = oEvent.getSource().getText();
                const row1 = oEvent.getSource().getParent().getParent().getItems();
                const vbox2 = row1[0].getItems()[2];
                const asnText = vbox2.getItems()[0].getItems()[1];
                asnText.setText("Odesláno");
                asnText.removeStyleClass("asnText");
                asnText.addStyleClass("asnTrue");
                oEvent.getSource().setEnabled(false);

            },
            onOpenDialog: function (oEvent) {
                const defaultModel = this.getView().getModel();
                const shipToParty = oEvent.getSource().getText();
                const sList = [];
                defaultModel.oData["selShipment"] = [];
                for (const [key, value] of Object.entries(defaultModel.oData.Shipments)) {
                    if (value.shipToParty == shipToParty) {
                        const obj = {
                            "tkNum": value.shipToParty,
                            "disponent": value.disponent,
                            "packType": value.packType,
                            "packInfo": value.packInfo
                        }
                        sList.push(obj);
                    }
                }
                sList.forEach(el => {
                    console.log(el);
                    defaultModel.oData.selShipment.push(el);
                });
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        controller: this,
                        name: "demo.view.Dialog"
                    });
                }
                this.pDialog.then(function (oDialog) {
                    const selShipment = defaultModel.oData.selShipment[0];
                    const fragmentModel = new sap.ui.model.json.JSONModel(selShipment);
                    oDialog.setModel(fragmentModel, "fragmentModel");
                    oDialog.open();
                });
            },
            onCloseDialog: function () {
                const defaultModel = this.getView().getModel();
                this.pDialog.then(function (oDialog) {
                    defaultModel.oData.selShipment = [];
                    oDialog.close();
                });
            },
            onNextView : function(){
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("completedShipments",true);
            }
        });
    });
