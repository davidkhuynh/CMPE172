# fumblr

<b>University Name:</b> San Jose State University

<b>Course:</b> Enterprise Software

<b>Professor:</b> Sanjay Garje

<b>Team Members</b>
- [Jeremiah Grande](https://www.linkedin.com/in/jeregrande/)
- [David Huynh](https://www.linkedin.com/in/david-huynh-101784194/)
- [Sherwyn Sen](https://www.linkedin.com/in/sherwyn-sen-2b0a78151/)

## Project Introduction
The idea pursued for this project is fumblr — a re-envisioned blogging platform designed to streamline the online blogging process for bloggers of all skill levels. Fumblr’s creation followed a cloud-native approach, harnessing the many advantages that AWS offers.

## Features list
- Post Uploading with Images
- Editing Posts
- Deleting Posts
- Account Creation
- Email Confirmation
- Profile Pictures
- Followers/Following
- Searching of posts
- View all of a User's posts
- Random Post "Explore" View
- Tailored "Feed" View only showing posts from those you follow
- Automatic Tagging of Images using AWS Rekognition

## Screenshots
![Edit Post]https://i.ibb.co/51wC9xY/Selection-999-099.png)
![Own Profile](https://i.ibb.co/RQ3CB3B/Selection-999-100.png)
![Searching](https://ibb.co/s32Z8YX)

## Prerequisite Tools
- AWS Tools
  - S3
  - Cloudfront
  - Route 53
  - EC2 and Elastic Load Balancer
  - RDS
  - Rekognition
- Local Tools
  - [Python 3.6](https://www.python.org/downloads/release/python-369/)
  - [MariaDB](https://mariadb.org/) for running unit tests locally
  - [venv](https://docs.python.org/3/library/venv.html)
  - [pip](https://pypi.org/project/pip/) 
  - awscli
- secrets folder in backend/api/server
  - The files needed inside the secrets folder can be determined by running the backend and seeing which files are missing and what variables they contain
- Recommended: Linux or MacOS (not tested on Windows)
- Optional: PyCharm for easier debugging

## Local Setup
### Basic Setup
- Go to backend/api/server and run python3.6 -m venv venv to setup a virtual environment
- source venv/bin/activate to switch to the virtual environment
- pip install -r requirements.txt to install all dependencies
- python main.py to run the server
- simply open the .html pages in the frontend/ folder to use the site now

### Testing Setup
- Follow basic setup
- Set up MariaDB with a user called "fumblr_admin" with password "fumblr_admin"
- Grant the user all privileges to the database "fumblr"
- python tests.py to run the unit tests. all dots should appear for a pass and no "E" or "F"
- Useful for development.
