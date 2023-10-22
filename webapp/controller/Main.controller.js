sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'com/destshar/prsr/controller/Base.controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Base, JSONModel, MessageToast) {
        'use strict';

        return Base.extend('com.destshar.prsr.controller.Main', {
            onInit: function () {
//                Base.prototype.onInit.apply(this);
                this.oViewData = {}
                this.oViewDataModel = new JSONModel(this.oViewData)
                this.getView().setModel(this.oViewDataModel, 'ViewData')
                
                this.oViewState = {
                    I18NVisible: false
                }
                this.oViewStateModel = new JSONModel(this.oViewState)
                this.getView().setModel(this.oViewStateModel, 'ViewState')
            },
            
            _parseXML: function(sXML) {
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(sXML,'text/xml');

                return xmlDoc
            },

            _getTags: function() {

            },

            _getAttributes: function() {

            },

            //------------------------------------------------------------------------
            //                              Create i18n
            //------------------------------------------------------------------------

            _createI18N: function() {
                this.oViewData.I18N = ''
                this.oViewDataModel.refresh()

                if(this._validateXML()) return

                let i18nCandidates = ['title', 'text', 'headerText']
                let aXML = this._parseXML(this.oViewData.Source)

                let sResult = ''
                
                Array.from(aXML.all).forEach(tag => {
                    let sTagName = tag.nodeName

                    let aAttributes = Array.from(tag.attributes).filter(attribute => 
                        i18nCandidates.some(candidate => attribute.nodeName.includes(candidate))
                    )
                    
                    aAttributes.forEach(attribute => {
                        if(!attribute.nodeValue.startsWith('{')) {
                            let sOriginalValue = attribute.nodeValue
                            let sPrefix = this._createPrefix(attribute.nodeName, sTagName)
                            let sPropertyName = sPrefix + attribute.nodeValue.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')

                            //TODO: sortowanie alfabetycznie, dzielenie na sekcje (buttony razem, labele razem itd.)

                            sResult += sPropertyName + '=' + sOriginalValue + '\n'
                            attribute.nodeValue = '{i18n>' + sPropertyName + '}'
                        }
                    })
                })

                this.oViewData.Result = aXML.documentElement.outerHTML
                this.oViewData.Result = this.oViewData.Result.replace(/&gt;/g, '>')
                this.oViewData.I18N = sResult
                this.oViewDataModel.refresh()
            },

            _createPrefix: function(sNodeName, sTagName) {
                let sPrefix

                switch(sNodeName) {
                    case 'text': 
                                switch(sTagName) {
                                    case 'Button':
                                            sPrefix = 'btn'
                                            break
                                    case 'RadioButton':
                                            sPrefix = 'rbt'
                                            break
                                    case 'Label':
                                            sPrefix = 'lbl'
                                            break
                                    case 'CheckBox':
                                            sPrefix = 'chb'
                                            break
                                            break
                                    case 'Text':
                                            sPrefix = 'txt'
                                            break
                                    default:
                                            sPrefix = 'txt'
                                }

                                break
                    case 'title':
                                sPrefix = 'ttl'
                                break
                    case 'headerText':
                                sPrefix = 'hdr'
                                break
                    case 'placeholder':
                                sPrefix = 'plh'
                                break
                    case 'tooltip':
                                sPrefix = 'ttp'
                                break
                }

                return sPrefix
            },

            //------------------------------------------------------------------------
            //                              Get all IDs
            //------------------------------------------------------------------------

            _getAllIDs: function() {
                if(this._validateXML()) return

                let aXML = this._parseXML(this.oViewData.Source)

                let sResult = ''
                
                Array.from(aXML.all).forEach(tag => {
                    Array.from(tag.attributes).forEach(attribute => {
                        if(attribute.nodeName === 'id') {
                            sResult += '"' + attribute.nodeValue + '",\n'
                        }
                    })
                })



                this.oViewData.Result = sResult.slice(0,-2)
                this.oViewDataModel.refresh()
            },

            //------------------------------------------------------------------------
            //                              Validate XML
            //------------------------------------------------------------------------

            _validateXML: function() {
                let aXML = this._parseXML(this.oViewData.Source)
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

            //------------------------------------------------------------------------
            //                              Get required fields' IDs
            //------------------------------------------------------------------------

            _getRequiredFieldsIDs: function() {
                this.oViewData.Result = 'Functionality in development'
                this.oViewDataModel.refresh()
                return

                if(this._validateXML()) return

                let aXML = this._parseXML(this.oViewData.Source)

                let sResult = ''
                
                Array.from(aXML.all).forEach((tag, index, tags) => {
                    Array.from(tag.attributes).forEach(attribute => {
                        if(attribute.nodeName === 'required' && attribute.nodeValue) {
                            // jak znaleźć wszystkie pola podpadające pod labelkę z 'required'?
                        }
                    })
                })

                this.oViewData.Result = sResult.slice(0,-2)
                this.oViewDataModel.refresh()
            },

            //----------------------------------------------------------------------
            //                              Events
            //----------------------------------------------------------------------
            
            onOptionSelect: function(oEvent) {
                this.vSelectedOption = oEvent.getSource().getSelectedIndex()
                this.oViewData.Result = ''
                this.oViewData.I18N = ''
                this.oViewDataModel.refresh()

                if(this.vSelectedOption === 0) this.oViewState.I18NVisible = true
                else this.oViewState.I18NVisible = false
 
                this.oViewStateModel.refresh()
            },

            onProcess: function(oEvent) {
                switch(this.vSelectedOption) {
                    case 0: this._createI18N()
                            break
                    case 1: this._getAllIDs()
                            break
                    case 2: this._getRequiredFieldsIDs()
                            break
                    case 3: this._validateXML()
                            break
                    default: MessageToast.show('Select option first')
                }                
            },

            //-----------------------------------------------------------------------

            onSourcePaste: function(oEvent) {
                
            },
        });
    });