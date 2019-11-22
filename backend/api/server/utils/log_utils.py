LOGGING_ENABLED = True

def log_error(message: str):
    if LOGGING_ENABLED:
        print(f"SERVER ERROR: {message}")

def log_info(message: str):
    if LOGGING_ENABLED:
        print(f"SERVER INFO: {message}")
