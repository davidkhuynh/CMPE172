const GLOBALS = {
  poolData: {
    UserPoolId: "us-west-2_XMbIozUhu",
    ClientId: "690fin3rp1u9hrhhbi360uvpnl"
  },
};

// globals
const AUTH_STATE = {
  none: "none",
  authenticated: "authenticated"
};
let __userPool = new AmazonCognitoIdentity.CognitoUserPool(GLOBALS.poolData);

const Authentication = {
  __getCurrentToken: () => {
    return localStorage.getItem("currentToken");
  },

  __clearToken: () => {
    localStorage.removeItem("currentToken");
  },

  __setCurrentUser: (cognitoUser) => {
    localStorage.setItem("currentToken", cognitoUser.signInUserSession.accessToken.jwtToken);
  },

  refreshSession() {
    let cognitoUser = __userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          Authentication.signOutUser();
          return;
        }
        console.log(session);
        Authentication.__setCurrentUser(cognitoUser);
      });
      return;
    }

    // no cognito user, logout
    Authentication.signOutUser();
  },

  authAjax: (url, ajaxData, afterResponseCallback) => {
    Authentication.refreshSession();
    ajaxData.accessToken = Authentication.__getCurrentToken();
    $.post(url, ajaxData)
      .done((responseData) => {
        afterResponseCallback(responseData);
      });
  },

  authAjaxWithFile: (url, file, fileField, otherFields, processUsernameCallback, afterResponseCallback) => {
    let fd = new FormData();
    fd.append(fileField, file);
    let data = [];
    data.push(otherFields);
    fd.append("data", JSON.stringify(data));
    Authentication.authAjax(url, data, processUsernameCallback, afterResponseCallback);
  },


  getAuthState: () => {
    return Authentication.__getCurrentToken() != null ? AUTH_STATE.authenticated : AUTH_STATE.none;
  },


  signUpUser: (username, userEmail, userPassword, callback) => {
    let dataEmail = {
      Name: 'email',
      Value: userEmail
    };
    let dataName = {
      Name: 'preferred_username',
      Value: username
    };
    let attributeList = [new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail),
      new AmazonCognitoIdentity.CognitoUserAttribute(dataName)];

    __userPool.signUp(username, userPassword, attributeList, null, function (err, result) {
      if (err) {
        callback(err, null);
      }
      else {
        callback(null, result);
      }
    });
  },


  resendConfirmationCode: (username, callback) => {
    let userData = {
      Username: username,
      Pool: __userPool
    };
    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.resendConfirmationCode(callback);
  },

  confirmUser: (username, code, callback) => {
    let userData = {
      Username: username,
      Pool: __userPool
    };
    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, callback);
  },


  signInUser: (username, password, callback) => {
    let authenticationData = {
      Username: username, Password: password,
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    let userData = {
      Username: username,
      Pool: __userPool
    };
    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        Authentication.__setCurrentUser(cognitoUser);
        callback(null, result);
      },
      onFailure: (err) => {
        console.log(err); // todo: error banner
        callback(err, null);
      }
    });
  },


  signOutUser: () => {
    let cognitoUser = __userPool.getCurrentUser();
    if (cognitoUser != null) {
      cognitoUser.signOut();
    }
    // clear current user
    Authentication.__clearToken();
  }
};

