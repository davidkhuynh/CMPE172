const CognitoUser = AmazonCognitoIdentity.CognitoUser;
const AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

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
let __userPool = new CognitoUserPool(GLOBALS.poolData);


const wrapCallback = (callback) => {
  return {
    onFailure: (err) => {
      callback(err, null);
    },
    onSuccess: (result) => {
      callback(null, result);
    }
  };
};


const Authentication = {
  __getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("currentUser"));
  },

  __setCurrentUser: (username) => {
    let userData = {
      Username: username,
      Pool: __userPool
    };
    let currentUser = new AmazonCognitoIdentity.CognitoUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  },

  authAjax: (url, ajaxData, processUsernameCallback, afterResponseCallback) => {

    if (Authentication.__getCurrentUser() == null) {
      afterResponseCallback(false);
      return;
    }

    Authentication.__getCurrentUser().getSession((error, session) => {
      if (error) {
        console.log("cognito session error: " + error);
        return;
      }
      if (session) {
        processUsernameCallback(Authentication.__getCurrentUser().username);
      }
    });

    ajaxData.accessToken = Authentication.__getCurrentUser().signInUserSession.accessToken.jwtToken;

    $.post(url, ajaxData)
      .done((responseData) => {
        afterResponseCallback(responseData);
      });
  },

  authAjaxWithFile: (url, file, otherFields, processUsernameCallback, afterResponseCallback) => {
    let fd = new FormData();
    fd.append(fileField, file);
    let data = [];
    data.push(otherFields);
    fd.append("data", JSON.stringify(data));
    Authentication.authAjax(url, data, processUsernameCallback, afterResponseCallback);
  },

  getCurrentSession: () => {
    return Authentication.__getCurrentUser() ? Authentication.__getCurrentUser().signInUserSession : null;
  },

  getAuthState: () => {
    return Authentication.getCurrentSession() ? AUTH_STATE.authenticated : AUTH_STATE.none;
  },


  isLoggedIn: () => {
    if (Authentication.__getCurrentUser() == null)
      return false;
    return Authentication.__getCurrentUser().Session != null;
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
    Authentication.__setCurrentUser(username);
    Authentication.__getCurrentUser().resendConfirmationCode(callback);
  },

  confirmUser: (username, code, callback) => {
    Authentication.__setCurrentUser(username);
    Authentication.__getCurrentUser().confirmRegistration(code, true, callback);
  },


  signInUser: (username, password, callback) => {
    let authenticationData = {
      Username: username, Password: password,
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    Authentication.__setCurrentUser(username);
    console.log("currentUser: ");
    console.log(currentUser);
    let currentUser = Authentication.__getCurrentUser();
    currentUser.authenticateUser(authenticationDetails, wrapCallback(callback));
  },


  signOutUser: () => {
    if (Authentication.__getCurrentUser() != null) {
      if (Authentication.__getCurrentUser().signInUserSession) {
        console.log("signing out...");
        Authentication.__getCurrentUser().globalSignOut();
      }
    }

    // clear cache ourselves because amazon didnt do it...
    localStorage.clear();
  }

};

