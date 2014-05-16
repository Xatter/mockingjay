Description
-----------
This is a very simple web server and chat page. There is only one room, no logins, everyone can see what everyone else says.  This is intended for internal teams to deploy to the LAN when you can't use normal chat services like IRC or Hipchat because of security policies or whatever.

Incomplete list of Missing features:
------------------------------------
* Currently it keeps no logs
* Stores no user preferences
* No rooms
* No private messages
* No cat pictures (this is priority one to be fixed)

Installation
============

For a completely local installation on linux:

Mostly stolen from here http://forcecarrier.wordpress.com/2013/07/26/installing-pip-virutalenv-in-sudo-free-way/

Install setuptools first into user local

    $ wget https://bitbucket.org/pypa/setuptools/raw/bootstrap/ez_setup.py
    $ python ez_setup.py –user

Then Pip:

	$ curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
	$ python get-pip.py –user

Then Virtualenv:

	$ pip install –user virtualenv	

Add `~/.local/bin` to your `$PATH` variable

Then activate the virtualenv and install the requirements:

    $ virtualenv venv
    $ source venv/bin/activate (on windows it's > venv\Scripts\activate.bat)
    $ pip install -r requirements.txt

Then run and connect:

	$ python app.py

Point your browser to http://localhost:9000/
