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
            },

            _validateXML: function(sXML) {
                let aXML = this._parseXML(sXML ? sXML : this.oViewData.Source)
                let aXMLTags = Array.from(aXML.all)
                let bErrors = true

                let sResult = ''
                
                aXMLTags.forEach(tag => {
                    if(tag.nodeName === 'parsererror') {
                        sResult += tag.innerText + '\n\n'
                    }
                })

                if(sResult === '') {
                    sResult = 'No errors found'
                    bErrors = false
                }

                sResult = sResult.replaceAll('Below is a rendering of the page up to the first error.', '')

                this.oViewData.Result = sResult
                this.oViewDataModel.refresh()

                return bErrors
            },

            _parseXML: function(sXML) {
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(sXML,'text/xml');

                return xmlDoc
            },

            _getTags: function(aXML) {
                return Array.from(aXML.all)
            },

            _getAttributes: function(oTag) {
                Array.from(oTag.attributes)
            },
        });
    });
