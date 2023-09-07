sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("com.destshar.prsr.controller.Base", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter()
            }
        });
    });
