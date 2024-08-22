import styled from "styled-components";

export const ChatContainer = styled.div`
    display: block;
    position:fixed;
    top:0px;
    left:0px;
    width: 100%;
    height: 100vh;
    background: #ccc;
    position: relative;
    background: linear-gradient(135deg, #044f48, #2a7561);
    background-size: cover;
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    line-height: 1.3;
    overflow: hidden;
`

export const Bg = styled.div`
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    background: url('https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center 100%;
    filter: blur(40px);
    transform: scale(1.2);
`

export const Chat = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);    
    width: 400px;
    height: 70vh;
    max-height: 450px;
    z-index: 2;
    overflow: hidden;
    box-shadow: 0 5px 30px rgba(0, 0, 0, .2);
    background: rgba(0, 0, 0, .5);
    border-radius: 20px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
`


export const ChatHead = styled.div `
    flex: 0 1 45px;
    position: relative;
    z-index: 2;
    background: rgb(255 255 255);
    color: #000;
    text-transform: uppercase;
    text-align: left;
    padding: 10px 10px 10px 50px;
    
    h1, h2 {
      font-weight: normal;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }
    
    h2 {
      color: #010101;
      font-size: 10px;
      letter-spacing: 1px;
    }
    
    .avatar {
      position: absolute;
      z-index: 1;
      top: 8px;
      left: 9px;
      border-radius: 30px;
      width: 30px;
      height: 30px;
      overflow: hidden;
      margin: 0;
      padding: 0;
      border: 2px solid rgba(255, 255, 255, 0.24);
      
      img {
        width: 100%;
        height: auto;
      }
    }
 ` 



export const Messages = styled.div `
    flex: 1 1 auto;
    overflow: hidden;
    position: relative;
    width: 100%;
    background: rgba(255, 255, 255, .0);

    
    & .messages-content {
      position: absolute;
      top: 0;
      left: 0;
      height: 101%;
      width: 100%;
      padding:10px 0px;

      button {
        display:flex;
        z-index: 1;
        top: 9px;
        right: 10px;
        color: #fff;
        border: none;
        background: #6fdeb4;
        font-size: 11px;       
        text-transform: uppercase;
        line-height: 1;
        padding: 10px 15px;
        border-radius: 10px;
        outline: none !important;
        transition: background .2s ease;
        margin: 10px 0px 5px 0px;
      }

      a {
        display:flex;
        z-index: 1;
        top: 9px;
        right: 10px;
        color: #2a2a2a;
        border: none;
        background: #fff;
        font-size: 11px;
        text-transform: uppercase;
        line-height: 1;
        padding: 10px 15px;
        border-radius: 10px;
        outline: none !important;
        transition: background .2s ease;
        margin: 10px 0px 5px 0px;
      }

    }
  
    
    .message {
      clear: both;
      float: left;
      padding: 6px 10px 7px;
      border-radius: 0px 10px  10px  10px;
      background: rgba(255, 255, 255, 0.1);
      color:#fff;
      margin: 10px 0;
      font-size: 13px;
      line-height: 1.4;
      margin-left: 35px;
      position: relative;
      max-width:330px;
      text-align:left;
      //text-shadow: 0 1px 1px rgba(0, 0, 0, .2);
      
      .timestamp {
        position: absolute;
        bottom: -15px;
        font-size: 9px;
        color: rgba(255, 255, 255, .3);
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0px;
        border-right: 6px solid rgba(255, 255, 255, .1);
        left: -6px;
        border-bottom: 7px solid transparent;
      }
      
      .avatar {
        position: absolute;
        z-index: 1;
        bottom: -15px;
        left: -35px;
        border-radius: 30px;
        width: 30px;
        height: 30px;
        overflow: hidden;
        margin: 0;
        padding: 0;
        border: 2px solid rgba(255, 255, 255, 0.24);
  
        img {
          width: 100%;
          height: auto;
        }
      }
      
      &.message-personal {
        float: right;
        color: #fff;
        text-align: right;
        background: linear-gradient(120deg, #248A52, #257287);
        border-radius: 10px 10px 0 10px;
        
        &::before {
          left: auto;
          right: 0;
          border-right: none;
          border-left: 5px solid transparent;
          border-top: 4px solid #257287;
          bottom: -4px;
        }
      }
      
      &:last-child {
        margin-bottom: 30px;
      }
      
      &.new {
        transform: scale(0);
        transform-origin: 0 0;
        animation: bounce 500ms linear both;
      }
      
      &.loading {
  
        &::before {
          @include ball;
          border: none;
          animation-delay: .15s;
        }
  
        & span {
          display: block;
          font-size: 0;
          width: 20px;
          height: 10px;
          position: relative;
  
          &::before {
            @include ball;
            margin-left: -7px;
          }
  
          &::after {
            @include ball;
            margin-left: 7px;
            animation-delay: .3s;
          }
        }
      }
      
    }
 `

export const MessageBox = styled.div `
    display:flex;
    flex: 0 1 40px;
    min-height:50px;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 10px 10px 50px;
    position: relative;
    align-items:center;
    
    & .message-input {
      background: none;
      border: none;
      outline: none!important;
      resize: none;
      color: #010101;
      font-size: 13px;
      height: 17px;
      margin: 0;
      padding-right: 20px;
      width: 300px;
    }
    
    textarea:focus:-webkit-placeholder{
        color: transparent;
    }
    
    & .message-submit {
      position: absolute;
      z-index: 1;
      top: 9px;
      right: 10px;
      color: #fff;
      border: none;
      background: #de6f8f;
      font-size: 12px;
      text-transform: uppercase;
      line-height: 1;
      padding: 10px 10px; 
      border-radius: 10px;
      outline: none!important;
      transition: background .2s ease;
      
      &:hover {
        background: #1D7745;
      }
    }
`
  