var CognitoUser = AmazonCognitoIdentity.CognitoUser;
var AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

var poolData  = {
    UserPoolId: "us-west-2_XMbIozUhu",
    ClientId: "690fin3rp1u9hrhhbi360uvpnl"
};

function authAjax(url, ajaxData, processUsernameCallback, afterResponseCallback) {
    let userPool = new CognitoUserPool(poolData);
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
