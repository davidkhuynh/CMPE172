import time
from jose import jwk, jwt
from jose.utils import base64url_decode
from dataclasses import dataclass
from functools import wraps
from flask import request

import server
from server.secrets import cognito_config
from server.utils.http_utils import failure
from server.utils.log_utils import log_error


@dataclass
class CognitoConfig(object):
    region: str
    user_pool_id: str
    app_client_id: str


class Cognito(object):
    def __init__(self, config: CognitoConfig):
        self._config = config
        self._claims = {}

    def validate_token(self, token: str):
        return self._decode_token(token)

    def auth_required(self, route):
        @wraps(route)
        def inside(*args, **kwargs):
            access_token = request.headers.get("Authorization").split()[1]
            if self._decode_token(access_token):
                return route(*args, **kwargs)
            return failure("failure to verify authorization token", 401)
        return inside

    @property
    def current_user(self):
        if not self._claims or "username" not in self._claims:
            return None
        return self._claims["username"]

    def _construct_error(self, message: str):
        log_error(message)
        return False

    def _decode_token(self, token: str):
        keys = server.cognito_keys["keys"]

        # get the kid from the headers prior to verification
        try:
            headers = jwt.get_unverified_headers(token)
        except:
            return self._construct_error("No JWT token specified or invalid")

        kid = headers['kid']
        # search for the kid in the downloaded public keys
        matching_key = next(k for k in keys if k["kid"] == kid)
        if not matching_key:
            return self._construct_error('Public key not found in jwks.json')

        # construct the public key
        public_key = jwk.construct(matching_key)
        # get the last two sections of the token,
        # message and signature (encoded in base64)
        message, encoded_signature = str(token).rsplit('.', 1)
        # decode the signature
        decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
        # verify the signature
        if not public_key.verify(message.encode("utf8"), decoded_signature):
            return self._construct_error('Signature verification failed')

        print('Signature successfully verified')
        # since we passed the verification, we can now safely
        # use the unverified claims
        self._claims = jwt.get_unverified_claims(token)
        # additionally we can verify the token expiration
        if time.time() > self._claims['exp']:
            return self._construct_error('Token is expired')

        # and the Audience  (use claims['client_id'] if verifying an access token)
        if self._claims['client_id'] != self._config.app_client_id:
            return self._construct_error('Token was not issued for this audience')

        return True
