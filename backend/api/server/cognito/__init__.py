import json
import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode

import server
from server.cognito import cognito_config

def token_valid(token: str):
    return __decode_token(token)

def __decode_token(token: str):
    keys = server.cognito_keys["keys"]

    # get the kid from the headers prior to verification
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']
    # search for the kid in the downloaded public keys
    matching_key = next(k for k in keys if k["kid"] == kid)
    if not matching_key:
        print('Public key not found in jwks.json')
        return False
    # construct the public key
    public_key = jwk.construct(matching_key)
    # get the last two sections of the token,
    # message and signature (encoded in base64)
    message, encoded_signature = str(token).rsplit('.', 1)
    # decode the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
    # verify the signature
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        print('Signature verification failed')
        return False
    print('Signature successfully verified')
    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(token)
    # additionally we can verify the token expiration
    if time.time() > claims['exp']:
        print('Token is expired')
        return False
    # and the Audience  (use claims['client_id'] if verifying an access token)
    if claims['client_id'] != cognito_config.APP_CLIENT_ID:
        print('Token was not issued for this audience')
        return False
    # now we can use the claims
    print(claims)
    return claims