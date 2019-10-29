import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode

import server
from server.cognito import cognito_config

def validate_token(token: str):
    return __decode_token(token)

def __construct_error(message: str):
    return {"error": message}

def __decode_token(token: str):
    keys = server.cognito_keys["keys"]

    # get the kid from the headers prior to verification
    try:
        headers = jwt.get_unverified_headers(token)
    except:
        return __construct_error("No JWT token specified or invalid")

    kid = headers['kid']
    # search for the kid in the downloaded public keys
    matching_key = next(k for k in keys if k["kid"] == kid)
    if not matching_key:
        return __construct_error('Public key not found in jwks.json')

    # construct the public key
    public_key = jwk.construct(matching_key)
    # get the last two sections of the token,
    # message and signature (encoded in base64)
    message, encoded_signature = str(token).rsplit('.', 1)
    # decode the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
    # verify the signature
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        return __construct_error('Signature verification failed')

    print('Signature successfully verified')
    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(token)
    # additionally we can verify the token expiration
    if time.time() > claims['exp']:
        return __construct_error('Token is expired')

    # and the Audience  (use claims['client_id'] if verifying an access token)
    if claims['client_id'] != cognito_config.APP_CLIENT_ID:
        return __construct_error('Token was not issued for this audience')

    # now we can use the claims
    return claims
