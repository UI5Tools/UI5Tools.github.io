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
                    I18NVisible: false,
                    ValidXML: false
                }
                this.oViewStateModel = new JSONModel(this.oViewState)
                this.getView().setModel(this.oViewStateModel, 'ViewState')
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
                let sXML = oEvent.getSource().getValue()

                if(this._validateXML(sXML)) {
                    this.oViewData.Controls = []
                    this.oViewDataModel.refresh()
                    this.oViewState.ValidXML = false
                    this.oViewStateModel.refresh()
                    return
                }

                let aTags = this._getTags(this._parseXML(sXML))
                let aControls = new Set()

                aTags.forEach(oTag => {
                    aControls.add(oTag.nodeName)
                })

                if(aControls.has("parsererror")) {
                    this.oViewData.Controls = []
                    this.oViewDataModel.refresh()
                    this.oViewState.ValidXML = false
                    this.oViewStateModel.refresh()
                    return
                } else {
                    this.oViewData.Controls = Array.from(aControls).sort().map(sControl => {return {Name: sControl, Checked: true}})
                    this.oViewDataModel.refresh()
                    this.oViewState.ValidXML = true
                    this.oViewStateModel.refresh()
                }
            },

            onGetAllIDs: function(oEvent) {
                this._getAllIDs()
            },

            //------------------------------------------------------------------------
            //                              Get all IDs
            //------------------------------------------------------------------------

            _getConsideredControls: function() {
                return this.oViewData.Controls.filter(item => item.Checked).map(item => item.Name)
            },

            _getAllIDs: function() {
                if(this._validateXML()) return

                let aXML = this._parseXML(this.oViewData.Source)
                let aConsideredControls = this._getConsideredControls()
                let sResult = ''
                
                if(this.oViewState.JSFriendly) {
                    Array.from(aXML.all).forEach(tag => {
                        if(aConsideredControls.includes(tag.nodeName)) {
                            Array.from(tag.attributes).forEach(attribute => {
                                if(attribute.nodeName === 'id') {
                                    sResult += '"' + attribute.nodeValue + '",\n'
                                }
                            })
                        }
                    })

                    this.oViewData.Result = sResult.slice(0,-2)
                } else {
                    Array.from(aXML.all).forEach(tag => {
                        if(aConsideredControls.includes(tag.nodeName)) {
                            Array.from(tag.attributes).forEach(attribute => {
                                if(attribute.nodeName === 'id') {
                                    sResult += attribute.nodeValue + ','
                                }
                            })
                        }
                    })

                    this.oViewData.Result = sResult.slice(0,-1)
                }

                this.oViewDataModel.refresh()
            },
        });
    });