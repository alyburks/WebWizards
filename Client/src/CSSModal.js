import React from 'react';
import { hashHistory } from 'react-router';
import './CreateModal.css';
import './CSSModal.css';
import OutsideAlerter from './OutsideAlerter';
import ColorPickerInput from './ColorPickerInput';

export default class CSSModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cssGroups: [],
            currAppliedCss: this.props.currBlock.css,
            viewingCategory: false,
            hidden: true,
            allCssGroupData: [],
            buttons: []
        };

        this.handle = this.handle.bind(this);
        this.goBack = this.goBack.bind(this);
        this.populateInputBoxes = this.populateInputBoxes.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    componentWillMount() {
        var that = this;
        fetch('https://api.webwizards.me/v1/htmlblocks?id=' + this.props.currBlock.blocktypeid, {
            method: 'GET',
        })
            .then(function (response) {

                if (response.ok) {
                    response.json().then(function (result) {
                        var cssGroups = result.css_groups;
                        var allCssGroupData;
                        if (cssGroups) {
                            fetch('https://api.webwizards.me/v1/cssgroups', {
                                method: 'GET',
                            })
                                .then((response) => {

                                    if (response.ok) {
                                        response.json().then(function (result2) {

                                            var buttons = [];
                                            var categories = cssGroups;
                                            for (var i = 0; i < categories.length; i++) {
                                                var current = categories[i];
                                                buttons.push(<CSSModalButton key={current} category={current} handle={that.handle}/>);
                                            }

                                            that.setState({
                                                buttons: buttons,
                                                cssGroups: cssGroups,
                                                allCssGroupData: result2
                                            });
                                        });


                                    } else {
                                        response.text().then(text => {
                                            console.log(text);
                                        });

                                    }
                                })
                                .catch(err => {
                                    console.log('caught it!', err);
                                });
                        }
                    });


                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('caught it!', err);
            });
    }

    populateInputBoxes(cat) {
        return new Promise((resolve, reject) => {
            var inputBoxes = [];
            // Find all attributes
            var attributes = [];
            for (let i = 0; i < this.state.allCssGroupData.length; i++) {
                if (this.state.allCssGroupData[i].name == cat) {
                    attributes = this.state.allCssGroupData[i].attributes;
                    break;
                }
            }
            // Attribute boxes
            /* this.state.currAppliedCss = [{attribute: "", value: ""}, {}] */
            for (let i = 0; i < attributes.length; i ++) {
                let defaultVal; 
                for (let k = 0; k < this.state.currAppliedCss.length; k++) {
                    if (attributes[i] == this.state.currAppliedCss[k].attribute) {
                        defaultVal = this.state.currAppliedCss[k].value;
                        break;
                    }
                }

                //Get all attribute data
                fetch('https://api.webwizards.me/v1/cssattributes?attr=' + attributes[i], {
                    method: 'GET',
                })
                    .then((response) => {

                        if (response.ok) { 
                            response.json().then((result) => {
                                inputBoxes.push(<CSSInputBox key={attributes[i]} name={attributes[i]} currentVal={defaultVal} object={result} handleChange={this.handleValueChange}/>);
                                if (inputBoxes.length == attributes.length) {
                                    resolve(inputBoxes);
                                }
                            });


                        } else {
                            response.text().then(text => {
                                console.log(text);
                                reject(text);
                            });

                        }
                    })
                    .catch(err => {
                        console.log('caught it!', err);
                        reject(err);
                    }); 
            }
        });
    }

    handle(cat) {
        this.populateInputBoxes(cat)
            .then((inputBoxes) => {
                this.setState({
                    inputBoxes: inputBoxes,
                    viewingCategory: true,
                    currentCategory: cat
                });
            });
    }

    goBack() {
        this.setState({
            viewingCategory: false,
            currentCategory:''
        });
    }

    handleValueChange(attribute, value) {
        //Grab current value
        var curr = this.state.currAppliedCss;
        var exists = false;

        for (let i = 0; i < curr.length; i ++) {
            if (curr[i].attribute == attribute) {
                exists = true;
                curr[i].value = value;
            }
        }

        if (!exists) {
            curr.push({attribute: attribute, value: value});
        }

        //Patch to API
        fetch('https://api.webwizards.me/v1/blocks?id=' + this.props.currBlock.id, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
            },
            body: JSON.stringify({
                'css': curr
            })
        })
            .then((response) => {

                if (response.ok) {
                    response.json().then((result) => {
                        console.log(curr);
                        this.props.handleChange(result);
                        this.setState({
                            currAppliedCss: curr
                        });
                    });
                } else {
                    response.text().then(text => {
                        console.log(text);
                    });

                }
            })
            .catch(err => {
                console.log('ERROR: ', err);
            });

    }

    render() {

        return (
            <div className="modal-container">
                <div className="modal-background">
                    <OutsideAlerter handler={(e) => this.props.toggle(e)}>
                        <div id="modal-popup" className="css-modal-popup">
                            {!this.state.viewingCategory &&
                                <div className="modal-buttons-container">
                                    <h2>Editing &lt;{this.props.currBlock.blocktype}&gt;</h2>
                                    {this.state.buttons}
                                </div>
                            }
                            {this.state.viewingCategory &&
                                <div>
                                    <div className="css-modal-top-bar">
                                        <div id="css-modal-back-button" className="disable-select" onClick={this.goBack}>&#x276e;</div>
                                        <h2 className="css-modal-category-header">{this.state.currentCategory}</h2>
                                    </div>
                                    {this.state.inputBoxes}
                                </div>
                            }
                        </div>
                    </OutsideAlerter>
                </div>

            </div>
        );
    }
}

class CSSModalButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <button className="btn css-modal-button" onClick={() => this.props.handle(this.props.category)}>
                {this.props.category}
            </button>
        );
    }
}

/*<CSSInputBox name={"color"} currentVal={"pink"} updateVal={this.updateVal} object={
    {
		"translation": "Text color",
		"description": "Changes the color of the text",
		"units": "rgb",
		"default": "black"
	}
}/> */

class CSSInputBox extends React.Component {
    constructor(props) {
        super(props);

        var currentVal;

        if (!this.props.currentVal) {
            currentVal = this.props.object.default;
        }
        else {
            currentVal = this.props.currentVal;
        }

        this.state = {
            value: currentVal
        }

        this.colorHandler = this.colorHandler.bind(this);
        this.valHandler = this.valHandler.bind(this);

    }

    colorHandler(val) {
        this.props.handleChange(this.props.name, val);
        this.setState({
                value: val
        });
    }

    valHandler(event) {
        this.props.handleChange(this.props.name, event.target.value);
        this.setState({
            value: event.target.value
        });
    }

    render() {

        var options = [];

        if (this.props.object.extra_options && this.props.object.extra_options.choices) {
            for (let i = 0; i < this.props.object.extra_options.choices.length; i ++) {
                options.push(<option value={this.props.object.extra_options.choices[i]} key={i}>
                                {this.props.object.extra_options.choices[i]}
                            </option>);
            }
        }

        return (
            <div className="css-input">
                <span className="css-input-title">{this.props.name}: </span>
                {this.props.object.units == 'rgb' &&
                    <ColorPickerInput default={this.state.value} handle={this.colorHandler}/>
                }
                {this.props.object.units == 'EO_choices' && this.props.object.extra_options.choices &&
                    <select className="css-select"  value={this.state.value} onChange={this.valHandler}>
                        {options}
                    </select>
                }
            </div>
        );

    }
}