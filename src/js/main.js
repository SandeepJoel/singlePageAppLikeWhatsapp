if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept();
    }
}
import io from 'socket.io-client';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { loginHandler, logOut } from './actions/index';
import { store } from './store/store';

// js helpers
var qs = function(selector){
  return document.querySelector(selector);
}
var element = function(id){
  return document.getElementById(id);
}

class App extends React.Component {
  constructor (props) {
    super (props);
  }
  render(){
    return(
      <div>
      { (this.props.loggedUser === '') ? <Login/> : <Chatscreen/> }
      </div>
    );
  }
}

// passing store state to 'App' component
let mapStateToPropsForApp = (state, ownProps) => ({
  loggedUser: state.loggedUser
});
App = connect(mapStateToPropsForApp)(App);

let Login = (props) => {
  return (
    <div className='container'>
        <div className="row">
          <div className="col-md-6 offset-md-3 col-sm-12 py-5" id='login'>
              <h1 className='text-center my-4'>Whatsapp web login</h1>
              <div className="form-group mb-4">
                  <label><h5>Username</h5></label>
                  <input type="text" placeholder="Enter Username" name="user_name" className="form-control"/>
              </div>
              <div className="form-group mb-4">
                  <label><h5>Password</h5></label>
                  <input type="password" placeholder="Enter Password" onKeyPress={(e) => e.key === 'Enter' ? props.loginHandler(qs('input[name=user_name').value, qs('input[name=password').value) : false } name="password" className="form-control"/>
              </div>
              <div className="form-group" style={{marginTop: '30px'}}>
                  <button id='login-button' onClick={() => props.loginHandler(qs('input[name=user_name').value, qs('input[name=password').value)}>Log In</button>
              </div>
          </div>
      </div>
    </div>
  );
};

const mapDispatchToPropsForLogin = {
  loginHandler,
}
Login = connect(null, mapDispatchToPropsForLogin)(Login);

class Chatscreen extends React.Component{
  constructor (props) {
    super (props);
    this.state = {
      friendsList: [],
      selectedFriend: '',
      activeChatMessages: []
    }

    // socket client instance
    Chatscreen.socket = io();
    Chatscreen.socket.on('connect', () => {
      console.log('Socket ' + Chatscreen.socket.id + ' is trying to connect from web-page');
    });

    Chatscreen.socket.on('message-history', (data) => {
      if(data['message-history']) {
        this.setState({ activeChatMessages: data['message-history'] });
      }
    });

    Chatscreen.socket.on('roomchat-output', (data) => {
      this.setState({
        activeChatMessages: [...this.state.activeChatMessages, data]
      })
  });
 }

  sendMessage () {
    // Emit to server input -- only when 'Friend is selected' and Textarea has value
    if (this.state.selectedFriend == ''){
      return;
    }
    let message =  this.refs.textarea.value; // Uncontrolled input with refs are used here because function is called only on 'click' event
    this.refs.textarea.value = '';
    if (message !== '') {
      Chatscreen.socket.emit('roomchat-input', {
          name: this.props.loggedUser,
          message: message,
      });
    }

  }

  selectFriend(selectedFriend) {
    this.setState({ selectedFriend })
    var roomData = {
      'friend': selectedFriend,
      'user': this.props.loggedUser
    }
    Chatscreen.socket.emit('update-room', roomData);
  }

  componentWillMount() {
  }

  // gets called after the first render takes place...
  componentDidMount() {
    axios.post('/api/fetch_users')
    .then((response) => {
      if (response.data.users) {
        this.setState({ friendsList: response.data.users.filter((individual_user) => individual_user.name !== this.props.loggedUser )});
      }
    })
    .catch(function(error){
      throw error
    });
  }

  render(){
    return(
      <div className='container'>
        <div className='row' id='app'>
            <div className="col-md-4 my-5 pt-5" id='search-section'>
                { (new Date()).toLocaleTimeString() }
                <div id='users-list'>
                {
                 this.state.friendsList && this.state.friendsList.map((friend, index) => {
                  return(
                    <div key={index}>
                      <a className={(this.state.selectedFriend && this.state.selectedFriend === friend.name) ? 'switch-rooms active': 'switch-rooms'} href='#' onClick={this.selectFriend.bind(this, friend.name)}>
                        {friend.name}
                      </a>
                    </div>
                  );
                })
                }
                </div>
            </div>
            <div className="col-md-8 my-5" id='chat-section'>
                <div className='row'>
                    <div className="col-md-9">
                        <h2>
                            Welcome
                            <span id='user'> {this.props.loggedUser}</span>
                        </h2>
                    </div>
                    <div className="col-md-3">
                        <button className='float-right' onClick={this.props.logOut}>
                            Signout
                        </button>
                    </div>
                </div>
                <div id="chat" className='mb-5 row'>
                    <div className="col-md-12">
                        <div className="card mt-4">
                          <div id="messages" className="card-block">
                            { (new Date()).toLocaleTimeString() }
                            { this.state.activeChatMessages.length > 0 && this.state.activeChatMessages.map((chatMessage, index) => {
                              return (
                                <div className='chat' key={index}>
                                  <div className='user-name'>
                                    {chatMessage.name}
                                  </div>
                                  <div className='user-message'>
                                    {chatMessage.message}
                                  </div>
                                </div>
                              );
                              })
                            }
                            { this.state.activeChatMessages && this.state.activeChatMessages.length === 0 && <h4 className='mt-3 ml-3'>No chats to display...</h4>}
                          </div>
                        </div>
                        <textarea ref="textarea" className="form-control my-4" placeholder="Enter message..." onKeyPress={(e) => e.key === 'Enter' ? this.sendMessage.call(this): false }></textarea>
                        <button id='send-message' onClick={() => this.sendMessage.call(this)}>Send Message</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToPropsForChatscreen = {
  logOut
}

const mapStateToPropsForChatscreen = (state, ownProps) => ({
  loggedUser: state.loggedUser
});

Chatscreen = connect(mapStateToPropsForChatscreen, mapDispatchToPropsForChatscreen)(Chatscreen);

ReactDOM.render(
<Provider store={store}>
  <App/>
</Provider>
, document.getElementById('root'));
