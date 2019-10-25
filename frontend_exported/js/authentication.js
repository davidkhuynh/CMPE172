var CognitoUser = AmazonCognitoIdentity.CognitoUser;
var AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

var GLOBALS = {
    poolData: {
        UserPoolId: "us-west-2_XMbIozUhu",
        ClientId: "690fin3rp1u9hrhhbi360uvpnl"
    },
};

function authAjax(url, ajaxData, processUsernameCallback, afterResponseCallback) {
    let userPool = new CognitoUserPool(GLOBALS.poolData);
    let cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession((error, session) => {
            if (error) {
                console.log("cognito session error: " + error);
                return;
            }
            if (session) {
                processUsernameCallback(cognitoUser.username);
            }
        });
    }

    ajaxData.accessToken = cognitoUser.signInUserSession.accessToken.jwtToken;

    $.post(url, ajaxData)
        .done((responseData) => {
            afterResponseCallback(responseData);
        });
}


function authAjaxWithFile(url, file, otherFields, processUsernameCallback, afterResponseCallback) {
    let fd = new FormData();
    fd.append(fileField, file);
    let data = [];
    data.push(otherFields);
    fd.append("data", JSON.stringify(data));
    authAjax(url, data, processUsernameCallback, afterResponseCallback);
}

function wrapCallback(callback){
    return {
        onFailure: (err)=>{callback(err, null);},
        onSuccess: (result)=>{callback(null, result);}
    };
}


function isLoggedIn() {
    let userPool = new CognitoUserPool(GLOBALS.poolData);
    let cognitoUser = userPool.getCurrentUser();
    return cognitoUser != null;
}


function getUser(userName){
    let userPool = new CognitoUserPool(GLOBALS.poolData);
    let cognitoUser = userPool.getCurrentUser();
    if (cognitoUser===undefined){
        let userData = {
            Username : userName,
            Pool : userPool
        };
        cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    }
    return cognitoUser;
}


function signUpUser(userName, userEmail, userPassword, callback) {
    let dataEmail = {
        Name : 'email',
        Value : userEmail
    };
    let dataName = {
        Name : 'preferred_username',
        Value : userName
    };
    let attributeList = [ new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail),
        new AmazonCognitoIdentity.CognitoUserAttribute(dataName) ];

    let userPool = new CognitoUserPool(GLOBALS.poolData);
    userPool.signUp(userName, userPassword, attributeList, null, function(err, result){
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, result);
        }
    });
}

function signInUser(username, password, callback){
    let authenticationData = {
        Username : username, Password : password,
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    getUser(username).authenticateUser(authenticationDetails, wrapCallback(callback));
}


function signOutUser(){
    let userPool = new CognitoUserPool(GLOBALS.poolData);
    let cognitoUser = userPool.getCurrentUser();
    if (cognitoUser){
        if (cognitoUser.signInUserSession){
            cognitoUser.signOut();
        }
    }
}

