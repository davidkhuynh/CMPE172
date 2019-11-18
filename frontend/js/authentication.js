const GLOBALS = {
  poolData: {
    UserPoolId: "us-west-2_XMbIozUhu",
    ClientId: "690fin3rp1u9hrhhbi360uvpnl"
  },
};

let __userPool = new AmazonCognitoIdentity.CognitoUserPool(GLOBALS.poolData);

const Authentication = {
  __getCurrentToken: () => {
    return localStorage.getItem("currentToken");
  },

  __cleanup: () => {
    localStorage.removeItem("currentToken");
    localStorage.removeItem("currentUsername");
  },

  __setCurrentUser: (cognitoUser) => {
    localStorage.setItem("currentToken", cognitoUser.signInUserSession.accessToken.jwtToken);
    localStorage.setItem("currentUsername", cognitoUser.getUsername());
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

  /* args:
   {
    url:
    method:
    data:
    onSuccess:
    onFailure:
   }
   */
  authAjax: (arg) => {
    Authentication.refreshSession();
    $.ajax({
      xhrFields: {
        withCredentials: true
      },
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Basic " + Authentication.__getCurrentToken());
        xhr.setRequestHeader("Access-Control-Allow-Credentials", true);
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      url: arg.url,
      type: arg.type,
      data: JSON.stringify(arg.data),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
    }).done(arg.onSuccess).fail(arg.onFailure);
  },

  /* args:
    url:
    method:
    file:
    fileField:
    otherFields:
    onSuccess:
    onFailure:
   */
  authAjaxWithFile: (arg) => {
    let fd = new FormData();
    fd.append(arg.fileField, arg.file);
    let data = [];
    data.push(arg.otherFields);
    fd.append("data", JSON.stringify(data));
    Authentication.authAjax(url, "POST", data, arg.onSuccess, arg.onFailure);
  },


  isAuthenticated: () => {
    Authentication.refreshSession();
    return Authentication.__getCurrentToken() != null;
  },


  getCurrentUsername: () => {
    if (!Authentication.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem("currentUsername");
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
    Authentication.__cleanup();
  }
};

