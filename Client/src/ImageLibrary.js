import React from 'react';
import './ImageLibrary.css';

export default class ImageLibrary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            object: {},
            categories: [],
            viewingCategory: false,
            currentCategory: ''
        }
        this.componentWillMount = this.componentWillMount.bind(this);
        this.handle = this.handle.bind(this);
        this.goBack = this.goBack.bind(this);
    }

    componentWillMount() {
        fetch('https://api.webwizards.me/v1/images').then((response) => {
            if(response.ok) {
                return response.json();
            } 
        }).then((object) => {
            this.setState({
                object: object
            })
        })
            .catch(err => {
                console.log('caught it!', err);
            })
    }

    handle(cat) {
        this.setState({
            viewingCategory: true,
            currentCategory: cat
        });
    }

    goBack() {
        this.setState({
            viewingCategory: false,
            currentCategory:''
        });
    }

    handleImageChoice(url) {
        console.log(url);
    }

    render() {
        var buttons = [];
        var images = [];
        if (!this.state.viewingCategory) {
            var categories = Object.keys(this.state.object);
            for (var i = 0; i < categories.length; i++) {
                var current = categories[i];
                buttons.push(<ImageLibraryButton key={current} category={current} handle={this.handle}/>);
            }
        }
        if (this.state.viewingCategory) {
            var imagesObj = this.state.object[this.state.currentCategory].images;
            for (var i = 0; i < imagesObj.length; i ++) {
                let url = imagesObj[i];
                images.push(<img className="library-preview" src={url} key={i} onClick={() => this.handleImageChoice(url)}/>);
            }
        }

        return (
            <div id="image-library-container">
                {!this.state.viewingCategory &&
                    <div>
                        <h2>Images</h2>
                        <div className="library-buttons-container">
                            {buttons}
                        </div>
                    </div>
                }
                {this.state.viewingCategory &&
                    <div>
                        <div className="library-top-bar">
                            <div id="library-back-button" className="disable-select" onClick={this.goBack}>&#x276e;</div>
                            <h2 className="library-category-header">{this.state.currentCategory}</h2>
                        </div>
                        <div className="library-images-container">
                            {images}
                        </div>
                    </div>
                }
            </div>
        );
    }
}

class ImageLibraryButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <button className="btn library-button" onClick={() => this.props.handle(this.props.category)}>
                {this.props.category}
            </button>
        );
    }
}